/**
 * Everything about a variant that the colour and the size already imply.
 *
 * Adding one colourway asked for eleven fields, of which two were decisions:
 * which colour and which size. The other nine — an SKU to invent, an English
 * colour key, a hex value, four labels in two languages — are all derivable
 * from the palette the panel already offers. They are derived here so the
 * server can accept a colour and a size and fill the rest itself, rather than
 * trusting a form to have done it.
 */
import { colorPreset, sizePreset } from "@/lib/catalog-presets";
import { defaultColorHex } from "@/lib/color-hex";

export type DerivedVariant = {
  sku: string;
  colorKey: string;
  colorLabelRu: string;
  colorLabelKk: string;
  colorHex: string;
  sizeKey: string;
  sizeLabelRu: string;
  sizeLabelKk: string;
};

/**
 * The catalogue's own SKU shape: slug, colour, size, upper case.
 *
 * Anything that is not a letter or a digit becomes a separator, so a colour
 * typed by hand cannot produce an SKU with a space in it.
 */
export function deriveSku(
  slug: string,
  colorKey: string,
  sizeKey: string,
): string {
  return [slug, colorKey, sizeKey]
    .map((part) =>
      part
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("-");
}

/**
 * Fill in a variant from its colour and size, leaving anything the caller
 * spelled out untouched — a one-off colourway still gets to name itself.
 */
export function deriveVariant(input: {
  slug: string;
  colorKey: string;
  sizeKey: string;
  sku?: string | null;
  colorLabelRu?: string | null;
  colorLabelKk?: string | null;
  colorHex?: string | null;
  sizeLabelRu?: string | null;
  sizeLabelKk?: string | null;
}): DerivedVariant {
  const colorKey = input.colorKey.trim();
  const sizeKey = input.sizeKey.trim();
  const color = colorPreset(colorKey);
  const size = sizePreset(sizeKey);

  const colorLabelRu = input.colorLabelRu?.trim() || color?.ru || colorKey;
  const sizeLabelRu = input.sizeLabelRu?.trim() || size?.ru || sizeKey;

  return {
    sku: input.sku?.trim() || deriveSku(input.slug, colorKey, sizeKey),
    colorKey,
    colorLabelRu,
    // An untranslated colour repeats the Russian rather than showing a blank
    // on the /kk storefront.
    colorLabelKk: input.colorLabelKk?.trim() || color?.kk || colorLabelRu,
    colorHex: input.colorHex?.trim() || color?.hex || defaultColorHex(colorKey),
    sizeKey,
    sizeLabelRu,
    sizeLabelKk: input.sizeLabelKk?.trim() || size?.kk || sizeLabelRu,
  };
}
