import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { CatalogView } from "@/components/catalog/CatalogView";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { formatSpecLine } from "@/lib/specs";
import {
  getCatalogFilterOptionsAsync,
  listActiveProducts,
  localizedBrand,
  localizedName,
  pickCoverUrl,
  uniqueColorDots,
} from "@/lib/products";
import type { CatalogItem } from "@/lib/catalog-view";
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

type SourceProduct = Awaited<ReturnType<typeof listActiveProducts>>[number];

function toCatalogItem(p: SourceProduct, locale: string): CatalogItem | null {
  const cover = pickCoverUrl(p.images);
  if (!cover) return null;

  const imagesByColor: Record<string, string[]> = {};
  for (const image of p.images) {
    const colorKey = (image as { colorKey?: string | null }).colorKey;
    if (!colorKey) continue;
    (imagesByColor[colorKey] ??= []).push(image.url);
  }

  const prices = p.variants
    .map((v) => v.priceKzt ?? p.basePriceKzt)
    .filter((n): n is number => n != null);

  const name = localizedName(p, locale);

  return {
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    brandLabel: localizedBrand(p, locale),
    name,
    category: p.category,
    basePriceKzt: p.basePriceKzt,
    minPriceKzt: Math.min(...prices, p.basePriceKzt),
    priceLabel: formatKzt(p.basePriceKzt),
    specs: formatSpecLine(p, locale) ?? undefined,
    coverUrl: cover,
    hoverUrl: p.images.find((i) => i.url !== cover)?.url ?? null,
    colors: uniqueColorDots(p.variants, locale),
    variants: p.variants.map((v) => ({
      colorKey: v.colorKey,
      sizeKey: v.sizeKey,
      stock: v.stock,
    })),
    imagesByColor,
    sortOrder: p.sortOrder ?? 0,
    createdAt: new Date(p.createdAt).toISOString(),
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  // Everything, unfiltered. Reading searchParams here would make the page
  // dynamic again, and the narrowing is the browser's job now.
  const products = await listActiveProducts({});
  const items = products
    .map((p) => toCatalogItem(p, locale))
    .filter((item): item is CatalogItem => item !== null);

  const options = await getCatalogFilterOptionsAsync(locale);

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("catalog.title")}
        subtitle={t("delivery.subtitle")}
      />

      <Container className="py-8 sm:py-12">
        {/*
          The fallback is what gets prerendered: CatalogView reads the address
          bar, which excludes it from the static HTML. So the unfiltered grid
          ships in the page, in the same two-column layout, and the filtering
          version takes over on hydration without the cards moving.
        */}
        <Suspense
          fallback={
            <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
              <div />
              <CatalogGrid items={items} />
            </div>
          }
        >
          <CatalogView items={items} options={options} />
        </Suspense>
      </Container>
    </div>
  );
}
