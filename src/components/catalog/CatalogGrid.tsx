import { ProductCard } from "@/components/product/ProductCard";
import { coverFor, type CatalogItem } from "@/lib/catalog-view";

/**
 * The grid itself, with no hooks in it.
 *
 * That matters: the filtered version runs inside a client component that reads
 * the address bar, and anything reading the address bar is excluded from the
 * prerendered HTML. Keeping the markup here lets the same component render the
 * unfiltered grid into the static page, so the catalogue is in the HTML for
 * search engines and for the first paint, before any JavaScript runs.
 */
export function CatalogGrid({
  items,
  color,
}: {
  items: CatalogItem[];
  color?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 xl:grid-cols-3">
      {items.map((item, i) => {
        const { cover, hover } = coverFor(item, color);
        return (
          <ProductCard
            key={item.id}
            href={`/catalog/${item.slug}`}
            brand={item.brandLabel}
            name={item.name}
            priceLabel={item.priceLabel}
            coverUrl={cover}
            hoverUrl={hover}
            colors={item.colors}
            specs={item.specs}
            priority={i < 3}
            favorite={{
              productId: item.id,
              slug: item.slug,
              brand: item.brand,
              name: item.name,
              priceLabel: item.priceLabel,
              coverUrl: cover,
            }}
          />
        );
      })}
    </div>
  );
}
