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

  return (
    <Container className="py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-light tracking-tight">
          {t("catalog.title")}
        </h1>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { href: "/catalog", label: t("catalog.all") },
            { href: "/catalog?category=cabin", label: t("category.cabin") },
            { href: "/catalog?category=checkin", label: t("category.checkin") },
            { href: "/catalog?category=set", label: t("category.set") },
            { href: "/catalog?category=bag", label: t("category.bag") },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="border border-line px-3 py-1.5 hover:border-[#111]"
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted">
          {t("catalog.empty")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
  );
}
