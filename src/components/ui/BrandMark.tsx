/**
 * Renders a house line logo from public/brands.
 *
 * The marks are monochrome, so they are painted through a CSS mask: one file
 * serves both the light and the dark surfaces and inherits the surrounding
 * text colour. Kaspi carries its own colour and has its own component.
 *
 * RATIO mirrors each file's viewBox. Regenerate with
 * `node scripts/build-logos.mjs` and update this map if a wordmark changes.
 */
const RATIO: Record<string, number> = {
  "danial-cn": 770 / 100,
  "danial-cn-mark": 1,
  aluma: 546 / 100,
  atlas: 520 / 100,
  nomad: 566 / 100,
  orbit: 478 / 100,
  strata: 610 / 100,
  vecta: 530 / 100,
};

/** Logo file name for a brand as it appears in the catalog, e.g. "ALUMA". */
export function brandMarkName(brand: string): string | null {
  const key = brand.trim().toLowerCase();
  return key in RATIO ? key : null;
}

type Props = {
  /** File name without extension, e.g. "aluma". */
  name: string;
  /** Rendered height in px. Width follows the file's own ratio. */
  height?: number;
  /** Accessible name. Pass "" for a mark that sits next to its own text. */
  label: string;
  className?: string;
};

export function BrandMark({
  name,
  height = 16,
  label,
  className = "",
}: Props) {
  const src = `/brands/${name}.svg`;
  const width = Math.round(height * (RATIO[name] ?? 4));

  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 align-middle ${className}`}
      style={{
        height,
        width,
        // The mask carries the artwork, backgroundColor carries the ink.
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
