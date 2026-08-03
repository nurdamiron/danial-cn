type Dimensions = {
  heightCm?: number | null;
  widthCm?: number | null;
  depthCm?: number | null;
  volumeL?: number | null;
  weightKg?: number | null;
};

/** "55×40×23 см" — the three numbers an airline gate agent checks. */
export function formatDimensions(p: Dimensions, locale: string): string | null {
  const { heightCm, widthCm, depthCm } = p;
  if (!heightCm || !widthCm || !depthCm) return null;
  return `${heightCm}×${widthCm}×${depthCm} ${locale === "kk" ? "см" : "см"}`;
}

/** "38 л · 3,8 кг" — capacity and weight, the two follow-up questions. */
export function formatCapacity(p: Dimensions, locale: string): string | null {
  const parts: string[] = [];
  if (p.volumeL) parts.push(`${p.volumeL} ${locale === "kk" ? "л" : "л"}`);
  if (p.weightKg) {
    const kg = p.weightKg.toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU");
    parts.push(`${kg} ${locale === "kk" ? "кг" : "кг"}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** One compact line for cards: "55×40×23 см · 38 л · 3,8 кг". */
export function formatSpecLine(p: Dimensions, locale: string): string | null {
  const line = [formatDimensions(p, locale), formatCapacity(p, locale)]
    .filter(Boolean)
    .join(" · ");
  return line || null;
}
