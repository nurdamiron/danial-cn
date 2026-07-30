import Image from "next/image";
import { Link } from "@/i18n/navigation";

type Props = {
  href: string;
  brand: string;
  name: string;
  priceLabel: string;
  coverUrl: string;
  hoverUrl?: string | null;
};

export function ProductCard({
  href,
  brand,
  name,
  priceLabel,
  coverUrl,
  hoverUrl,
}: Props) {
  return (
    <Link href={href} className="group block card-lift">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <Image
          src={coverUrl}
          alt={name}
          fill
          className="object-contain p-4 transition duration-700 ease-out group-hover:scale-[1.02] group-hover:opacity-0"
          sizes="(max-width:768px) 50vw, 25vw"
        />
        {hoverUrl ? (
          <Image
            src={hoverUrl}
            alt=""
            fill
            className="object-contain p-4 opacity-0 transition duration-700 ease-out group-hover:opacity-100 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : null}
      </div>
      <div className="mt-4 space-y-1.5 px-0.5">
        <p className="text-[10px] tracking-[0.22em] text-muted uppercase">
          {brand}
        </p>
        <p className="text-[15px] font-light tracking-tight">{name}</p>
        <p className="text-sm text-muted">{priceLabel}</p>
      </div>
    </Link>
  );
}
