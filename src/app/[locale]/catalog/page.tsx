import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import {
  listActiveProducts,
  localizedName,
  pickCoverUrl,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";
import { Link } from "@/i18n/navigation";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  const category =
    typeof sp.category === "string" ? sp.category : undefined;
  const sort =
    sp.sort === "price_asc" || sp.sort === "price_desc" || sp.sort === "new"
      ? sp.sort
      : "new";

  const products = await listActiveProducts({ category, sort });

  const filters = [
    { href: "/catalog", label: t("catalog.all") },
    { href: "/catalog?category=cabin", label: t("category.cabin") },
    { href: "/catalog?category=checkin", label: t("category.checkin") },
    { href: "/catalog?category=set", label: t("category.set") },
    { href: "/catalog?category=bag", label: t("category.bag") },
  ];

  return (
    <div>
      <div className="border-b border-line bg-white">
        <Container className="py-12 sm:py-16">
          <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
            Danial CN
          </p>
          <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
            {t("catalog.title")}
          </h1>
          <div className="mt-8 flex flex-wrap gap-2">
            {filters.map((f) => {
              const active =
                (f.href === "/catalog" && !category) ||
                (category && f.href.includes(`category=${category}`));
              return (
                <Link
                  key={f.href}
                  href={f.href}
                  className={`border px-4 py-2 text-[10px] tracking-[0.16em] uppercase transition ${
                    active
                      ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                      : "border-line hover:border-[#0a0a0a]"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        {products.length === 0 ? (
          <p className="py-24 text-center text-sm text-muted">
            {t("catalog.empty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-3">
            {products.map((p) => {
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
        )}
      </Container>
    </div>
  );
}
