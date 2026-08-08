import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";

type ColorDot = { hex: string; label: string };

type Props = {
  href: string;
  brandKey: string;
  brandName: string;
  name: string;
  priceLabel: string;
  fromLabel?: string;
  coverUrl: string;
  hoverUrl?: string | null;
  colors?: ColorDot[];
  colorsLabel?: string;
  /** Short category or size hint shown as an overlay tag, e.g. "Ручная кладь". */
  tag?: string;
  soldOut?: boolean;
  soldOutLabel?: string;
  viewLabel?: string;
  priority?: boolean;
};

const MAX_COLOR_DOTS = 5;

export function ProductCard({
  href,
  brandKey,
  brandName,
  name,
  priceLabel,
  fromLabel,
  coverUrl,
  hoverUrl,
  colors,
  colorsLabel,
  tag,
  soldOut = false,
  soldOutLabel,
  viewLabel,
  priority = false,
}: Props) {
  const visibleColors = colors?.slice(0, MAX_COLOR_DOTS) ?? [];
  const extraColors = colors ? colors.length - visibleColors.length : 0;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone">
        <Image
          src={coverUrl}
          alt={name}
          fill
          quality={95}
          priority={priority}
          className={`object-cover transition duration-[900ms] ease-out ${
            hoverUrl
              ? "group-hover:opacity-0"
              : "group-hover:scale-[1.04]"
          } ${soldOut ? "opacity-60" : ""}`}
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 30vw"
        />
        {hoverUrl ? (
          <Image
            src={hoverUrl}
            alt=""
            fill
            quality={95}
            className="object-cover opacity-0 transition duration-[900ms] ease-out group-hover:scale-[1.04] group-hover:opacity-100"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 30vw"
          />
        ) : null}

        {tag ? (
          <span className="absolute top-0 left-0 bg-paper/92 px-2.5 py-1.5 text-[9px] tracking-[0.14em] text-ink backdrop-blur-sm sm:text-[10px]">
            {tag}
          </span>
        ) : null}

        {soldOut && soldOutLabel ? (
          <span className="absolute top-0 right-0 bg-ink px-2.5 py-1.5 text-[9px] tracking-[0.14em] text-paper sm:text-[10px]">
            {soldOutLabel}
          </span>
        ) : null}

        {/* Desktop affordance. Hidden from touch layouts where hover never fires. */}
        {viewLabel && !soldOut ? (
          <span className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 bg-paper/95 py-2.5 text-center text-[11px] tracking-[0.14em] text-ink opacity-0 backdrop-blur-sm transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            {viewLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-3.5 space-y-2 sm:mt-4">
        <BrandMark
          name={brandKey}
          height={10}
          label={brandName}
          className="text-muted"
        />

        <p className="text-[13px] leading-snug font-light tracking-tight sm:text-[15px]">
          {name}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-0.5">
          <p className="text-[13px] text-ink sm:text-sm">
            {fromLabel ? <span className="text-muted">{fromLabel} </span> : null}
            <span className="font-medium">{priceLabel}</span>
          </p>

          {visibleColors.length > 0 ? (
            <div
              className="flex items-center gap-1.5"
              aria-label={colorsLabel}
              title={visibleColors.map((c) => c.label).join(", ")}
            >
              {visibleColors.map((c, i) => (
                <span
                  key={`${c.hex}-${i}`}
                  className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/15 transition group-hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {extraColors > 0 ? (
                <span className="text-[10px] text-muted">+{extraColors}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
