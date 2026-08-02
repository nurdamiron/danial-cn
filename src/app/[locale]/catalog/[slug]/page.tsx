import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import { ProductCard } from "@/components/product/ProductCard";
import { SizeCompare } from "@/components/product/SizeCompare";
import { formatKzt } from "@/lib/money";
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

  return (
    <div className="border-b border-line bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-10 sm:py-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5 text-[11px] text-muted lg:mb-8"
        >
          <Link href="/catalog" className="hover:text-ink hover:underline">
            {t("catalog.title")}
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href={`/catalog?category=${product.category}`}
            className="hover:text-ink hover:underline"
          >
            {t(`category.${product.category}`)}
          </Link>
          <span aria-hidden="true">·</span>
          <span className="text-ink">{localizedName(product, locale)}</span>
        </nav>

        <div className="mb-8 space-y-3 lg:mb-10">
          <p className="text-[10px] tracking-[0.16em] text-muted">
            {localizedBrand(
              product as { brand: string; brandRu?: string; brandKk?: string },
              locale,
            )}
          </p>
          <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
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
        />

        <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-[10px] tracking-[0.16em]">
              {t("product.description")}
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              {localizedDescription(product, locale)}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-muted/70">
              {disclaimerText}
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-[10px] tracking-[0.22em] uppercase">
              {t("product.specs")}
            </h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-[11px] text-muted">
                  {t("catalog.material")}
                </dt>
                <dd className="mt-0.5 font-light">
                  {localizedMaterial(product, locale)}
                </dd>
              </div>
              {product.wheels ? (
                <div>
                  <dt className="text-[11px] text-muted">
                    {t("product.wheels")}
                  </dt>
                  <dd className="mt-0.5 font-light">{product.wheels}</dd>
                </div>
              ) : null}
              {product.lockType ? (
                <div>
                  <dt className="text-[11px] text-muted">
                    {t("product.lock")}
                  </dt>
                  <dd className="mt-0.5 font-light">{product.lockType}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 border-t border-line pt-6">
              <p className="mb-4 text-[11px] text-muted">
                {t("product.sizes")}
              </p>
              <SizeCompare sizes={uniqueSizes(product.variants, locale)} />
            </div>

            <p className="mt-6 text-xs text-muted">
              {t("delivery.cargo")} · {t("delivery.avia")} ·{" "}
              {t("delivery.express")} — {t("payment.kaspiNote")}
            </p>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-14 border-t border-line pt-10">
            <h2 className="mb-6 text-[10px] tracking-[0.16em] uppercase">
              {t("product.related")}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5">
              {related.map((p) => {
                const relCover = pickCoverUrl(p.images);
                if (!relCover) return null;
                const relHover = p.images.find((i) => i.url !== relCover)?.url;
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
                    coverUrl={relCover}
                    hoverUrl={relHover}
                    colors={uniqueColorDots(p.variants, locale)}
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
