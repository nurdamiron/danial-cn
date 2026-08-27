/**
 * Keeping the Kazakh copy alive without asking anyone to type it.
 *
 * The panel asked for every text twice, and the shop is run in Russian, so the
 * second field was work with no owner. It is gone from the form — but the
 * catalogue does hold real Kazakh: 22 of its 39 text fields are translations
 * somebody wrote, not copies. Mirroring the Russian on every save would have
 * emptied the /kk storefront one product at a time, silently.
 *
 * So a Kazakh field that was only ever a copy keeps copying, and one that
 * says something different is left alone. Which is which is decided by
 * comparing it against the Russian it was stored beside, not by guessing at
 * the alphabet — plenty of real translations share words with the Russian.
 */

const TRANSLATED_FIELDS = [
  ["nameRu", "nameKk"],
  ["descriptionRu", "descriptionKk"],
  ["materialRu", "materialKk"],
] as const;

export function syncTranslation(input: {
  /** The Russian text as stored before this edit. */
  prevRu: string;
  /** The Russian text being saved. */
  nextRu: string;
  /** The Kazakh text as stored. */
  kk: string;
}): string {
  const kk = input.kk.trim();
  // Empty, or a copy of the Russian it sat beside: it was never a translation.
  if (!kk || kk === input.prevRu.trim()) return input.nextRu;
  return input.kk;
}

type ProductTexts = {
  nameRu: string;
  nameKk: string;
  descriptionRu: string;
  descriptionKk: string;
  materialRu: string;
  materialKk: string;
};

type TextPatch = Partial<ProductTexts>;

/**
 * The Kazakh half of an edit, worked out from the Russian half.
 *
 * Returns only the fields that should change, so a caller can spread it over
 * a patch without touching columns the edit had nothing to say about.
 */
export function syncProductTranslations(
  stored: ProductTexts,
  patch: TextPatch,
): TextPatch {
  const out: TextPatch = {};

  for (const [ruKey, kkKey] of TRANSLATED_FIELDS) {
    const nextRu = patch[ruKey];
    // Nothing said about the Russian, or the Kazakh spelled out explicitly:
    // either way there is nothing to derive.
    if (nextRu === undefined || patch[kkKey] !== undefined) continue;

    const synced = syncTranslation({
      prevRu: stored[ruKey] ?? "",
      nextRu,
      kk: stored[kkKey] ?? "",
    });
    if (synced !== stored[kkKey]) out[kkKey] = synced;
  }

  return out;
}
