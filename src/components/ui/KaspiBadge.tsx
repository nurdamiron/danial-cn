import Image from "next/image";

/**
 * Kaspi payment mark. Square icon, sized by height — width matches so the
 * badge can never collapse inside a flex row.
 */
export function KaspiBadge({
  className = "",
  height = 28,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      title="Kaspi"
      style={{ width: height, height }}
    >
      <Image
        src="/brands/kaspi.png"
        alt="Kaspi"
        width={height}
        height={height}
        unoptimized
      />
    </span>
  );
}
