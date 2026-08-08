import staticProducts from "@/data/static-products.json";

export type StaticProduct = (typeof staticProducts)[number];

/** Order the size pills and filters follow across the whole site. */
export const SIZE_ORDER = ["55", "65", "75", "set3", "set4", "40l", "55l"];

export type Brand = {
  key: string;
  name: string;
  taglineRu: string;
  taglineKk: string;
  logo: string;
  count: number;
};

export function isStaticCatalog(): boolean {
  return (
    process.env.USE_STATIC_CATALOG === "1" ||
    process.env.VERCEL === "1" ||
    process.env.NEXT_PUBLIC_USE_STATIC_CATALOG === "1"
  );
}

export function getStaticProducts(): StaticProduct[] {
  return staticProducts.filter(
    (p) => p.status === "active" && p.images.length > 0,
  );
}

export function getStaticProductBySlug(slug: string): StaticProduct | null {
  return getStaticProducts().find((p) => p.slug === slug) ?? null;
}

export function getStaticFeatured(limit = 8): StaticProduct[] {
  const featured = getStaticProducts().filter((p) => p.featured);
  return (featured.length ? featured : getStaticProducts()).slice(0, limit);
}

/**
 * House lines, derived from the catalog so a brand can never appear on the
 * site without a product behind it. The logo is a real file in public/brand.
 */
export function getBrands(): Brand[] {
  const map = new Map<string, Brand>();
  for (const p of getStaticProducts()) {
    const existing = map.get(p.brandKey);
    if (existing) {
      existing.count += 1;
      continue;
    }
    map.set(p.brandKey, {
      key: p.brandKey,
      name: p.brand,
      taglineRu: p.brandTaglineRu,
      taglineKk: p.brandTaglineKk,
      logo: `/brand/${p.brandKey}.svg`,
      count: 1,
    });
  }
  return [...map.values()];
}

export function getBrand(key: string): Brand | null {
  return getBrands().find((b) => b.key === key) ?? null;
}
