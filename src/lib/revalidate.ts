import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

/*
  A route pattern is matched against the route's file path, and that path
  keeps the (store) group: a cached product page is tagged
  "/(store)/[locale]/catalog/[slug]/page". The patterns used to leave the
  group out, matched no page at all, and so an edited product kept showing
  its old name, price and photos until the next deploy. Settings fared the
  same: "/ru" + "layout" names a layout no page is tagged with.
*/
const STORE = "/(store)/[locale]";

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
  revalidatePath(`${STORE}/catalog/[slug]`, "page");
  revalidatePath("/sitemap.xml");
}

/** Settings feed the header, the footer and every page that quotes delivery. */
export function revalidateSettings(): void {
  // Every storefront page sits under this layout, so this one call reaches
  // all of them, in both languages.
  revalidatePath(STORE, "layout");
}
