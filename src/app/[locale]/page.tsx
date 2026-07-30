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
    { key: "cabin", href: "/catalog?category=cabin" },
    { key: "checkin", href: "/catalog?category=checkin" },
    { key: "set", href: "/catalog?category=set" },
    { key: "bag", href: "/catalog?category=bag" },
  ] as const;

  return (
    <div>
      <section className="border-b border-line bg-white">
        <Container className="grid min-h-[70vh] items-center gap-10 py-16 md:grid-cols-2">
          <div className="space-y-6">
            <p className="text-xs tracking-[0.3em] uppercase text-muted">
              {t("brand.name")}
            </p>
            <h1 className="max-w-md text-3xl leading-tight font-light tracking-tight sm:text-4xl">
              {t("home.hero")}
            </h1>
            <Link href="/catalog">
              <Button>{t("cta.viewCatalog")}</Button>
            </Link>
          </div>
          <div className="relative min-h-[320px] bg-[#f3f3f3]">
            {featured[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pickCoverUrl(featured[0].images) ?? ""}
                alt=""
                className="absolute inset-0 h-full w-full object-contain p-10"
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center text-xs tracking-widest text-muted uppercase">
                Danial CN
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <h2 className="mb-8 text-xs tracking-[0.25em] uppercase">
            {t("home.categories")}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="border border-line bg-white px-4 py-8 text-center text-sm tracking-wide transition hover:border-[#111]"
              >
                {t(`category.${c.key}`)}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {featured.length > 0 ? (
        <section className="border-t border-line py-16">
          <Container>
            <h2 className="mb-8 text-xs tracking-[0.25em] uppercase">
              {t("home.bestsellers")}
            </h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
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
                    replicaBadge={t("replica.badge")}
                  />
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="border-t border-line bg-white py-16">
        <Container className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-xs tracking-[0.25em] uppercase">
              {t("home.whyTitle")}
            </h2>
            <ul className="space-y-3 text-sm text-muted">
              <li>{t("home.why1")}</li>
              <li>{t("home.why2")}</li>
              <li>{t("home.why3")}</li>
              <li>{t("home.why4")}</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-6 text-xs tracking-[0.25em] uppercase">
              {t("home.howTitle")}
            </h2>
            <ol className="space-y-3 text-sm text-muted">
              <li>1. {t("home.how1")}</li>
              <li>2. {t("home.how2")}</li>
              <li>3. {t("home.how3")}</li>
              <li>4. {t("home.how4")}</li>
            </ol>
          </div>
        </Container>
      </section>
    </div>
  );
}
