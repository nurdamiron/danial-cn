/**
 * The catalogue as the browser needs it.
 *
 * Filtering used to happen on the server, which meant every filter click ran a
 * function and the page could never be cached — for data that only changes
 * when a new build ships. The server now renders the whole list once, and this
 * module does the narrowing in the browser.
 *
 * Labels are baked per locale on the server so the client payload carries no
 * translation logic. If the catalogue ever outgrows a few dozen products,
 * shipping all of them at once stops being the right trade and this wants
 * pagination.
 */

export type CatalogItem = {
  id: string;
  slug: string;
  brand: string;
  brandLabel: string;
  name: string;
  category: string;
  basePriceKzt: number;
  /** Cheapest way to buy it, which is what the price filter compares. */
  minPriceKzt: number;
  priceLabel: string;
  specs?: string;
  coverUrl: string;
  hoverUrl?: string | null;
  colors: { hex: string; label: string }[];
  variants: { colorKey: string; sizeKey: string; stock: number }[];
  /** Photos grouped by colour, so picking a colour swaps the cover. */
  imagesByColor: Record<string, string[]>;
  sortOrder: number;
  createdAt: string;
};

export type CatalogQuery = {
  category?: string;
  brand?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "new" | "price_asc" | "price_desc";
};

/** Reads the query the filter UI writes into the address bar. */
export function parseCatalogQuery(
  params: URLSearchParams | null,
): CatalogQuery {
  if (!params) return {};
  const num = (key: string) => {
    const raw = params.get(key);
    if (!raw) return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };
  const sort = params.get("sort");

  return {
    category: params.get("category") ?? undefined,
    brand: params.get("brand") ?? undefined,
    color: params.get("color") ?? undefined,
    size: params.get("size") ?? undefined,
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    inStock: params.get("inStock") === "1" || params.get("inStock") === "true",
    sort:
      sort === "price_asc" || sort === "price_desc" || sort === "new"
        ? sort
        : "new",
  };
}

export function filterCatalog(
  items: CatalogItem[],
  query: CatalogQuery,
): CatalogItem[] {
  const filtered = items.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.brand && item.brand !== query.brand) return false;

    // A colour or size only counts when it is actually buyable, which is how
    // the server query read it too.
    if (query.color && !item.variants.some((v) => v.colorKey === query.color && v.stock > 0)) {
      return false;
    }
    if (query.size && !item.variants.some((v) => v.sizeKey === query.size && v.stock > 0)) {
      return false;
    }
    if (query.inStock && !item.variants.some((v) => v.stock > 0)) return false;

    if (query.minPrice != null && item.minPriceKzt < query.minPrice) return false;
    if (query.maxPrice != null && item.minPriceKzt > query.maxPrice) return false;

    return true;
  });

  if (query.sort === "price_asc") {
    return [...filtered].sort((a, b) => a.basePriceKzt - b.basePriceKzt);
  }
  if (query.sort === "price_desc") {
    return [...filtered].sort((a, b) => b.basePriceKzt - a.basePriceKzt);
  }
  return [...filtered].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/** The cover to show, given the colour the shopper narrowed to. */
export function coverFor(
  item: CatalogItem,
  color?: string,
): { cover: string; hover?: string | null } {
  if (color) {
    const forColor = item.imagesByColor[color];
    if (forColor?.length) {
      return { cover: forColor[0], hover: forColor[1] ?? item.hoverUrl };
    }
  }
  return { cover: item.coverUrl, hover: item.hoverUrl };
}
