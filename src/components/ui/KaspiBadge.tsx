/**
 * Original typographic payment badge — not a reproduction of Kaspi's logo
 * artwork. Signals "we accept Kaspi transfer" the way a site shows
 * Visa/Mastercard marks, using their brand red as the only accent color
 * on an otherwise fully monochrome site.
 */
export function KaspiBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-[3px] border border-line bg-white px-1.5 py-0.5 text-[12px] font-bold tracking-tight ${className}`}
      style={{ color: "#E4292D" }}
    >
      Kaspi
    </span>
  );
}
