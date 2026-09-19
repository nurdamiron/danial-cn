/**
 * Product slugs, derived instead of typed.
 *
 * The panel is used by the person who runs the shop, not by a developer, so
 * the URL is generated from the name rather than asked for. Slugs are the
 * catalogue's public addresses and the column is unique, so generation has to
 * be deterministic and collisions have to resolve rather than throw.
 */

const MAX_LENGTH = 60;
const FALLBACK = "product";

/** Cyrillic used by both storefront languages, mapped to the latin URL form. */
const TRANSLIT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
  // Kazakh-only letters
  ә: "a",
  і: "i",
  ң: "n",
  ғ: "g",
  ү: "u",
  ұ: "u",
  қ: "q",
  ө: "o",
  һ: "h",
};

function trimDashes(value: string): string {
  return value.replace(/^-+|-+$/g, "");
}

/** Build a URL-safe slug from a product name. Never returns an empty string. */
export function slugify(input: string): string {
  const latin = input
    .toLowerCase()
    .split("")
    .map((char) => TRANSLIT[char] ?? char)
    .join("");

  const slug = trimDashes(trimDashes(latin.replace(/[^a-z0-9]+/g, "-")).slice(0, MAX_LENGTH));

  return slug || FALLBACK;
}

/**
 * The first free slug in the `base`, `base-2`, `base-3` … series.
 *
 * `isTaken` is injected so the collision check can be a database lookup in the
 * route and a plain set in tests.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(base))) return base;

  for (let n = 2; ; n += 1) {
    const suffix = `-${n}`;
    const candidate = `${trimDashes(base.slice(0, MAX_LENGTH - suffix.length))}${suffix}`;
    if (!(await isTaken(candidate))) return candidate;
  }
}

/**
 * Slug source for a product: the brand plus the name, without saying the brand
 * twice when the name already opens with it.
 */
export function productSlugBase(brand: string, name: string): string {
  const line = brand.trim();
  const title = name.trim();
  if (!line) return slugify(title);
  if (!title) return slugify(line);
  const repeats = title.toLowerCase().startsWith(line.toLowerCase());
  return slugify(repeats ? title : `${line} ${title}`);
}
