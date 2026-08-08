import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon } from "@/components/ui/icons";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCinematic } from "@/components/home/HeroCinematic";
import { TrustBar } from "@/components/home/TrustBar";
import { BrandStrip } from "@/components/home/BrandStrip";
import { OrderPath } from "@/components/home/OrderPath";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { EditorialBand } from "@/components/home/EditorialBand";
import {
  listFeaturedProducts,
  listActiveProducts,
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
    description: t("home.heroLead"),
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let featured = await listFeaturedProducts(6);
  if (featured.length === 0) {
    featured = (await listActiveProducts()).slice(0, 6);
  }

  const categories = [
    { key: "cabin" as const, image: "/editorial/cat-cabin.jpg" },
    { key: "checkin" as const, image: "/editorial/cat-checkin.jpg" },
    { key: "set" as const, image: "/editorial/cat-set.jpg" },
    { key: "bag" as const, image: "/editorial/cat-bag.jpg" },
  ];

  return (
    <div>
      <HeroCinematic
        brand={t("brand.name")}
        hero={t("home.hero")}
        lead={t("home.heroLead")}
        catalogLabel={t("cta.viewCatalog")}
        brandsLabel={t("cta.allBrands")}
      />

      <TrustBar />

      <section className="py-20 sm:py-24">
        <Reveal>
          <Container>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted">
                  {t("home.shop")}
                </p>
                <h2 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
                  {t("home.categories")}
                </h2>
              </div>
              <Link
                href="/catalog"
                className="group flex items-center gap-2 text-[11px] tracking-[0.08em] text-muted"
              >
                <span className="underline-offset-4 group-hover:underline">
                  {t("cta.viewCatalog")}
                </span>
                <ArrowIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {categories.map((c) => (
                <Link
                  key={c.key}
                  href={`/catalog?category=${c.key}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-stone"
                >
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    quality={95}
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent" />
                  <p className="absolute inset-x-0 bottom-0 px-4 py-4 text-[12px] tracking-[0.12em] text-paper">
                    {t(`category.${c.key}`)}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </Reveal>
      </section>

      {featured.length > 0 ? (
        <section className="border-t border-line bg-sand py-20 sm:py-24">
          <Reveal>
            <Container>
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-muted">
                    {t("home.bestsellersEyebrow")}
                  </p>
                  <h2 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
                    {t("home.bestsellers")}
                  </h2>
                </div>
                <Link
                  href="/catalog"
                  className="group flex items-center gap-2 text-[11px] tracking-[0.08em] text-muted"
                >
                  <span className="underline-offset-4 group-hover:underline">
                    {t("cta.viewCatalog")}
                  </span>
                  <ArrowIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5">
                {featured.map((p, i) => {
                  const cover = pickCoverUrl(p.images);
                  if (!cover) return null;
                  const hover = p.images.find((img) => img.url !== cover)?.url;
                  const colors = uniqueColorDots(p.variants, locale);
                  const soldOut = !p.variants.some((v) => v.stock > 0);
                  return (
                    <ProductCard
                      key={p.id}
                      href={`/catalog/${p.slug}`}
                      brandKey={p.brandKey}
                      brandName={p.brand}
                      name={localizedName(p, locale)}
                      priceLabel={formatKzt(p.basePriceKzt)}
                      fromLabel={t("product.priceFrom")}
                      coverUrl={cover}
                      hoverUrl={hover}
                      colors={colors}
                      colorsLabel={t("catalog.colorsCount", {
                        n: colors.length,
                      })}
                      tag={t(`category.${p.category}`)}
                      soldOut={soldOut}
                      soldOutLabel={t("product.outOfStock")}
                      viewLabel={t("cta.view")}
                      priority={i < 3}
                    />
                  );
                })}
              </div>
            </Container>
          </Reveal>
        </section>
      ) : null}

      <BrandStrip />
      <EditorialBand />
      <FeatureStrip />
      <OrderPath />

      <section className="border-t border-line bg-paper py-20 sm:py-24">
        <Reveal>
          <Container className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-muted">
                {t("brand.name")}
              </p>
              <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
                {t("home.whyTitle")}
              </h2>
            </div>
            <ul className="space-y-0">
              {[
                t("home.why1"),
                t("home.why2"),
                t("home.why3"),
                t("home.why4"),
              ].map((item, i) => (
                <li
                  key={item}
                  className="flex gap-5 border-b border-line py-5 first:pt-0"
                >
                  <span className="text-[11px] tracking-[0.16em] text-muted">
                    0{i + 1}
                  </span>
                  <span className="text-sm font-light tracking-tight">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Container>
        </Reveal>
      </section>

      <section className="relative overflow-hidden bg-ink py-24 text-paper sm:py-32">
        <Image
          src="/editorial/terminal-crowd.jpg"
          alt=""
          fill
          quality={95}
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <Reveal>
          <Container className="relative text-center">
            <p className="text-[11px] tracking-[0.28em] text-paper/50">
              {t("brand.name")}
            </p>
            <h2 className="mx-auto mt-5 max-w-xl text-2xl font-light tracking-tight sm:text-4xl">
              {t("home.hero")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-paper/65">
              {t("home.orderFlow")}
            </p>
            <div className="mt-9">
              <Link href="/catalog">
                <Button variant="secondary">{t("cta.viewCatalog")}</Button>
              </Link>
            </div>
          </Container>
        </Reveal>
      </section>
    </div>
  );
}
