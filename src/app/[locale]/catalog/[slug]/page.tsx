import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ProductConfigurator } from "@/components/product/ProductConfigurator";
import {
  getProductBySlug,
  localizedDescription,
  localizedMaterial,
  localizedName,
  pickCoverUrl,
} from "@/lib/products";

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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "77001234567";

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
      <Container className="py-10 sm:py-14">
        <div className="mb-8 space-y-3 lg:mb-10">
          <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
            {product.brand}
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
          siteUrl={siteUrl}
          waE164={wa}
        />

        <div className="mt-14 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-[10px] tracking-[0.22em] uppercase">
              {locale === "kk" ? "Сипаттама" : "Описание"}
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              {localizedDescription(product, locale)}
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
              <div>
                <dt className="text-[11px] text-muted">
                  {locale === "kk" ? "Өлшемдер" : "Размеры"}
                </dt>
                <dd className="mt-0.5 font-light">55 · 65 · 75 см</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-muted">
              {t("delivery.cargo")} · {t("delivery.avia")} ·{" "}
              {t("delivery.express")} — {t("payment.kaspiNote")}
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
