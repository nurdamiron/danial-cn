import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "@/components/product/ProductCard";
import { formatSpecLine } from "@/lib/specs";
import {
  CatalogFilters,
  CatalogSortBar,
} from "@/components/catalog/CatalogFilters";
import {
  getCatalogFilterOptionsAsync,
  listActiveProducts,
  localizedBrand,
  localizedName,
  pickCoverUrl,
  uniqueColorDots,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("catalog.title"),
    description: t("home.hero"),
    alternates: { canonical: `/${locale}/catalog` },
  };
}

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

  const options = await getCatalogFilterOptionsAsync(locale);

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("catalog.title")}
        subtitle={t("delivery.subtitle")}
        aside={
          <p className="t-data text-muted lg:hidden">
            {t("catalog.found", { n: products.length })}
          </p>
        }
      />

      <Container className="py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
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
              <div className="card px-6 py-20 text-center">
                <p className="t-display text-lg">{t("catalog.empty")}</p>
                <p className="mt-2 text-sm text-muted">
                  {t("catalog.tryReset")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 xl:grid-cols-3">
                {products.map((p, i) => {
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
                  const name = localizedName(p, locale);
                  const priceLabel = formatKzt(p.basePriceKzt);
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
                      name={name}
                      priceLabel={priceLabel}
                      coverUrl={displayCover}
                      hoverUrl={hover}
                      colors={uniqueColorDots(p.variants, locale)}
                      specs={formatSpecLine(p, locale) ?? undefined}
                      priority={i < 3}
                      favorite={{
                        productId: p.id,
                        slug: p.slug,
                        brand: p.brand,
                        name,
                        priceLabel,
                        coverUrl: displayCover,
                      }}
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
