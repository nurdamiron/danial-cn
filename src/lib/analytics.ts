import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  EVENT_LABELS_RU,
  FUNNEL_STEPS,
  type EventType,
} from "@/lib/events";

/**
 * What the shop's day actually looked like.
 *
 * Two rules run through everything below.
 *
 * First, no number is shown alone. "Seven orders" is not information until it
 * sits next to the seven days before it — the owner cannot act on a figure
 * they cannot compare, and every count here carries the same span from the
 * previous period.
 *
 * Second, the funnel counts *visits*, not events. Someone who reloads a
 * product page three times wanted one bag, and counting the reloads would
 * quietly widen the top of the funnel and make the drop-off below it look
 * like a smaller problem than it is.
 */

const DAY_MS = 86_400_000;

/**
 * Behaviour data is the part of this page that can be absent.
 *
 * Orders and the catalogue are load-bearing — if those cannot be read the
 * panel has nothing to show and should say so. The event table is different:
 * it arrives with a migration, and until that has run every query against it
 * fails. Losing the whole dashboard over the newest section on it would be a
 * poor trade, so the shop keeps its money and its orders and the funnel says
 * it has nothing yet.
 */
async function optional<T>(query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query;
  } catch {
    return fallback;
  }
}

/** Orders that were called off are not revenue and never count as sales. */
function sold() {
  return { status: { notIn: ["cancelled"] } };
}

export type Period = { days: number; from: Date; until: Date; prevFrom: Date };

export function period(days: number): Period {
  const until = new Date();
  const from = new Date(until.getTime() - days * DAY_MS);
  return { days, from, until, prevFrom: new Date(from.getTime() - days * DAY_MS) };
}

export type Trend = {
  current: number;
  previous: number;
  /** Null when there is no previous figure to grow from. */
  deltaPct: number | null;
};

export function trend(current: number, previous: number): Trend {
  if (previous <= 0) return { current, previous, deltaPct: null };
  return {
    current,
    previous,
    deltaPct: Math.round(((current - previous) / previous) * 100),
  };
}

export type DayPoint = { date: string; revenue: number; orders: number };

/** One point per day, zeros included — a gap in a chart reads as missing data. */
export function toSeries(
  rows: { createdAt: Date; totalKzt: number }[],
  p: Period,
): DayPoint[] {
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < p.days; i++) {
    const day = new Date(p.from.getTime() + i * DAY_MS);
    byDay.set(day.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const slot = byDay.get(key);
    if (!slot) continue;
    slot.revenue += row.totalKzt;
    slot.orders += 1;
  }
  return [...byDay.entries()].map(([date, v]) => ({ date, ...v }));
}

export type FunnelStep = {
  type: EventType;
  label: string;
  visits: number;
  /** Share of the widest step, so the shape of the funnel is readable. */
  ofTopPct: number;
  /** How many of the previous step did not reach this one. */
  lostPct: number | null;
};

/**
 * Distinct visits per step, in SQL.
 *
 * Prisma cannot express COUNT(DISTINCT …), and the alternative — grouping by
 * (type, visitId) and counting the rows in JS — pulls one row per visit into
 * memory. That is fine on the first week's data and quietly stops being fine
 * later.
 */
async function visitsByStep(from: Date, until: Date) {
  const rows = await prisma.$queryRaw<{ type: string; visits: bigint | number }[]>(
    Prisma.sql`
      SELECT "type", COUNT(DISTINCT "visitId") AS visits
      FROM "Event"
      WHERE "createdAt" >= ${from} AND "createdAt" < ${until}
      GROUP BY "type"
    `,
  );
  return new Map(rows.map((r) => [r.type, Number(r.visits)]));
}

export function toFunnel(counts: Map<string, number>): FunnelStep[] {
  const top = counts.get(FUNNEL_STEPS[0]) ?? 0;
  return FUNNEL_STEPS.map((type, i) => {
    const visits = counts.get(type) ?? 0;
    const prev = i === 0 ? null : (counts.get(FUNNEL_STEPS[i - 1]) ?? 0);
    return {
      type,
      label: EVENT_LABELS_RU[type],
      visits,
      ofTopPct: top > 0 ? Math.round((visits / top) * 100) : 0,
      lostPct:
        prev === null || prev === 0
          ? null
          : Math.round(((prev - visits) / prev) * 100),
    };
  });
}

export type ProductRow = {
  slug: string;
  views: number;
  cartAdds: number;
  orders: number;
  revenue: number;
  /** Of everyone who opened the page, how many left for WhatsApp with it. */
  conversionPct: number | null;
};

/**
 * The catalogue, judged by what visitors did with it.
 *
 * A product with many views and no orders is the most useful row on the
 * dashboard: the shop is paying to send people to a page that does not sell,
 * and no count of orders alone can show that.
 */
