/**
 * The colours and sizes the admin panel offers.
 *
 * Adding a variant used to mean typing a colour key, two labels, a hex value,
 * a size key, two more labels and an SKU by hand — eight fields of internal
 * vocabulary for what the shop thinks of as "silver, cabin size". Picking from
 * these lists fills all of it in.
 *
 * scripts/build-catalog.mjs carries the same tables for the legacy JSON
 * builder. That path only regenerates the snapshot from committed photos now;
 * this file is what the live catalogue uses.
 */

export type ColorPreset = { key: string; hex: string; ru: string; kk: string };
export type SizePreset = { key: string; ru: string; kk: string };

export const COLOR_PRESETS: ColorPreset[] = [
  { key: "silver", hex: "#C3C7CB", ru: "Серебро", kk: "Күміс" },
  { key: "graphite", hex: "#33363A", ru: "Графит", kk: "Графит" },
  { key: "champagne", hex: "#C4A57B", ru: "Шампань", kk: "Шампан" },
  { key: "azure", hex: "#1F6FB2", ru: "Лазурный", kk: "Көгілдір" },
  { key: "crimson", hex: "#B8323C", ru: "Красный", kk: "Қызыл" },
  { key: "amber", hex: "#E1782A", ru: "Оранжевый", kk: "Қызғылт сары" },
  { key: "black", hex: "#1A1A1A", ru: "Чёрный", kk: "Қара" },
  { key: "olive", hex: "#5D6650", ru: "Олива", kk: "Зәйтүн" },
  { key: "blush", hex: "#E5A9B8", ru: "Пудровый", kk: "Опалы қызғылт" },
  { key: "navy", hex: "#26344B", ru: "Тёмно синий", kk: "Қою көк" },
  { key: "sage", hex: "#7C8B77", ru: "Шалфей", kk: "Ақжелкен" },
  { key: "grey", hex: "#8A8D91", ru: "Серый", kk: "Сұр" },
  { key: "cream", hex: "#E2D8C6", ru: "Кремовый", kk: "Кілегей" },
  { key: "cognac", hex: "#9A5B31", ru: "Коньяк", kk: "Коньяк" },
  { key: "chestnut", hex: "#7A4A2B", ru: "Каштан", kk: "Каштан" },
  { key: "forest", hex: "#234B36", ru: "Тёмно зелёный", kk: "Қою жасыл" },
  { key: "lavender", hex: "#B0A0D8", ru: "Лавандовый", kk: "Лаванда" },
  { key: "sky", hex: "#8FBEDD", ru: "Небесно голубой", kk: "Ашық көк" },
  { key: "taupe", hex: "#8B8079", ru: "Мокко", kk: "Мокко" },
  { key: "clear", hex: "#D7DCE0", ru: "Прозрачный", kk: "Мөлдір" },
];

export const SIZE_PRESETS: SizePreset[] = [
  { key: "55", ru: "Ручная кладь 55 см", kk: "Қол жүгі 55 см" },
  { key: "65", ru: "Средний 65 см", kk: "Орташа 65 см" },
  { key: "75", ru: "Большой 75 см", kk: "Үлкен 75 см" },
  { key: "set3", ru: "Набор из 3 предметов", kk: "3 заттан тұратын жинақ" },
  { key: "set4", ru: "Набор из 4 предметов", kk: "4 заттан тұратын жинақ" },
  { key: "40l", ru: "Объём 40 л", kk: "Көлемі 40 л" },
  { key: "55l", ru: "Объём 55 л", kk: "Көлемі 55 л" },
];

export function colorPreset(key: string): ColorPreset | undefined {
  return COLOR_PRESETS.find((c) => c.key === key);
}

export function sizePreset(key: string): SizePreset | undefined {
  return SIZE_PRESETS.find((s) => s.key === key);
}

/** Human label for a colour key, falling back to the key itself. */
export function colorLabel(key: string | null | undefined): string {
  if (!key) return "без цвета";
  return colorPreset(key)?.ru ?? key;
}

/** SKU the shop never has to think about, derived from what it picked. */
export function buildSku(slug: string, colorKey: string, sizeKey: string): string {
  return `${slug}-${colorKey}-${sizeKey}`.toUpperCase();
}
