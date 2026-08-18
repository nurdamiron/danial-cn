import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/**
 * Repaints the pages an edit in /admin affects.
 *
 * The storefront is prerendered, so without this a price change would sit in
 * the database while the site kept serving the page built before it.
 *
 * Product pages are purged by route pattern rather than one URL at a time:
 * the prices screen saves many products at once, and a single edit can change
 * the "related products" strip on pages other than its own. With a catalogue
 * this size the cost of rebuilding all of them on demand is not worth the
 * bookkeeping to be precise.
 */
export function revalidateCatalog(): void {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/catalog`);
  }
  revalidatePath("/[locale]/catalog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

/** Settings feed the header, the footer and every page that quotes delivery. */
export function revalidateSettings(): void {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}`, "layout");
  }
}
