import { canPublishProduct } from "@/lib/publish";
import {
  SIZE_ORDER,
  getStaticFeatured,
  getStaticProductBySlug,
  getStaticProducts,
  isStaticCatalog,
} from "@/lib/static-catalog";

export { canPublishProduct } from "@/lib/publish";
export { getBrand, getBrands } from "@/lib/static-catalog";

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

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export async function assertPublishable(productId: string): Promise<void> {
  if (isStaticCatalog()) {
    throw new Error("Admin writes disabled in static/Vercel catalog mode");
  }
  const prisma = await getPrisma();
  const imageCount = await prisma.productImage.count({ where: { productId } });
  const result = canPublishProduct({ imageCount });
  if (!result.ok) {
    throw new Error(result.reason);
  }
}

export async function listActiveProducts(filters: ProductListFilters = {}) {
  if (isStaticCatalog()) {
    let products = getStaticProducts();
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters.brand) {
      products = products.filter((p) => p.brandKey === filters.brand);
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
      products = products.filter((p) =>
        p.variants.some((v) => v.stock > 0),
      );
    }
    if (filters.minPrice != null) {
      products = products.filter((p) => {
        const prices = p.variants
          .map((v) => v.priceKzt ?? p.basePriceKzt)
          .filter((n): n is number => n != null);
        const min = Math.min(...prices, p.basePriceKzt);
        return min >= filters.minPrice!;
      });
    }
    if (filters.maxPrice != null) {
      products = products.filter((p) => {
        const prices = p.variants
          .map((v) => v.priceKzt ?? p.basePriceKzt)
          .filter((n): n is number => n != null);
        const min = Math.min(...prices, p.basePriceKzt);
        return min <= filters.maxPrice!;
      });
    }
    if (filters.sort === "price_asc") {
      products = [...products].sort((a, b) => a.basePriceKzt - b.basePriceKzt);
    } else if (filters.sort === "price_desc") {
      products = [...products].sort((a, b) => b.basePriceKzt - a.basePriceKzt);
    }
    return products as unknown as Awaited<
      ReturnType<typeof listActiveProductsFromDb>
    >;
  }
  return listActiveProductsFromDb(filters);
}

export function getCatalogFilterOptions(locale: string) {
  const products = getStaticProducts();
  const brands = new Map<
    string,
    { key: string; label: string; logo: string; hint: string }
  >();
  const colors = new Map<
    string,
    { key: string; label: string; hex: string }
  >();
  const sizes = new Map<string, { key: string; label: string }>();
  const categories = new Map<string, number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const p of products) {
    if (!brands.has(p.brandKey)) {
      brands.set(p.brandKey, {
        key: p.brandKey,
        label: p.brand,
        logo: `/brand/${p.brandKey}.svg`,
        hint: locale === "kk" ? p.brandTaglineKk : p.brandTaglineRu,
      });
    }
    categories.set(p.category, (categories.get(p.category) ?? 0) + 1);

    for (const v of p.variants) {
      const price = v.priceKzt ?? p.basePriceKzt;
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);

      if (!colors.has(v.colorKey)) {
        colors.set(v.colorKey, {
          key: v.colorKey,
          label: locale === "kk" ? v.colorLabelKk : v.colorLabelRu,
          hex: v.colorHex || "#cccccc",
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

  return {
    brands: [...brands.values()],
    colors: [...colors.values()],
    sizes: [...sizes.values()].sort(
      (a, b) => SIZE_ORDER.indexOf(a.key) - SIZE_ORDER.indexOf(b.key),
    ),
    categories: Object.fromEntries(categories),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice: maxPrice || 0,
  };
}

async function listActiveProductsFromDb(filters: ProductListFilters = {}) {
  const prisma = await getPrisma();
  return prisma.product.findMany({
    where: {
      status: "active",
      images: { some: {} },
      ...(filters.brand ? { brandKey: filters.brand } : {}),
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

export async function getProductBySlug(slug: string) {
  if (isStaticCatalog()) {
    return getStaticProductBySlug(slug) as unknown as Awaited<
      ReturnType<typeof getProductBySlugFromDb>
    > | null;
  }
  return getProductBySlugFromDb(slug);
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

export async function listFeaturedProducts(limit = 8) {
  if (isStaticCatalog()) {
    return getStaticFeatured(limit) as unknown as Awaited<
      ReturnType<typeof listFeaturedProductsFromDb>
    >;
  }
  return listFeaturedProductsFromDb(limit);
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

export function localizedWheels(
  product: { wheelsRu: string; wheelsKk: string },
  locale: string,
) {
  return locale === "kk" ? product.wheelsKk : product.wheelsRu;
}

export function localizedLock(
  product: { lockRu: string; lockKk: string },
  locale: string,
) {
  return locale === "kk" ? product.lockKk : product.lockRu;
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
  return [...seen.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => SIZE_ORDER.indexOf(a.key) - SIZE_ORDER.indexOf(b.key));
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
