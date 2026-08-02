import Image from "next/image";

/**
 * Official-style Kaspi payment mark (public brand asset).
 * Used wherever we signal Kaspi payment acceptance.
 */
export function KaspiBadge({
  className = "",
  height = 28,
}: {
  className?: string;
  height?: number;
}) {
  const width = Math.round((height * 160) / 48);
  return (
    <span
      className={`inline-flex items-center ${className}`}
      title="Kaspi"
    >
      <Image
        src="/brands/kaspi.svg"
        alt="Kaspi"
        width={width}
        height={height}
        className="h-auto w-auto"
        unoptimized
        priority={false}
      />
    </span>
  );
}
