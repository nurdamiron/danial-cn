import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeShopHero } from "@/components/home/HomeShopHero";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import {
  listFeaturedProducts,
  listActiveProducts,
  localizedName,
  pickCoverUrl,
  uniqueColorDots,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";

function brandForLocale(
  p: { brand: string; brandRu?: string; brandKk?: string },
  locale: string,
) {
  if (locale === "kk" && p.brandKk) return p.brandKk;
  if (p.brandRu) return p.brandRu;
  return p.brand;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    description: t("home.hero"),
    alternates: { canonical: `/${locale}` },
  };
}

/**
 * Shop-first home (app structure like reference):
 * hero compact → categories → brands → products → trust strip
 * Bottom nav lives in layout (Home · Catalog · Cart · Profile)
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const allProducts = await listActiveProducts();
  let featured = await listFeaturedProducts(12);
  if (featured.length === 0) {
    featured = allProducts.slice(0, 12);
  }

  const brands = [
    ...new Set(allProducts.map((p) => p.brand).filter(Boolean)),
  ];

  const categories = [
    {
      key: "cabin" as const,
      href: "/catalog?category=cabin",
      image: "/products/alu-cabin-55/silver-front.jpg",
    },
    {
      key: "checkin" as const,
      href: "/catalog?category=checkin",
      image: "/products/pc-checkin-75/01-front.jpg",
    },
    {
      key: "set" as const,
      href: "/catalog?category=set",
      image: "/products/soft-cabin-55/01-front.jpg",
    },
    {
      key: "bag" as const,
      href: "/catalog?category=bag",
      image: "/products/soft-cabin-55/02-interior.jpg",
    },
  ];

  return (
    <div className="bg-sand">
      {/* 1. Compact hero */}
      <HomeShopHero
        brand={t("brand.name")}
        title={t("home.hero")}
        subtitle={t("home.orderFlow")}
        catalogLabel={t("cta.viewCatalog")}
        kaspiNote={t("payment.kaspiNote")}
      />

      {/* 2. Categories — quick entry like shop chips/tiles */}
      <section className="border-b border-line bg-paper py-6 sm:py-8">
        <Container>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[11px] tracking-[0.18em] text-muted uppercase">
              {t("home.categories")}
            </h2>
            <Link
              href="/catalog"
              className="text-[11px] text-muted underline-offset-4 hover:underline"
            >
              {t("cta.viewCatalog")}
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {categories.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="relative aspect-square">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    quality={90}
                    className="object-contain p-2 transition group-hover:scale-105 sm:p-3"
                    sizes="25vw"
                  />
                </div>
                <p className="truncate border-t border-line px-1 py-2 text-center text-[10px] tracking-wide sm:text-[11px]">
                  {t(`category.${c.key}`)}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. Brands row */}
      {brands.length > 0 ? (
        <section className="border-b border-line bg-sand py-4">
          <Container>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {brands.map((b) => (
                <Link
                  key={b}
                  href={`/catalog?brand=${encodeURIComponent(b)}`}
                  className="shrink-0 rounded-full border border-line bg-paper px-4 py-2 text-xs tracking-wide text-ink transition hover:border-ink"
                >
                  {b}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* 4. Product feed — main shop content */}
      <section className="py-6 sm:py-10">
        <Container>
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.18em] text-muted uppercase">
                {t("home.shop")}
              </p>
              <h2 className="mt-1 text-xl font-light tracking-tight sm:text-2xl">
                {t("home.bestsellers")}
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-[11px] text-muted underline-offset-4 hover:underline"
            >
              {t("cta.viewCatalog")}
            </Link>
          </div>

          {featured.length === 0 ? (
            <p className="border border-line bg-paper py-12 text-center text-sm text-muted">
              {t("catalog.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((p) => {
                const cover = pickCoverUrl(p.images);
                if (!cover) return null;
                const hover = p.images.find((i) => i.url !== cover)?.url;
                const brand = brandForLocale(
                  p as { brand: string; brandRu?: string; brandKk?: string },
                  locale,
                );
                return (
                  <ProductCard
                    key={p.id}
                    href={`/catalog/${p.slug}`}
                    brand={brand}
                    name={localizedName(p, locale)}
                    priceLabel={formatKzt(p.basePriceKzt)}
                    coverUrl={cover}
                    hoverUrl={hover}
                    colors={uniqueColorDots(p.variants, locale)}
                  />
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* 5. Compact trust — Kaspi + delivery + chat */}
      <section className="border-t border-line bg-paper py-5">
        <Container>
          <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
            <div className="rounded-2xl border border-line px-2 py-3">
              <KaspiBadge height={20} className="mx-auto justify-center" />
              <p className="mt-2 text-[10px] leading-snug text-muted sm:text-xs">
                {t("home.trustKaspiDesc")}
              </p>
            </div>
            <div className="rounded-2xl border border-line px-2 py-3">
              <p className="text-[11px] font-medium tracking-wide">
                {t("home.trustChat")}
              </p>
              <p className="mt-2 text-[10px] leading-snug text-muted sm:text-xs">
                {t("home.trustChatDesc")}
              </p>
            </div>
            <div className="rounded-2xl border border-line px-2 py-3">
              <p className="text-[11px] font-medium tracking-wide">
                {t("home.trustDelivery")}
              </p>
              <p className="mt-2 text-[10px] leading-snug text-muted sm:text-xs">
                {t("home.trustDeliveryDesc")}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
