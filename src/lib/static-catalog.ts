import staticProducts from "@/data/static-products.json";
import staticSettings from "@/data/static-settings.json";

export type StaticProduct = (typeof staticProducts)[number];
export type StaticSettings = typeof staticSettings;

/**
 * Forces the committed snapshot instead of the database.
 *
 * This used to be true on Vercel unconditionally, which is why the catalogue
 * could only be edited by a developer running the project locally. It is now
 * an explicit switch: set USE_STATIC_CATALOG=1 to preview exactly what the
 * snapshot contains, or to keep the shop readable while the database is down.
 */
export function isStaticCatalog(): boolean {
  return (
    process.env.USE_STATIC_CATALOG === "1" ||
    process.env.NEXT_PUBLIC_USE_STATIC_CATALOG === "1"
  );
}

/** @deprecated use isStaticCatalog */
export const useStaticCatalog = isStaticCatalog;

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

export function getStaticSettings(): StaticSettings {
  return staticSettings;
}
