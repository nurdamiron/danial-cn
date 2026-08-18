import { describe, expect, it } from "vitest";
import { generateOrderNumber, priceOrder } from "@/lib/orders";
import { getStaticProducts } from "@/lib/static-catalog";

const sample = getStaticProducts()[0];
const sampleVariant = sample.variants[0];

describe("order pricing", () => {
  it("prices from the catalogue, not from the request", () => {
    const result = priceOrder(
      [{ slug: sample.slug, variantId: sampleVariant.id, qty: 2 }],
      "ru",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].unitPriceKzt).toBe(
      sampleVariant.priceKzt ?? sample.basePriceKzt,
    );
    expect(result.totalKzt).toBe(result.items[0].unitPriceKzt * 2);
  });

  it("falls back to the base price when no variant is named", () => {
    const result = priceOrder([{ slug: sample.slug, qty: 1 }], "ru");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].unitPriceKzt).toBe(sample.basePriceKzt);
    expect(result.items[0].colorLabel).toBe("");
  });

  it("refuses unknown products, empty baskets and silly quantities", () => {
    expect(priceOrder([{ slug: "no-such-thing", qty: 1 }], "ru").ok).toBe(false);
    expect(priceOrder([], "ru").ok).toBe(false);
    expect(priceOrder([{ slug: sample.slug, qty: 0 }], "ru").ok).toBe(false);
    expect(priceOrder([{ slug: sample.slug, qty: 999 }], "ru").ok).toBe(false);
  });

  it("labels the item in the language the order was placed in", () => {
    const ru = priceOrder([{ slug: sample.slug, qty: 1 }], "ru");
    const kk = priceOrder([{ slug: sample.slug, qty: 1 }], "kk");
    expect(ru.ok && ru.items[0].name).toBe(sample.nameRu);
    expect(kk.ok && kk.items[0].name).toBe(sample.nameKk);
  });
});

describe("order numbers", () => {
  it("carries the date and stays unique across a burst", () => {
    const at = new Date("2026-08-17T00:00:00.000Z");
    expect(generateOrderNumber(at)).toMatch(/^DC-260817-[A-Z0-9]{4}$/);

    const many = new Set(
      Array.from({ length: 500 }, () => generateOrderNumber(at)),
    );
    // 28^4 codes per day; a handful of collisions in 500 draws would still be
    // plausible, but anything close to a constant would not be.
    expect(many.size).toBeGreaterThan(490);
  });
});
