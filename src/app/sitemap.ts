import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";
import { listActiveProducts } from "@/lib/products";

const staticPaths = ["", "/catalog", "/about", "/faq", "/contacts", "/delivery"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listActiveProducts();

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      staticPaths.map((path) => ({
        url: `${SITE.url}/${locale}${path}`,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.6,
      })),
  );

  const productEntries: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      products.map((p) => ({
        url: `${SITE.url}/${locale}/catalog/${p.slug}`,
        lastModified: p.updatedAt ?? undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      })),
  );

  return [...staticEntries, ...productEntries];
}
