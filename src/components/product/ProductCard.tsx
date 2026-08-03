import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import type { FavoriteItem } from "@/store/favorites";

type ColorDot = { hex: string; label: string };

type Props = {
  href: string;
  brand: string;
  name: string;
  priceLabel: string;
  coverUrl: string;
  hoverUrl?: string | null;
  colors?: ColorDot[];
  /** Machined data — cm · L · kg. Shown under the name. */
  specs?: string;
  /** Size code on the tag, e.g. "55 см". */
  sizeCode?: string;
  favorite?: Omit<FavoriteItem, "addedAt">;
  priority?: boolean;
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
  specs,
  sizeCode,
  favorite,
  priority = false,
}: Props) {
  const visibleColors = colors?.slice(0, MAX_COLOR_DOTS) ?? [];
  const extraColors = colors ? colors.length - visibleColors.length : 0;

  return (
    <article className="group relative flex flex-col">
      <Link href={href} className="media lift block aspect-[4/5]">
        <Image
          src={coverUrl}
          alt={name}
          fill
          quality={95}
          priority={priority}
          className={`object-contain p-5 transition duration-700 ease-out sm:p-7 ${
            hoverUrl
              ? "group-hover:scale-[1.03] group-hover:opacity-0"
              : "group-hover:scale-[1.03]"
          }`}
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
        />
        {hoverUrl ? (
          <Image
            src={hoverUrl}
            alt=""
            fill
            quality={95}
            className="object-contain p-5 opacity-0 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100 sm:p-7"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
        ) : null}

        {sizeCode ? (
          <span className="tag absolute top-3 left-3">{sizeCode}</span>
        ) : null}
      </Link>

      {favorite ? (
        <FavoriteButton item={favorite} className="absolute top-3 right-3" />
      ) : null}

      <div className="mt-4 flex flex-1 flex-col gap-1.5">
        <p className="t-label text-muted">{brand}</p>

        <h3 className="t-display t-h3">
          <Link href={href} className="transition hover:opacity-60">
            {name}
          </Link>
        </h3>

        {specs ? <p className="t-data text-muted">{specs}</p> : null}

        {visibleColors.length > 0 ? (
          <div className="flex items-center gap-1.5 pt-1">
            {visibleColors.map((c, i) => (
              <span
                key={`${c.hex}-${i}`}
                title={c.label}
                className="h-3 w-3 shrink-0 rounded-full ring-1 ring-black/12 ring-inset"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {extraColors > 0 ? (
              <span className="t-data text-muted">+{extraColors}</span>
            ) : null}
          </div>
        ) : null}

        <p className="t-price mt-auto pt-2 text-[1.0625rem] text-ink">
          {priceLabel}
        </p>
      </div>
    </article>
  );
}
