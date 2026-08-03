import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductCard } from "@/components/product/ProductCard";
import { SizeCompare } from "@/components/product/SizeCompare";
import { formatKzt } from "@/lib/money";
import { formatDimensions, formatSpecLine } from "@/lib/specs";
import { SITE } from "@/lib/site";
import { isStaticCatalog } from "@/lib/static-catalog";
import {
  getProductBySlug,
  listActiveProducts,
  localizedBrand,
  localizedDescription,
  localizedMaterial,
  localizedName,
  pickCoverUrl,
  uniqueColorDots,
  uniqueSizes,
} from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const t = await getTranslations({ locale });
  const name = localizedName(product, locale);
  const description = localizedDescription(product, locale);
  const cover = pickCoverUrl(product.images);

  return {
    title: name,
    description,
    alternates: { canonical: `/${locale}/catalog/${slug}` },
    openGraph: {
      title: `${name} — ${t("brand.name")}`,
      description,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cover = pickCoverUrl(product.images);
  if (!cover) notFound();

  const { getSiteConfig } = await import("@/lib/settings");
  const config = await getSiteConfig();
  const wa = config.whatsappE164;
  const disclaimerText =
    (locale === "kk" ? config.disclaimerKk : config.disclaimerRu) ||
    t("product.replicaNotice");
  const kaspiNote = locale === "kk" ? config.kaspiNoteKk : config.kaspiNoteRu;
  const deliveryNote = `${t("delivery.cargo")} · ${t("delivery.avia")} · ${t("delivery.express")} — ${t("home.trustDelivery")}`;
  const dimensions = formatDimensions(product, locale);

  const related = (
    await listActiveProducts({ category: product.category })
  ).filter((p) => p.slug !== product.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedName(product, locale),
    description: localizedDescription(product, locale),
    image: [`${SITE.url}${cover}`],
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: localizedBrand(
        product as { brand: string; brandRu?: string; brandKk?: string },
        locale,
      ),
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "KZT",
      price: product.basePriceKzt,
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE.url}/${locale}/catalog/${slug}`,
    },
  };

  const images = product.images.map((i) => ({
    id: i.id,
    url: i.url,
    isCover: i.isCover,
    sortOrder: i.sortOrder,
    colorKey:
      "colorKey" in i
        ? ((i as { colorKey?: string | null }).colorKey ?? null)
        : null,
  }));

  const variants = product.variants.map((v) => ({
    id: v.id,
    colorKey: v.colorKey,
    colorLabelRu: v.colorLabelRu,
    colorLabelKk: v.colorLabelKk,
    colorHex:
      "colorHex" in v
        ? ((v as { colorHex?: string | null }).colorHex ?? null)
        : null,
    sizeKey: v.sizeKey,
    sizeLabelRu: v.sizeLabelRu,
    sizeLabelKk: v.sizeLabelKk,
    priceKzt: v.priceKzt,
    stock: v.stock,
  }));

  const specRows = [
    {
      label: t("catalog.material"),
      value: localizedMaterial(product, locale),
    },
    product.wheels
      ? { label: t("product.wheels"), value: product.wheels }
      : null,
    product.lockType
      ? { label: t("product.lock"), value: product.lockType }
      : null,
    dimensions
      ? { label: t("product.sizes"), value: dimensions, data: true }
      : null,
    product.volumeL
      ? { label: t("product.volume"), value: `${product.volumeL} л`, data: true }
      : null,
    product.weightKg
      ? {
          label: t("product.weight"),
          value: `${product.weightKg.toLocaleString(locale === "kk" ? "kk-KZ" : "ru-RU")} кг`,
          data: true,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string; data?: boolean }[];

  return (
    <div className="bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="pt-6 pb-14 sm:pt-8 sm:pb-20">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex flex-wrap items-center gap-2 text-[0.8125rem] text-muted lg:mb-9"
        >
          <Link href="/catalog" className="link-quiet">
            {t("catalog.title")}
          </Link>
          <span aria-hidden="true" className="text-line-strong">
            /
          </span>
          <Link
            href={`/catalog?category=${product.category}`}
            className="link-quiet"
          >
            {t(`category.${product.category}`)}
          </Link>
          <span aria-hidden="true" className="text-line-strong">
            /
          </span>
          <span className="text-ink">{localizedName(product, locale)}</span>
        </nav>

        <div className="mb-8 lg:mb-10">
          <p className="t-label text-muted">
            {localizedBrand(
              product as { brand: string; brandRu?: string; brandKk?: string },
              locale,
            )}
          </p>
          <h1 className="t-display t-h1 mt-2.5">
            {localizedName(product, locale)}
          </h1>
        </div>

        <ProductConfigurator
          product={{
            id: product.id,
            slug: product.slug,
            brand: product.brand,
            nameRu: product.nameRu,
            nameKk: product.nameKk,
            materialRu: product.materialRu,
            materialKk: product.materialKk,
            basePriceKzt: product.basePriceKzt,
          }}
          variants={variants}
          images={images}
          siteUrl={SITE.url}
          waE164={wa}
          kaspiNote={kaspiNote}
          deliveryNote={deliveryNote}
        />

        <div className="mt-16 grid gap-12 border-t border-line pt-12 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="t-label text-muted">{t("product.description")}</h2>
            <p className="t-lead mt-4 text-ink/85">
              {localizedDescription(product, locale)}
            </p>
            <p className="t-micro mt-4 text-muted">{disclaimerText}</p>

            <div className="mt-8 border-t border-line pt-8">
              <p className="t-label text-muted">{t("product.sizes")}</p>
              <div className="mt-5 max-w-sm">
                <SizeCompare sizes={uniqueSizes(product.variants, locale)} />
              </div>
            </div>
          </div>

          <div>
            <h2 className="t-label text-muted">{t("product.specs")}</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-6 py-3"
                >
                  <dt className="text-sm text-muted">{row.label}</dt>
                  <dd
                    className={`text-right text-sm ${row.data ? "t-data text-ink" : ""}`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-16 border-t border-line pt-12">
            <h2 className="t-display t-h3 mb-7">{t("product.related")}</h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((p) => {
                const relCover = pickCoverUrl(p.images);
                if (!relCover) return null;
                const relHover = p.images.find((i) => i.url !== relCover)?.url;
                const relName = localizedName(p, locale);
                const relPrice = formatKzt(p.basePriceKzt);
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
                    name={relName}
                    priceLabel={relPrice}
                    coverUrl={relCover}
                    hoverUrl={relHover}
                    colors={uniqueColorDots(p.variants, locale)}
                    specs={formatSpecLine(p, locale) ?? undefined}
                    favorite={{
                      productId: p.id,
                      slug: p.slug,
                      brand: p.brand,
                      name: relName,
                      priceLabel: relPrice,
                      coverUrl: relCover,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
