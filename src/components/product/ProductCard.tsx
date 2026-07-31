import Image from "next/image";
import { Link } from "@/i18n/navigation";

type ColorDot = { hex: string; label: string };

type Props = {
  href: string;
  brand: string;
  name: string;
  priceLabel: string;
  coverUrl: string;
  hoverUrl?: string | null;
  colors?: ColorDot[];
};

const MAX_COLOR_DOTS = 4;

export function ProductCard({
  href,
  brand,
  name,
  priceLabel,
  coverUrl,
  hoverUrl,
  colors,
}: Props) {
  const visibleColors = colors?.slice(0, MAX_COLOR_DOTS) ?? [];
  const extraColors = colors ? colors.length - visibleColors.length : 0;
  return (
    <Link href={href} className="group block card-lift">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <Image
          src={coverUrl}
          alt={name}
          fill
          quality={95}
          className="object-contain p-4 transition duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-0"
          sizes="(max-width:768px) 50vw, 33vw"
        />
        {hoverUrl ? (
          <Image
            src={hoverUrl}
            alt=""
            fill
            quality={95}
            className="object-contain p-4 opacity-0 transition duration-700 ease-out group-hover:opacity-100 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 50vw, 33vw"
          />
        ) : null}
      </div>
      <div className="mt-4 space-y-1.5 px-0.5">
        <p className="text-[10px] tracking-[0.22em] text-muted uppercase">
          {brand}
        </p>
        <p className="text-[15px] font-light tracking-tight">{name}</p>
        {visibleColors.length > 0 ? (
          <div className="flex items-center gap-1.5 pt-0.5">
            {visibleColors.map((c, i) => (
              <span
                key={`${c.hex}-${i}`}
                title={c.label}
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {extraColors > 0 ? (
              <span className="text-[10px] text-muted">+{extraColors}</span>
            ) : null}
          </div>
        ) : null}
        <p className="text-sm text-muted">{priceLabel}</p>
      </div>
    </Link>
  );
}
