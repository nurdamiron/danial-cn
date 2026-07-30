import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCinematic } from "@/components/home/HeroCinematic";
import { TrustBar } from "@/components/home/TrustBar";
import { OrderPath } from "@/components/home/OrderPath";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { MarqueeBar } from "@/components/home/MarqueeBar";
import {
  listFeaturedProducts,
  listActiveProducts,
  localizedName,
  pickCoverUrl,
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let featured = await listFeaturedProducts(8);
  if (featured.length === 0) {
    featured = (await listActiveProducts()).slice(0, 8);
  }

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
    <div>
      <HeroCinematic
        brand={t("brand.name")}
        hero={t("home.hero")}
        catalogLabel={t("cta.viewCatalog")}
        aboutLabel={t("nav.about")}
      />

      <TrustBar />
      <MarqueeBar />

      <section className="py-20 sm:py-24">
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
              className="text-[11px] tracking-[0.08em] text-muted underline-offset-4 hover:underline"
            >
              {t("cta.viewCatalog")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="group relative aspect-[3/4] overflow-hidden border border-line bg-white"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  quality={95}
                  className="object-contain p-6 transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 border-t border-line bg-white/95 px-3 py-3 backdrop-blur-sm">
                  <p className="text-center text-[11px] tracking-[0.12em]">
                    {t(`category.${c.key}`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {featured.length > 0 ? (
        <section className="border-t border-line bg-stone py-20 sm:py-24">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted">
                  {t("home.bestsellers")}
                </p>
                <h2 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
                  {t("home.bestsellers")}
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-[11px] tracking-[0.08em] text-muted underline-offset-4 hover:underline"
              >
                {t("cta.viewCatalog")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
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
                  />
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      <FeatureStrip />
      <OrderPath />

      <section className="border-t border-line bg-paper py-20 sm:py-24">
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
            {[t("home.why1"), t("home.why2"), t("home.why3"), t("home.why4")].map(
              (item, i) => (
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
              ),
            )}
          </ul>
        </Container>
      </section>

      <section className="bg-ink py-20 text-paper sm:py-24">
        <Container className="text-center">
          <p className="text-[11px] tracking-[0.28em] text-paper/45">
            {t("brand.name")}
          </p>
          <h2 className="mx-auto mt-5 max-w-xl text-2xl font-light tracking-tight sm:text-4xl">
            {t("home.hero")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-paper/55">
            {t("home.orderFlow")}
          </p>
          <div className="mt-9">
            <Link href="/catalog">
              <Button variant="secondary">{t("cta.viewCatalog")}</Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
