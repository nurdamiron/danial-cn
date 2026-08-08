import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { CardIcon, RulerIcon, TruckIcon } from "@/components/ui/icons";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductCard } from "@/components/product/ProductCard";
import { formatKzt } from "@/lib/money";
import { SITE } from "@/lib/site";
import { isStaticCatalog } from "@/lib/static-catalog";
import {
  getBrand,
  getProductBySlug,
  listActiveProducts,
  localizedDescription,
  localizedLock,
  localizedMaterial,
  localizedName,
  localizedWheels,
  pickCoverUrl,
  uniqueColorDots,
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
    title: `${name} ${product.brand}`,
    description,
    alternates: { canonical: `/${locale}/catalog/${slug}` },
    openGraph: {
      title: `${name} ${t("brand.name")}`,
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

  const brand = getBrand(product.brandKey);
  const wa = SITE.whatsappE164;

  let disclaimer: string | null = null;
  if (!isStaticCatalog()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const settings = await prisma.siteSettings.findUnique({
        where: { id: 1 },
      });
      disclaimer =
        (locale === "kk" ? settings?.disclaimerKk : settings?.disclaimerRu) ??
        null;
    } catch {
      disclaimer = null;
    }
  }
  const disclaimerText = disclaimer ?? t("product.replicaNotice");

  const related = (await listActiveProducts({ category: product.category }))
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedName(product, locale),
    description: localizedDescription(product, locale),
    image: [`${SITE.url}${cover}`],
    sku: product.id,
    brand: { "@type": "Brand", name: product.brand },
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
    colorKey: i.colorKey ?? null,
  }));

  const variants = product.variants.map((v) => ({
    id: v.id,
    colorKey: v.colorKey,
    colorLabelRu: v.colorLabelRu,
    colorLabelKk: v.colorLabelKk,
    colorHex: v.colorHex ?? null,
    sizeKey: v.sizeKey,
    sizeLabelRu: v.sizeLabelRu,
    sizeLabelKk: v.sizeLabelKk,
    priceKzt: v.priceKzt,
    stock: v.stock,
  }));

  const specs = [
    { label: t("catalog.material"), value: localizedMaterial(product, locale) },
    { label: t("product.wheels"), value: localizedWheels(product, locale) },
    { label: t("product.lock"), value: localizedLock(product, locale) },
    {
      label: t("product.dimensions"),
      value:
        product.heightCm && product.widthCm && product.depthCm
          ? t("product.dimensionsValue", {
              h: product.heightCm,
              w: product.widthCm,
              d: product.depthCm,
            })
          : "",
    },
    {
      label: t("product.volume"),
      value: product.volumeL ? `${product.volumeL} л` : "",
    },
    {
      label: t("product.weight"),
      value: product.weightKg ? `${product.weightKg} кг` : "",
    },
  ].filter((s) => s.value);

  return (
    <div className="border-b border-line bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-10 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-muted lg:mb-8"
        >
          <Link href="/catalog" className="hover:text-ink hover:underline">
            {t("catalog.title")}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={`/catalog?category=${product.category}`}
            className="hover:text-ink hover:underline"
          >
            {t(`category.${product.category}`)}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{localizedName(product, locale)}</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 lg:mb-10">
          <div className="space-y-3">
            <Link
              href={`/catalog?brand=${product.brandKey}`}
              className="inline-flex text-ink transition hover:opacity-60"
            >
              <BrandMark
                name={product.brandKey}
                height={14}
                label={product.brand}
              />
            </Link>
            <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
              {localizedName(product, locale)}
            </h1>
          </div>
          {brand ? (
            <p className="text-[11px] tracking-[0.14em] text-muted">
              {locale === "kk" ? brand.taglineKk : brand.taglineRu}
            </p>
          ) : null}
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
        />

        <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-14">
          <div>
            <h2 className="mb-4 text-[10px] tracking-[0.22em] uppercase">
              {t("product.description")}
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              {localizedDescription(product, locale)}
            </p>
            <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
              {disclaimerText}
            </p>

            <div className="mt-8 space-y-4 border-t border-line pt-6">
              <h3 className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase">
                <TruckIcon className="h-4 w-4" />
                {t("product.deliveryTitle")}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {t("product.deliveryText")}
              </p>
              <p className="flex items-center gap-2 text-xs text-muted">
                <CardIcon className="h-4 w-4" />
                {t("payment.accepted")}
                <BrandMark
                  name="pay-kaspi"
                  height={18}
                  label="Kaspi"
                  colored
                />
              </p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase">
              <RulerIcon className="h-4 w-4" />
              {t("product.specs")}
            </h2>
            <dl className="border-t border-line">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                >
                  <dt className="text-[11px] tracking-[0.06em] text-muted">
                    {s.label}
                  </dt>
                  <dd className="text-right text-sm font-light">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-14 border-t border-line pt-10">
            <h2 className="mb-6 text-[10px] tracking-[0.22em] uppercase">
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5">
              {related.map((p) => {
                const relCover = pickCoverUrl(p.images);
                if (!relCover) return null;
                const relHover = p.images.find(
                  (img) => img.url !== relCover,
                )?.url;
                const colors = uniqueColorDots(p.variants, locale);
                return (
                  <ProductCard
                    key={p.id}
                    href={`/catalog/${p.slug}`}
                    brandKey={p.brandKey}
                    brandName={p.brand}
                    name={localizedName(p, locale)}
                    priceLabel={formatKzt(p.basePriceKzt)}
                    fromLabel={t("product.priceFrom")}
                    coverUrl={relCover}
                    hoverUrl={relHover}
                    colors={colors}
                    colorsLabel={t("catalog.colorsCount", { n: colors.length })}
                    viewLabel={t("cta.view")}
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
