import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import {
  CatalogFilters,
  CatalogSortBar,
} from "@/components/catalog/CatalogFilters";
import {
  getCatalogFilterOptions,
  listActiveProducts,
  localizedBrand,
  localizedName,
  pickCoverUrl,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const category =
    typeof sp.category === "string" ? sp.category : undefined;
  const brand = typeof sp.brand === "string" ? sp.brand : undefined;
  const colorKey = typeof sp.color === "string" ? sp.color : undefined;
  const sizeKey = typeof sp.size === "string" ? sp.size : undefined;
  const minPrice =
    typeof sp.minPrice === "string" && sp.minPrice
      ? Number(sp.minPrice)
      : undefined;
  const maxPrice =
    typeof sp.maxPrice === "string" && sp.maxPrice
      ? Number(sp.maxPrice)
      : undefined;
  const inStock = sp.inStock === "1" || sp.inStock === "true";
  const sort =
    sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "new"
      ? sp.sort
      : "new";

  const products = await listActiveProducts({
    category,
    brand,
    colorKey,
    sizeKey,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    inStock: inStock || undefined,
    sort,
  });

  const options = getCatalogFilterOptions(locale);

  return (
    <div>
      <div className="border-b border-line bg-white">
        <Container className="py-10 sm:py-14">
          <p className="text-[10px] tracking-[0.2em] text-muted">
            {t("brand.name")}
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
            {t("catalog.title")}
          </h1>
          <p className="mt-3 text-sm text-muted lg:hidden">
            {t("catalog.found", { n: products.length })}
          </p>
        </Container>
      </div>

      <Container className="py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[16.5rem_1fr] lg:gap-12">
          <Suspense fallback={null}>
            <CatalogFilters
              brands={options.brands}
              colors={options.colors}
              sizes={options.sizes}
              priceMin={options.minPrice}
              priceMax={options.maxPrice}
              resultCount={products.length}
            />
          </Suspense>

          <div>
            <Suspense fallback={null}>
              <CatalogSortBar resultCount={products.length} />
            </Suspense>

            {products.length === 0 ? (
              <div className="border border-line bg-paper py-20 text-center">
                <p className="text-sm text-muted">{t("catalog.empty")}</p>
                <p className="mt-2 text-xs text-muted">
                  {t("catalog.tryReset")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5">
                {products.map((p) => {
                  const cover = pickCoverUrl(p.images);
                  if (!cover) return null;
                  // prefer image matching selected color for cover
                  let displayCover = cover;
                  let hover = p.images.find((i) => i.url !== cover)?.url;
                  if (colorKey) {
                    const colorImgs = p.images.filter(
                      (i) =>
                        "colorKey" in i &&
                        (i as { colorKey?: string }).colorKey === colorKey,
                    );
                    if (colorImgs[0]) {
                      displayCover = colorImgs[0].url;
                      hover = colorImgs[1]?.url ?? hover;
                    }
                  }
                  return (
                    <ProductCard
                      key={p.id}
                      href={`/catalog/${p.slug}`}
                      brand={localizedBrand(
                        p as {
                          brand: string;
                          brandRu?: string;
                          brandKk?: string;
                        },
                        locale,
                      )}
                      name={localizedName(p, locale)}
                      priceLabel={formatKzt(p.basePriceKzt)}
                      coverUrl={displayCover}
                      hoverUrl={hover}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
