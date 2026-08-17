import { describe, expect, it } from "vitest";
import {
  coverFor,
  filterCatalog,
  parseCatalogQuery,
  type CatalogItem,
} from "@/lib/catalog-view";

function item(overrides: Partial<CatalogItem> = {}): CatalogItem {
  return {
    id: "p1",
    slug: "cabin-55",
    brand: "Aluma",
    brandLabel: "Aluma",
    name: "Aluma Cabin 55",
    category: "cabin",
    basePriceKzt: 100_000,
    minPriceKzt: 100_000,
    priceLabel: "100 000 ₸",
    coverUrl: "/products/a.jpg",
    hoverUrl: "/products/b.jpg",
    colors: [],
    variants: [{ colorKey: "black", sizeKey: "55", stock: 3 }],
    imagesByColor: {},
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("catalog filtering", () => {
  it("keeps only colours and sizes that are actually in stock", () => {
    const soldOut = item({
      id: "p2",
      variants: [{ colorKey: "black", sizeKey: "55", stock: 0 }],
    });
    const items = [item(), soldOut];

    expect(filterCatalog(items, { color: "black" }).map((i) => i.id)).toEqual([
      "p1",
    ]);
    expect(filterCatalog(items, { size: "55" }).map((i) => i.id)).toEqual([
      "p1",
    ]);
    expect(filterCatalog(items, { inStock: true }).map((i) => i.id)).toEqual([
      "p1",
    ]);
  });

  it("compares the price filter against the cheapest variant", () => {
    const discounted = item({ id: "p2", basePriceKzt: 200_000, minPriceKzt: 80_000 });
    const items = [item(), discounted];

    expect(filterCatalog(items, { maxPrice: 90_000 }).map((i) => i.id)).toEqual([
      "p2",
    ]);
    expect(filterCatalog(items, { minPrice: 150_000 })).toHaveLength(0);
  });

  it("sorts by price in both directions and by order otherwise", () => {
    const cheap = item({ id: "cheap", basePriceKzt: 10, sortOrder: 5 });
    const dear = item({ id: "dear", basePriceKzt: 900, sortOrder: 1 });
    const items = [cheap, dear];

    expect(filterCatalog(items, { sort: "price_asc" }).map((i) => i.id)).toEqual(
      ["cheap", "dear"],
    );
    expect(
      filterCatalog(items, { sort: "price_desc" }).map((i) => i.id),
    ).toEqual(["dear", "cheap"]);
    expect(filterCatalog(items, { sort: "new" }).map((i) => i.id)).toEqual([
      "dear",
      "cheap",
    ]);
  });

  it("does not mutate the list it was given", () => {
    const items = [item({ id: "a", basePriceKzt: 2 }), item({ id: "b", basePriceKzt: 1 })];
    filterCatalog(items, { sort: "price_asc" });
    expect(items.map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("catalog query", () => {
  it("reads what the filter UI writes", () => {
    const q = parseCatalogQuery(
      new URLSearchParams(
        "category=cabin&brand=Aluma&color=black&size=55&minPrice=1000&maxPrice=5000&inStock=1&sort=price_desc",
      ),
    );
    expect(q).toEqual({
      category: "cabin",
      brand: "Aluma",
      color: "black",
      size: "55",
      minPrice: 1000,
      maxPrice: 5000,
      inStock: true,
      sort: "price_desc",
    });
  });

  it("ignores prices that are not numbers and unknown sorts", () => {
    const q = parseCatalogQuery(new URLSearchParams("minPrice=abc&sort=sideways"));
    expect(q.minPrice).toBeUndefined();
    expect(q.sort).toBe("new");
  });
});

describe("cover selection", () => {
  it("prefers a photo of the chosen colour", () => {
    const withColors = item({
      imagesByColor: { silver: ["/s1.jpg", "/s2.jpg"] },
    });
    expect(coverFor(withColors, "silver")).toEqual({
      cover: "/s1.jpg",
      hover: "/s2.jpg",
    });
  });

  it("falls back to the default cover when the colour has no photo", () => {
    expect(coverFor(item(), "silver")).toEqual({
      cover: "/products/a.jpg",
      hover: "/products/b.jpg",
    });
  });
});
