import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { formatKzt } from "@/lib/money";
import { getDashboard } from "@/lib/analytics";
import { Delta } from "@/components/admin/dashboard/Delta";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { Funnel } from "@/components/admin/dashboard/Funnel";
import {
  ProductTable,
  type NamedProductRow,
} from "@/components/admin/dashboard/ProductTable";
import {
  PeriodTabs,
  readPeriod,
} from "@/components/admin/dashboard/PeriodTabs";

/**
 * The shop's day, in the order the owner needs it.
 *
 * Money first and large, because that is the question they came to ask. Then
 * the funnel, which is the only thing here that explains *why* the money did
 * what it did. Then the catalogue, which says what to do about it. The
 * operational list is last, not because it matters least but because it is
 * the part they will already have seen — the orders tab carries a badge.
 *
 * Nothing on this page is a bare number. Every figure is either compared with
 * the period before it or measured against the step above it.
 */

/** Sections are separated by width and weight, not by one card per number. */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="t-label text-muted">{title}</h2>
        {hint ? <p className="text-[0.8125rem] text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

async function operations() {
  const { prisma } = await import("@/lib/prisma");
  const [newOrders, recent, outOfStock, drafts, failed24h] = await Promise.all([
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.findMany({
      where: { status: "new" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        number: true,
        customerName: true,
        city: true,
        totalKzt: true,
        createdAt: true,
      },
    }),
    prisma.productVariant.count({ where: { stock: { lte: 0 } } }),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.loginAttempt.count({
      where: {
        action: "login",
        success: false,
        createdAt: { gte: new Date(Date.now() - 86_400_000) },
      },
    }),
  ]);
  return { newOrders, recent, outOfStock, drafts, failed24h };
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");

  if (!hasDatabase()) {
    return (
      <div className="space-y-6">
        <h1 className="t-display t-h2">Обзор</h1>
        <div className="card p-5">
          <p className="text-sm text-muted">
            База данных сейчас недоступна, поэтому заказы, покупатели и каталог
            не читаются. Сайт продолжает работать на последнем снимке каталога.
          </p>
        </div>
      </div>
    );
  }

  const days = readPeriod((await searchParams).days);
  const { prisma } = await import("@/lib/prisma");
  const [data, ops, catalogue] = await Promise.all([
    getDashboard(days),
    operations(),
    prisma.product.findMany({ select: { id: true, slug: true, nameRu: true } }),
  ]);

  const names = new Map(catalogue.map((p) => [p.slug, p]));
  const products: NamedProductRow[] = data.products.map((row) => ({
    ...row,
    name: names.get(row.slug)?.nameRu ?? row.slug,
    id: names.get(row.slug)?.id ?? null,
  }));

  return (
    <div className="space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-display t-h2">Обзор</h1>
          <p className="mt-1 text-sm text-muted">
            Здравствуйте, {user.name}. Всё, что вы здесь меняете, появляется на
            сайте через несколько секунд.
          </p>
        </div>
        <PeriodTabs active={days} />
      </header>

      {/* ——— Money. The one thing on this page that gets the dark band. ——— */}
      <section className="card-dark on-dark p-6 text-paper sm:p-8">
        <p className="t-label text-alu">Выручка за {days} дн.</p>
        <p className="t-display mt-2 text-[clamp(2.25rem,1.4rem+3.6vw,4rem)]">
          {formatKzt(data.revenue.current)}
        </p>
        <div className="mt-2">
          <Delta trend={data.revenue} days={days} onDark />
        </div>

        <RevenueChart series={data.series} />

        <div className="mt-7 grid gap-5 sm:grid-cols-3">
          {[
            { label: "Заказов", value: String(data.orders.current), trend: data.orders },
            {
              label: "Средний чек",
              value: formatKzt(data.averageOrder.current),
              trend: data.averageOrder,
            },
            { label: "Визитов", value: String(data.visits.current), trend: data.visits },
          ].map((m) => (
            <div key={m.label} className="border-t border-white/10 pt-3">
              <p className="t-label text-alu">{m.label}</p>
              <p className="t-display mt-1 text-2xl">{m.value}</p>
              <Delta trend={m.trend} days={days} onDark />
            </div>
          ))}
        </div>
      </section>

      {/* ——— Why the money did what it did ——— */}
      <Section
        title="Путь покупателя"
        hint={
          data.hasEvents
            ? "Считаются визиты, а не клики: перезагрузка страницы — тот же человек"
            : undefined
        }
      >
        {data.hasEvents ? (
          <Funnel steps={data.funnel} />
        ) : (
          <div className="card mt-4 p-5">
            <p className="text-sm">
              Данные о поведении покупателей начали собираться только что.
            </p>
            <p className="mt-2 text-sm text-muted">
              Раньше магазин видел только оформленные заказы — то есть тех, кто
              дошёл до конца. Через день-два здесь появится и вторая половина
              картины: сколько человек зашло, сколько открыло товар и на каком
              шаге они уходят.
            </p>
          </div>
        )}
      </Section>

      {/* ——— What to do about it ——— */}
      <Section
        title="Товары"
        hint={`Сортировка по просмотрам за ${days} дн.`}
      >
        <ProductTable rows={products} />
      </Section>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* ——— The working day ——— */}
        <Section
          title="Требует ответа"
          hint={ops.newOrders > 0 ? `${ops.newOrders} в статусе «новый»` : undefined}
        >
          {ops.recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              Новых заказов нет — всё разобрано.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {ops.recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href="/admin/orders"
                    className="flex items-baseline justify-between gap-4 py-3 transition hover:text-ink"
                  >
                    <span className="min-w-0">
                      <span className="t-data text-muted">{order.number}</span>{" "}
                      <span className="text-sm">
                        {order.customerName}, {order.city}
                      </span>
                    </span>
                    <span className="t-price tabular shrink-0 text-sm whitespace-nowrap">
                      {formatKzt(order.totalKzt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ——— Where the visits came from, and what needs a look ——— */}
        <div className="space-y-10">
          <Section title="Источники">
            {data.sources.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Пока не из чего считать.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {data.sources.map((s) => (
                  <li
                    key={s.source}
                    className="flex items-baseline justify-between gap-3 border-b border-line pb-2"
                  >
                    <span className="truncate text-sm">{s.source}</span>
                    <span className="t-data shrink-0 text-muted">
                      {s.visits}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Проверить">
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <Link href="/admin/pricing" className="hover:underline">
                  Позиций нет в наличии
                </Link>
                <span
                  className={`t-data ${ops.outOfStock > 0 ? "text-danger" : "text-muted"}`}
                >
                  {ops.outOfStock}
                </span>
              </li>
              <li className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <Link href="/admin/products" className="hover:underline">
                  Черновиков
                </Link>
                <span className="t-data text-muted">{ops.drafts}</span>
              </li>
              <li className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                <Link href="/admin/security" className="hover:underline">
                  Неудачных входов за сутки
                </Link>
                <span
                  className={`t-data ${ops.failed24h >= 8 ? "text-danger" : "text-muted"}`}
                >
                  {ops.failed24h}
                </span>
              </li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}