async function productRows(from: Date, until: Date): Promise<ProductRow[]> {
  const [events, soldRows] = await Promise.all([
    // Wrapped on its own so a catalogue table still shows what sold even
    // before the event table exists; the behaviour columns simply read zero.
    optional(
      prisma.$queryRaw<
        { slug: string; type: string; visits: bigint | number }[]
      >(Prisma.sql`
      SELECT "slug", "type", COUNT(DISTINCT "visitId") AS visits
      FROM "Event"
      WHERE "slug" IS NOT NULL
        AND "createdAt" >= ${from} AND "createdAt" < ${until}
      GROUP BY "slug", "type"
    `),
      [],
    ),
    // Raw for the same reason as above: revenue is the sum of a price times a
    // quantity, which groupBy cannot express — it can total a column, not a
    // product of two. Counting orders rather than lines, so a customer who
    // took two of the same bag is one order, not two.
    prisma.$queryRaw<
      { slug: string; orders: bigint | number; revenue: bigint | number }[]
    >(Prisma.sql`
      SELECT i."slug",
             COUNT(DISTINCT i."orderId") AS orders,
             SUM(i."unitPriceKzt" * i."qty") AS revenue
      FROM "OrderItem" i
      JOIN "Order" o ON o."id" = i."orderId"
      WHERE o."createdAt" >= ${from} AND o."createdAt" < ${until}
        AND o."status" <> 'cancelled'
      GROUP BY i."slug"
    `),
  ]);

  const rows = new Map<string, ProductRow>();
  const row = (slug: string) => {
    const existing = rows.get(slug);
    if (existing) return existing;
    const fresh: ProductRow = {
      slug,
      views: 0,
      cartAdds: 0,
      orders: 0,
      revenue: 0,
      conversionPct: null,
    };
    rows.set(slug, fresh);
    return fresh;
  };

  for (const e of events) {
    const r = row(e.slug);
    if (e.type === "product_view") r.views = Number(e.visits);
    if (e.type === "cart_add") r.cartAdds = Number(e.visits);
  }
  for (const s of soldRows) {
    const r = row(s.slug);
    r.orders = Number(s.orders);
    // What was agreed at the time of sale, not what the price is today.
    r.revenue = Number(s.revenue ?? 0);
  }

  return [...rows.values()].map((r) => ({
    ...r,
    conversionPct: r.views > 0 ? Math.round((r.orders / r.views) * 100) : null,
  }));
}

export type SourceRow = { source: string; visits: number };

/** Where the visits came from. An empty host means the address was typed. */
async function sources(from: Date, until: Date): Promise<SourceRow[]> {
  const rows = await prisma.$queryRaw<
    { source: string; visits: bigint | number }[]
  >(Prisma.sql`
    SELECT "source", COUNT(DISTINCT "visitId") AS visits
    FROM "Event"
    WHERE "createdAt" >= ${from} AND "createdAt" < ${until}
    GROUP BY "source"
    ORDER BY visits DESC
    LIMIT 8
  `);
  return rows.map((r) => ({
    source: r.source || "Прямой заход",
    visits: Number(r.visits),
  }));
}

export type Dashboard = {
  period: Period;
  revenue: Trend;
  orders: Trend;
  averageOrder: Trend;
  visits: Trend;
  series: DayPoint[];
  funnel: FunnelStep[];
  products: ProductRow[];
  sources: SourceRow[];
  /** True once any event has ever been recorded. */
  hasEvents: boolean;
};

export async function getDashboard(days = 30): Promise<Dashboard> {
  const p = period(days);
  const window = { gte: p.from, lt: p.until };
  const prevWindow = { gte: p.prevFrom, lt: p.from };

  const [
    current,
    previous,
    rows,
    stepsNow,
    stepsPrev,
    products,
    sourceRows,
    eventCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalKzt: true },
      _count: { _all: true },
      where: { createdAt: window, ...sold() },
    }),
    prisma.order.aggregate({
      _sum: { totalKzt: true },
      _count: { _all: true },
      where: { createdAt: prevWindow, ...sold() },
    }),
    prisma.order.findMany({
      where: { createdAt: window, ...sold() },
      select: { createdAt: true, totalKzt: true },
      orderBy: { createdAt: "asc" },
    }),
    optional(visitsByStep(p.from, p.until), new Map<string, number>()),
    optional(visitsByStep(p.prevFrom, p.from), new Map<string, number>()),
    optional(productRows(p.from, p.until), []),
    optional(sources(p.from, p.until), []),
    optional(prisma.event.count(), 0),
  ]);

  const revenueNow = current._sum?.totalKzt ?? 0;
  const revenuePrev = previous._sum?.totalKzt ?? 0;
  const ordersNow = current._count._all;
  const ordersPrev = previous._count._all;

  return {
    period: p,
    revenue: trend(revenueNow, revenuePrev),
    orders: trend(ordersNow, ordersPrev),
    averageOrder: trend(
      ordersNow > 0 ? Math.round(revenueNow / ordersNow) : 0,
      ordersPrev > 0 ? Math.round(revenuePrev / ordersPrev) : 0,
    ),
    visits: trend(
      stepsNow.get("store_view") ?? 0,
      stepsPrev.get("store_view") ?? 0,
    ),
    series: toSeries(rows, p),
    funnel: toFunnel(stepsNow),
    products: products.sort((a, b) => b.views - a.views),
    sources: sourceRows,
    hasEvents: eventCount > 0,
  };
}
