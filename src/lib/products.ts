import { canPublishProduct } from "@/lib/publish";
import {
  getStaticFeatured,
  getStaticProductBySlug,
  getStaticProducts,
  useStaticCatalog,
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

async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export async function assertPublishable(productId: string): Promise<void> {
  if (useStaticCatalog()) {
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
  if (useStaticCatalog()) {
    let products = getStaticProducts();
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters.brand) {
      products = products.filter((p) => p.brand === filters.brand);
    }
    if (filters.minPrice != null) {
      products = products.filter((p) => p.basePriceKzt >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
      products = products.filter((p) => p.basePriceKzt <= filters.maxPrice!);
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

export async function getProductBySlug(slug: string) {
  if (useStaticCatalog()) {
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
  if (useStaticCatalog()) {
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
