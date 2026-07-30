import { prisma } from "@/lib/prisma";
import { canPublishProduct } from "@/lib/publish";

export { canPublishProduct } from "@/lib/publish";

export async function assertPublishable(productId: string): Promise<void> {
  const imageCount = await prisma.productImage.count({ where: { productId } });
  const result = canPublishProduct({ imageCount });
  if (!result.ok) {
    throw new Error(result.reason);
  }
}

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

export async function listActiveProducts(filters: ProductListFilters = {}) {
  const products = await prisma.product.findMany({
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

  return products;
}

export async function getProductBySlug(slug: string) {
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
