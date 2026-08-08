import Image from "next/image";

/**
 * Kaspi payment mark. Sized by height — the width follows the asset's 141:33
 * ratio, and both are pinned so the badge can never collapse inside a flex row.
 */
export function KaspiBadge({
  className = "",
  height = 28,
}: {
  className?: string;
  height?: number;
}) {
  const width = Math.round((height * 141) / 33);
  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      title="Kaspi"
      style={{ width, height }}
    >
      <Image
        src="/brands/kaspi.svg"
        alt="Kaspi"
        width={width}
        height={height}
        unoptimized
      />
    </span>
  );
}
