import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ReplicaBadge } from "@/components/product/ReplicaBadge";

type Props = {
  href: string;
  brand: string;
  name: string;
  priceLabel: string;
  coverUrl: string;
  hoverUrl?: string | null;
  replicaBadge: string;
};

export function ProductCard({
  href,
  brand,
  name,
  priceLabel,
  coverUrl,
  hoverUrl,
  replicaBadge,
}: Props) {
  return (
    <Link href={href} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        <Image
          src={coverUrl}
          alt={name}
          fill
          className="object-contain p-4 transition duration-500 group-hover:opacity-0"
          sizes="(max-width:768px) 50vw, 25vw"
        />
        {hoverUrl ? (
          <Image
            src={hoverUrl}
            alt=""
            fill
            className="object-contain p-4 opacity-0 transition duration-500 group-hover:opacity-100"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : null}
        <div className="absolute left-3 top-3">
          <ReplicaBadge label={replicaBadge} />
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-[11px] tracking-widest text-muted uppercase">{brand}</p>
        <p className="text-sm">{name}</p>
        <p className="text-sm">{priceLabel}</p>
      </div>
    </Link>
  );
}
