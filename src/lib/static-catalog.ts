import staticProducts from "@/data/static-products.json";

export type StaticProduct = (typeof staticProducts)[number];

export function useStaticCatalog(): boolean {
  return (
    process.env.USE_STATIC_CATALOG === "1" ||
    process.env.VERCEL === "1" ||
    process.env.NEXT_PUBLIC_USE_STATIC_CATALOG === "1"
  );
}

export function getStaticProducts(): StaticProduct[] {
  return staticProducts.filter((p) => p.status === "active" && p.images.length > 0);
}

export function getStaticProductBySlug(slug: string): StaticProduct | null {
  return getStaticProducts().find((p) => p.slug === slug) ?? null;
}

export function getStaticFeatured(limit = 8): StaticProduct[] {
  const featured = getStaticProducts().filter((p) => p.featured);
  return (featured.length ? featured : getStaticProducts()).slice(0, limit);
}
