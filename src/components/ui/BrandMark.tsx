/**
 * Renders a logo file from public/brand.
 *
 * Monochrome marks are painted through a CSS mask so one .svg serves both the
 * light and the dark surfaces and still inherits the surrounding text colour.
 * Marks that carry their own colour render as a normal image instead.
 *
 * RATIO mirrors each file's viewBox. Regenerate the logos with
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
  // official Kaspi.kz lockup, viewBox 141 by 33
  "pay-kaspi": 141 / 33,
};

type Props = {
  /** File name without extension, e.g. "aluma" or "danial-cn". */
  name: keyof typeof RATIO | string;
  /** Rendered height in px. Width follows the file's own ratio. */
  height?: number;
  /** Accessible name. Pass "" for a mark that sits next to its own text. */
  label: string;
  colored?: boolean;
  className?: string;
};

export function BrandMark({
  name,
  height = 20,
  label,
  colored = false,
  className = "",
}: Props) {
  const src = `/brand/${name}.svg`;
  const width = Math.round(height * (RATIO[name] ?? 4));

  if (colored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- vector mark, nothing for the optimiser to do
      <img
        src={src}
        alt={label}
        width={width}
        height={height}
        className={`inline-block w-auto align-middle ${className}`}
        style={{ height }}
      />
    );
  }

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
