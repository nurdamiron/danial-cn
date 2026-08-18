import { canPublishProduct } from "@/lib/publish";
import { hasDatabase, NO_DATABASE_ERROR } from "@/lib/db-config";
import {
  getStaticFeatured,
  getStaticProductBySlug,
  getStaticProducts,
  isStaticCatalog,
} from "@/lib/static-catalog";

export { canPublishProduct } from "@/lib/publish";

export type ProductListFilters = {
  brand?: string;
  category?: string;
  colorKey?: string;
  sizeKey?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "new" | "price_asc" | "price_desc";
};

/**
 * Reads the catalogue, preferring the database.
 *
 * The database is the source of truth so an edit in /admin shows up on the
 * site within seconds. src/data/static-products.json is the snapshot taken at
 * the last build: if the database cannot be reached, the shop keeps selling
 * from it instead of showing an empty catalogue. USE_STATIC_CATALOG=1 forces
 * the snapshot outright.
 */
async function readCatalog<T>(
  fromDatabase: () => Promise<T>,
  fromSnapshot: () => T,
): Promise<T> {
  if (isStaticCatalog() || !hasDatabase()) return fromSnapshot();
  try {
    return await fromDatabase();
  } catch (error) {
    console.error(
      "catalogue: database unreachable, serving the last snapshot",
      error,
    );
    return fromSnapshot();
  }
}

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export async function assertPublishable(productId: string): Promise<void> {
  if (!hasDatabase()) {
    throw new Error(NO_DATABASE_ERROR);
  }
  const prisma = await getPrisma();
  const imageCount = await prisma.productImage.count({ where: { productId } });
  const result = canPublishProduct({ imageCount });
  if (!result.ok) {
    throw new Error(result.reason);
  }
}

/** The same narrowing as the database query, over the committed snapshot. */
function filterSnapshot(filters: ProductListFilters) {
  let products = getStaticProducts();
  if (filters.category) {
    products = products.filter((p) => p.category === filters.category);
  }
  if (filters.brand) {
    products = products.filter(
      (p) =>
        p.brand === filters.brand ||
        (p as { brandRu?: string }).brandRu === filters.brand ||
        (p as { brandKk?: string }).brandKk === filters.brand,
    );
  }
  if (filters.colorKey) {
    products = products.filter((p) =>
      p.variants.some((v) => v.colorKey === filters.colorKey && v.stock > 0),
    );
  }
  if (filters.sizeKey) {
    products = products.filter((p) =>
      p.variants.some((v) => v.sizeKey === filters.sizeKey && v.stock > 0),
    );
  }
  if (filters.inStock) {
    products = products.filter((p) => p.variants.some((v) => v.stock > 0));
  }
  if (filters.minPrice != null) {
    products = products.filter(
      (p) => cheapest(p) >= (filters.minPrice as number),
    );
  }
  if (filters.maxPrice != null) {
    products = products.filter(
      (p) => cheapest(p) <= (filters.maxPrice as number),
    );
  }
  if (filters.sort === "price_asc") {
    products = [...products].sort((a, b) => a.basePriceKzt - b.basePriceKzt);
  } else if (filters.sort === "price_desc") {
    products = [...products].sort((a, b) => b.basePriceKzt - a.basePriceKzt);
  }
  return products;
}

function cheapest(p: {
  basePriceKzt: number;
  variants: { priceKzt: number | null }[];
}): number {
  const prices = p.variants
    .map((v) => v.priceKzt ?? p.basePriceKzt)
    .filter((n): n is number => n != null);
  return Math.min(...prices, p.basePriceKzt);
}

type DbProducts = Awaited<ReturnType<typeof listActiveProductsFromDb>>;

export async function listActiveProducts(filters: ProductListFilters = {}) {
  return readCatalog(
    () => listActiveProductsFromDb(filters),
    () => filterSnapshot(filters) as unknown as DbProducts,
  );
}

type FilterProduct = {
  brand: string;
  brandRu?: string;
  brandKk?: string;
  basePriceKzt: number;
  variants: {
    colorKey: string;
    colorLabelRu: string;
    colorLabelKk: string;
    colorHex?: string | null;
    sizeKey: string;
    sizeLabelRu: string;
    sizeLabelKk: string;
    priceKzt: number | null;
  }[];
};

function buildFilterOptions(locale: string, products: FilterProduct[]) {
  const brands = new Map<string, string>();
  const colors = new Map<
    string,
    { key: string; label: string; hex: string }
  >();
  const sizes = new Map<string, { key: string; label: string }>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of products) {
    const brandLabel =
      locale === "kk" && p.brandKk
        ? p.brandKk
        : p.brandRu || p.brand;
    brands.set(p.brand, brandLabel);

    for (const v of p.variants) {
      const price = v.priceKzt ?? p.basePriceKzt;
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);

      if (!colors.has(v.colorKey)) {
        colors.set(v.colorKey, {
          key: v.colorKey,
          label: locale === "kk" ? v.colorLabelKk : v.colorLabelRu,
          hex: v.colorHex || "#ccc",
        });
      }
      if (!sizes.has(v.sizeKey)) {
        sizes.set(v.sizeKey, {
          key: v.sizeKey,
          label: locale === "kk" ? v.sizeLabelKk : v.sizeLabelRu,
        });
      }
    }
  }

  // Shell height ascending; non-numeric keys ("set", "one") go last
  const sizeRank = (key: string) => {
    const cm = Number.parseInt(key, 10);
    return Number.isFinite(cm) ? cm : Number.MAX_SAFE_INTEGER;
  };

  return {
    brands: [...brands.entries()].map(([key, label]) => ({ key, label })),
    colors: [...colors.values()],
    sizes: [...sizes.values()].sort(
      (a, b) => sizeRank(a.key) - sizeRank(b.key),
    ),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice: maxPrice || 0,
  };
}

