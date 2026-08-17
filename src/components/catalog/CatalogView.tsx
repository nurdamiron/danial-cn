"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import {
  CatalogFilters,
  CatalogSortBar,
} from "@/components/catalog/CatalogFilters";
import {
  filterCatalog,
  parseCatalogQuery,
  type CatalogItem,
} from "@/lib/catalog-view";

type FilterOptions = {
  brands: { key: string; label: string }[];
  colors: { key: string; label: string; hex: string }[];
  sizes: { key: string; label: string }[];
  minPrice: number;
  maxPrice: number;
};

export function CatalogView({
  items,
  options,
}: {
  items: CatalogItem[];
  options: FilterOptions;
}) {
  const t = useTranslations("catalog");
  const searchParams = useSearchParams();

  const query = useMemo(() => parseCatalogQuery(searchParams), [searchParams]);
  const visible = useMemo(() => filterCatalog(items, query), [items, query]);

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <CatalogFilters
        brands={options.brands}
        colors={options.colors}
        sizes={options.sizes}
        priceMin={options.minPrice}
        priceMax={options.maxPrice}
        resultCount={visible.length}
      />

      <div>
        <CatalogSortBar resultCount={visible.length} />

        {visible.length === 0 ? (
          <div className="card px-6 py-20 text-center">
            <p className="t-display text-lg">{t("empty")}</p>
            <p className="mt-2 text-sm text-muted">{t("tryReset")}</p>
          </div>
        ) : (
          <CatalogGrid items={visible} color={query.color} />
        )}
      </div>
    </div>
  );
}
