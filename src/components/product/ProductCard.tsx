import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { BrandMark, brandMarkName } from "@/components/ui/BrandMark";
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
  /**
   * Set only when the product cannot be bought.
   *
   * Every one of the 99 products is currently in stock, so an "in stock" line
   * on each card would repeat itself 99 times and tell a buyer nothing. The
   * absence of this line is the availability; its presence is the exception.
   * Worded by the caller, which renders inside a client component.
   */
  soldOutLabel?: string;
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
  soldOutLabel,
  favorite,
  priority = false,
}: Props) {
  const markName = brandMarkName(brand);
  const visibleColors = colors?.slice(0, MAX_COLOR_DOTS) ?? [];
  const extraColors = colors ? colors.length - visibleColors.length : 0;

  return (
    /*
      The photographs are stills of one piece of luggage on white, and most
      masters are square. Cropping them to fill the 4:5 frame cut a tenth off
      each side — on a phone a buyer saw the middle of a suitcase and not its
      shape. They are fitted whole instead; the frame is already white, so the
      space above and below a square shot is invisible.
    */
    <article className="group relative flex flex-col">
      <Link href={href} className="media lift block aspect-[4/5]">
        <Image
          src={coverUrl}
          alt={name}
          fill
          quality={95}
          priority={priority}
          className={`object-contain p-3 transition duration-700 ease-out ${
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
            className="object-contain p-3 opacity-0 transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
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
        {markName ? (
          <BrandMark
            name={markName}
            height={10}
            label={brand}
            className="text-muted"
          />
        ) : (
          <p className="t-label text-muted">{brand}</p>
        )}

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
                className="aspect-square h-3 w-3 shrink-0 rounded-full ring-1 ring-black/12 ring-inset"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {extraColors > 0 ? (
              <span className="t-data text-muted">+{extraColors}</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-2">
          <p className="t-price text-[1.0625rem] text-ink">{priceLabel}</p>
          {soldOutLabel ? (
            <span className="t-data text-danger">{soldOutLabel}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