/** Sync helper for static-only contexts */
export function getCatalogFilterOptions(locale: string) {
  return buildFilterOptions(locale, getStaticProducts() as FilterProduct[]);
}

/** Prefer this: works with DB locally and static on Vercel */
export async function getCatalogFilterOptionsAsync(locale: string) {
  return readCatalog(
    async () =>
      buildFilterOptions(
        locale,
        (await listActiveProductsFromDb({})) as FilterProduct[],
      ),
    () => buildFilterOptions(locale, getStaticProducts() as FilterProduct[]),
  );
}

async function listActiveProductsFromDb(filters: ProductListFilters = {}) {
  const prisma = await getPrisma();
  return prisma.product.findMany({
    where: {
      status: "active",
      images: { some: {} },
      ...(filters.brand ? { brand: filters.brand } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.minPrice != null || filters.maxPrice != null
        ? {
            basePriceKzt: {
              ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
      ...(filters.colorKey || filters.sizeKey || filters.inStock
        ? {
            variants: {
              some: {
                ...(filters.colorKey ? { colorKey: filters.colorKey } : {}),
                ...(filters.sizeKey ? { sizeKey: filters.sizeKey } : {}),
                ...(filters.inStock ? { stock: { gt: 0 } } : {}),
              },
            },
          }
        : {}),
    },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
    orderBy:
      filters.sort === "price_asc"
        ? { basePriceKzt: "asc" }
        : filters.sort === "price_desc"
          ? { basePriceKzt: "desc" }
          : [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

type DbProduct = Awaited<ReturnType<typeof getProductBySlugFromDb>>;

export async function getProductBySlug(slug: string) {
  return readCatalog(
    () => getProductBySlugFromDb(slug),
    () => getStaticProductBySlug(slug) as unknown as DbProduct,
  );
}

async function getProductBySlugFromDb(slug: string) {
  const prisma = await getPrisma();
  return prisma.product.findFirst({
    where: {
      slug,
      status: "active",
      images: { some: {} },
    },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
  });
}

/**
 * Slugs to prerender at build time. Reads the database so a product added in
 * /admin gets a built page on the next deploy; falls back to the snapshot so a
 * database outage cannot fail the build. Unknown slugs still render on demand.
 */
export async function listCatalogSlugs(): Promise<string[]> {
  return readCatalog(
    async () => {
      const prisma = await getPrisma();
      const rows = await prisma.product.findMany({
        where: { status: "active", images: { some: {} } },
        select: { slug: true },
      });
      return rows.map((r) => r.slug);
    },
    () => getStaticProducts().map((p) => p.slug),
  );
}

export async function listFeaturedProducts(limit = 8) {
  return readCatalog(
    () => listFeaturedProductsFromDb(limit),
    () =>
      getStaticFeatured(limit) as unknown as Awaited<
        ReturnType<typeof listFeaturedProductsFromDb>
      >,
  );
}

async function listFeaturedProductsFromDb(limit = 8) {
  const prisma = await getPrisma();
  return prisma.product.findMany({
    where: {
      status: "active",
      images: { some: {} },
      featured: true,
    },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export function pickCoverUrl(
  images: { url: string; isCover: boolean; sortOrder: number }[],
): string | null {
  if (!images.length) return null;
  const cover = images.find((i) => i.isCover) ?? images[0];
  return cover.url;
}

export function localizedName(
  product: { nameRu: string; nameKk: string },
  locale: string,
) {
  return locale === "kk" ? product.nameKk : product.nameRu;
}

export function localizedBrand(
  product: { brand: string; brandRu?: string; brandKk?: string },
  locale: string,
) {
  if (locale === "kk" && product.brandKk) return product.brandKk;
  if (product.brandRu) return product.brandRu;
  return product.brand;
}

export function localizedDescription(
  product: { descriptionRu: string; descriptionKk: string },
  locale: string,
) {
  return locale === "kk" ? product.descriptionKk : product.descriptionRu;
}

export function localizedMaterial(
  product: { materialRu: string; materialKk: string },
  locale: string,
) {
  return locale === "kk" ? product.materialKk : product.materialRu;
}

export function uniqueSizes(
  variants: { sizeKey: string; sizeLabelRu: string; sizeLabelKk: string }[],
  locale: string,
): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const v of variants) {
    if (!seen.has(v.sizeKey)) {
      seen.set(v.sizeKey, locale === "kk" ? v.sizeLabelKk : v.sizeLabelRu);
    }
  }
  return [...seen.entries()].map(([key, label]) => ({ key, label }));
}

export function uniqueColorDots(
  variants: {
    colorKey: string;
    colorLabelRu: string;
    colorLabelKk: string;
    colorHex?: string | null;
  }[],
  locale: string,
): { hex: string; label: string }[] {
  const seen = new Map<string, { hex: string; label: string }>();
  for (const v of variants) {
    if (!v.colorHex || seen.has(v.colorKey)) continue;
    seen.set(v.colorKey, {
      hex: v.colorHex,
      label: locale === "kk" ? v.colorLabelKk : v.colorLabelRu,
    });
  }
  return [...seen.values()];
}
