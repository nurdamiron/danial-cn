import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { BrandMark } from "@/components/ui/BrandMark";
import { ArrowIcon } from "@/components/ui/icons";
import { formatKzt } from "@/lib/money";
import {
  getBrands,
  listActiveProducts,
  localizedName,
  pickCoverUrl,
} from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("brands.title"),
    description: t("brands.subtitle"),
    alternates: { canonical: `/${locale}/brands` },
  };
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const brands = getBrands();
  const products = await listActiveProducts();

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("brands.title")}
        subtitle={t("brands.subtitle")}
      />

      <Container className="py-14 sm:py-20">
        <div className="space-y-20 sm:space-y-24">
          {brands.map((brand, index) => {
            const items = products.filter((p) => p.brandKey === brand.key);
            const lead = items[0];
            const leadCover = lead ? pickCoverUrl(lead.images) : null;

            return (
              <Reveal key={brand.key}>
                <section
                  className={`grid gap-8 lg:grid-cols-12 lg:gap-12 ${
                    index % 2 === 1 ? "lg:[&>figure]:order-last" : ""
                  }`}
                >
                  {leadCover ? (
                    <figure className="relative aspect-[4/3] overflow-hidden bg-stone lg:col-span-5 lg:aspect-[4/5]">
                      <Image
                        src={leadCover}
                        alt={brand.name}
                        fill
                        quality={95}
                        sizes="(max-width:1024px) 100vw, 40vw"
                        className="object-cover"
                      />
                    </figure>
                  ) : null}

                  <div className="lg:col-span-7 lg:py-4">
                    <BrandMark
                      name={brand.key}
                      height={22}
                      label={brand.name}
                      className="text-ink"
                    />
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                      {locale === "kk" ? brand.taglineKk : brand.taglineRu}
                    </p>
                    <p className="mt-2 text-[11px] tracking-[0.14em] text-muted/70">
                      {t("brands.modelsIn")} {brand.count}
                    </p>

                    <ul className="mt-8 border-t border-line">
                      {items.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/catalog/${p.slug}`}
                            className="group flex items-center justify-between gap-4 border-b border-line py-4 transition hover:px-2"
                          >
                            <span className="text-sm font-light tracking-tight">
                              {localizedName(p, locale)}
                            </span>
                            <span className="flex items-center gap-3 text-sm text-muted">
                              {t("product.priceFrom")}{" "}
                              {formatKzt(p.basePriceKzt)}
                              <ArrowIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/catalog?brand=${brand.key}`}
                      className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.14em] text-ink underline-offset-4 hover:underline"
                    >
                      {t("cta.shopBrand")}
                      <ArrowIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </section>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
