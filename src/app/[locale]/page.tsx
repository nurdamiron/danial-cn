import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import {
  listFeaturedProducts,
  listActiveProducts,
  localizedName,
  pickCoverUrl,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";

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
      key: "cabin",
      href: "/catalog?category=cabin",
      image: "/products/alu-cabin-55/silver-front.jpg",
    },
    {
      key: "checkin",
      href: "/catalog?category=checkin",
      image: "/products/pc-checkin-75/01-front.jpg",
    },
    {
      key: "set",
      href: "/catalog?category=set",
      image: "/products/soft-cabin-55/01-front.jpg",
    },
    {
      key: "bag",
      href: "/catalog?category=bag",
      image: "/products/soft-cabin-55/02-interior.jpg",
    },
  ] as const;

  return (
    <div>
      {/* Hero — Rimowa-like full bleed */}
      <section className="relative min-h-[88vh] overflow-hidden bg-[#111]">
        <Image
          src="/products/hero/hero-main.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/20" />
        <Container className="relative flex min-h-[88vh] flex-col justify-end pb-16 pt-28 sm:pb-20">
          <div className="max-w-xl space-y-6 fade-in text-white">
            <p className="text-[11px] tracking-[0.35em] uppercase text-white/70">
              {t("brand.name")}
            </p>
            <h1 className="text-4xl leading-[1.1] font-light tracking-tight sm:text-5xl md:text-6xl">
              {t("home.hero")}
            </h1>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/catalog">
                <Button className="bg-white text-black hover:bg-white/90">
                  {t("cta.viewCatalog")}
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black"
                >
                  {t("nav.about")}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories with images */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="text-[11px] tracking-[0.28em] uppercase">
              {t("home.categories")}
            </h2>
            <Link
              href="/catalog"
              className="text-[11px] tracking-[0.14em] text-muted uppercase underline-offset-4 hover:underline"
            >
              {t("cta.viewCatalog")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="group relative aspect-[3/4] overflow-hidden product-media"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  className="object-contain p-6 transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-16">
                  <p className="text-center text-[11px] tracking-[0.2em] text-white uppercase">
                    {t(`category.${c.key}`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Bestsellers */}
      {featured.length > 0 ? (
        <section className="border-t border-line py-20 sm:py-24">
          <Container>
            <h2 className="mb-10 text-[11px] tracking-[0.28em] uppercase">
              {t("home.bestsellers")}
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-3">
              {featured.map((p) => {
                const cover = pickCoverUrl(p.images);
                if (!cover) return null;
                const hover = p.images.find((i) => i.url !== cover)?.url;
                return (
                  <ProductCard
                    key={p.id}
                    href={`/catalog/${p.slug}`}
                    brand={p.brand}
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

      {/* Why + How */}
      <section className="border-t border-line bg-white py-20 sm:py-24">
        <Container className="grid gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-8 text-[11px] tracking-[0.28em] uppercase">
              {t("home.whyTitle")}
            </h2>
            <ul className="space-y-5">
              {[t("home.why1"), t("home.why2"), t("home.why3"), t("home.why4")].map(
                (item) => (
                  <li
                    key={item}
                    className="border-b border-line pb-4 text-sm font-light tracking-tight text-muted"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div>
            <h2 className="mb-8 text-[11px] tracking-[0.28em] uppercase">
              {t("home.howTitle")}
            </h2>
            <ol className="space-y-5">
              {[
                t("home.how1"),
                t("home.how2"),
                t("home.how3"),
                t("home.how4"),
              ].map((item, i) => (
                <li key={item} className="flex gap-4 border-b border-line pb-4">
                  <span className="text-[11px] tracking-[0.2em] text-muted">
                    0{i + 1}
                  </span>
                  <span className="text-sm font-light tracking-tight">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Bottom CTA band */}
      <section className="relative overflow-hidden bg-[#0a0a0a] py-20 text-white">
        <Container className="relative z-10 text-center">
          <p className="text-[11px] tracking-[0.3em] text-white/50 uppercase">
            Danial CN
          </p>
          <h2 className="mx-auto mt-4 max-w-lg text-2xl font-light tracking-tight sm:text-3xl">
            {t("home.hero")}
          </h2>
          <div className="mt-8">
            <Link href="/catalog">
              <Button className="bg-white text-black hover:bg-white/90">
                {t("cta.viewCatalog")}
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
