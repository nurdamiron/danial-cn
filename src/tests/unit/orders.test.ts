import { describe, expect, it } from "vitest";
import { generateOrderNumber, priceOrder } from "@/lib/orders";
import { getStaticProducts } from "@/lib/static-catalog";

const catalog = getStaticProducts();
const sample = catalog[0];
const sampleVariant = sample.variants[0];

/** A catalogue of one product whose first variant has a known stock level. */
function catalogWithStock(stock: number) {
  const copy = structuredClone(sample);
  copy.variants[0].stock = stock;
  return [copy];
}

describe("order pricing", () => {
  it("prices from the catalogue, not from the request", () => {
    const result = priceOrder(
      [{ slug: sample.slug, variantId: sampleVariant.id, qty: 2 }],
      "ru",
      catalog,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].unitPriceKzt).toBe(
      sampleVariant.priceKzt ?? sample.basePriceKzt,
    );
    expect(result.totalKzt).toBe(result.items[0].unitPriceKzt * 2);
  });

  it("prices from the catalogue it is handed, not from a snapshot", () => {
    const dearer = structuredClone(sample);
    dearer.variants[0].priceKzt = 777_000;

    const result = priceOrder(
      [{ slug: sample.slug, variantId: sampleVariant.id, qty: 1 }],
      "ru",
      [dearer],
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].unitPriceKzt).toBe(777_000);
  });

  it("falls back to the base price when no variant is named", () => {
    const result = priceOrder([{ slug: sample.slug, qty: 1 }], "ru", catalog);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.items[0].unitPriceKzt).toBe(sample.basePriceKzt);
    expect(result.items[0].colorLabel).toBe("");
  });

  it("refuses a variant the catalogue no longer has", () => {
    // A cart that outlived the product it was filled from: pricing it against
    // the base price would file an order for options nobody can ship.
    const result = priceOrder(
      [{ slug: sample.slug, variantId: "variant-that-was-deleted", qty: 1 }],
      "ru",
      catalog,
    );
    expect(result.ok).toBe(false);
  });

  it("refuses more than the shop has on the shelf", () => {
    const result = priceOrder(
      [{ slug: sample.slug, variantId: sampleVariant.id, qty: 9 }],
      "ru",
      catalogWithStock(8),
    );
    expect(result.ok).toBe(false);
  });

  it("allows exactly what is on the shelf", () => {
    const result = priceOrder(
      [{ slug: sample.slug, variantId: sampleVariant.id, qty: 8 }],
      "ru",
      catalogWithStock(8),
    );
    expect(result.ok).toBe(true);
  });

  it("refuses a variant that is out of stock", () => {
    const result = priceOrder(
      [{ slug: sample.slug, variantId: sampleVariant.id, qty: 1 }],
      "ru",
      catalogWithStock(0),
    );
    expect(result.ok).toBe(false);
  });

  it("refuses unknown products, empty baskets and silly quantities", () => {
    expect(
      priceOrder([{ slug: "no-such-thing", qty: 1 }], "ru", catalog).ok,
    ).toBe(false);
    expect(priceOrder([], "ru", catalog).ok).toBe(false);
    expect(priceOrder([{ slug: sample.slug, qty: 0 }], "ru", catalog).ok).toBe(
      false,
    );
    expect(priceOrder([{ slug: sample.slug, qty: 999 }], "ru", catalog).ok).toBe(
      false,
    );
  });

  it("explains itself in the shop's own language", () => {
    // These strings reach the customer verbatim, so none of them may be the
    // validator's English default.
    const failures = [
      priceOrder([], "ru", catalog),
      priceOrder([{ slug: "no-such-thing", qty: 1 }], "ru", catalog),
      priceOrder([{ slug: sample.slug, qty: 0 }], "ru", catalog),
      priceOrder([{ slug: sample.slug, qty: 999 }], "ru", catalog),
      priceOrder(
        [{ slug: sample.slug, variantId: "gone", qty: 1 }],
        "ru",
        catalog,
      ),
      priceOrder(
        [{ slug: sample.slug, variantId: sampleVariant.id, qty: 9 }],
        "ru",
        catalogWithStock(8),
      ),
    ];
    for (const f of failures) {
      expect(f.ok).toBe(false);
      if (f.ok) continue;
      expect(f.error).toMatch(/[а-яА-ЯёЁ]/);
    }
  });

  it("labels the item in the language the order was placed in", () => {
    const ru = priceOrder([{ slug: sample.slug, qty: 1 }], "ru", catalog);
    const kk = priceOrder([{ slug: sample.slug, qty: 1 }], "kk", catalog);
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
