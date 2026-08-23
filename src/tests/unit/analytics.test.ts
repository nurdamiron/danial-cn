import { describe, expect, it } from "vitest";
import { period, toFunnel, toSeries, trend } from "@/lib/analytics";

describe("trend", () => {
  it("reports growth against the period before it", () => {
    expect(trend(150, 100).deltaPct).toBe(50);
    expect(trend(50, 100).deltaPct).toBe(-50);
    expect(trend(100, 100).deltaPct).toBe(0);
  });

  it("refuses to invent a percentage out of nothing", () => {
    // The shop's first week has no week before it. "+100%" would be a lie and
    // "0%" would read as flat, so the dashboard is told to show neither.
    expect(trend(7, 0).deltaPct).toBeNull();
    expect(trend(0, 0).deltaPct).toBeNull();
  });

  it("keeps both figures so the panel can name what it compared", () => {
    expect(trend(9, 4)).toMatchObject({ current: 9, previous: 4 });
  });
});

describe("toSeries", () => {
  const p = period(7);

  it("returns one point per day of the period", () => {
    expect(toSeries([], p)).toHaveLength(7);
  });

  it("keeps quiet days as zero rather than dropping them", () => {
    // A missing point would be drawn as a gap, which reads as "no data" when
    // the truth is "no sales" — the opposite of what the owner needs to see.
    const series = toSeries([], p);
    expect(series.every((d) => d.revenue === 0 && d.orders === 0)).toBe(true);
  });

  it("adds up several orders landing on the same day", () => {
    const day = new Date(p.from.getTime() + 2 * 86_400_000);
    const series = toSeries(
      [
        { createdAt: day, totalKzt: 100_000 },
        { createdAt: day, totalKzt: 50_000 },
      ],
      p,
    );
    const point = series.find((d) => d.date === day.toISOString().slice(0, 10));
    expect(point).toMatchObject({ revenue: 150_000, orders: 2 });
  });

  it("ignores an order from outside the period", () => {
    const before = new Date(p.from.getTime() - 86_400_000);
    const series = toSeries([{ createdAt: before, totalKzt: 999 }], p);
    expect(series.reduce((sum, d) => sum + d.revenue, 0)).toBe(0);
  });
});

describe("toFunnel", () => {
  const counts = new Map([
    ["store_view", 200],
    ["product_view", 100],
    ["cart_add", 40],
    ["checkout_open", 20],
    ["whatsapp_click", 10],
  ]);

  it("keeps the steps in the order a buyer walks them", () => {
    expect(toFunnel(counts).map((s) => s.type)).toEqual([
      "store_view",
      "product_view",
      "cart_add",
      "checkout_open",
      "whatsapp_click",
    ]);
  });

  it("measures every step against the widest one", () => {
    const funnel = toFunnel(counts);
    expect(funnel[0].ofTopPct).toBe(100);
    expect(funnel[1].ofTopPct).toBe(50);
    expect(funnel[4].ofTopPct).toBe(5);
  });

  it("names the loss at each step, not the total", () => {
    // Half of everyone who opened a product failed to add it to the cart.
    // Against the top of the funnel that same step is 20%, which is a
    // different — and much less actionable — statement.
    const funnel = toFunnel(counts);
    expect(funnel[0].lostPct).toBeNull();
    expect(funnel[1].lostPct).toBe(50);
    expect(funnel[2].lostPct).toBe(60);
  });

  it("survives a shop with no visits at all", () => {
    const funnel = toFunnel(new Map());
    expect(funnel).toHaveLength(5);
    expect(funnel.every((s) => s.visits === 0 && s.ofTopPct === 0)).toBe(true);
    expect(funnel.every((s) => s.lostPct === null)).toBe(true);
  });

  it("does not divide by a step nobody reached", () => {
    const sparse = new Map([["store_view", 5]]);
    const funnel = toFunnel(sparse);
    expect(funnel[1].lostPct).toBe(100);
    expect(funnel[2].lostPct).toBeNull();
  });
});
