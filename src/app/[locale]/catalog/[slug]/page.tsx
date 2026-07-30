import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ReplicaBadge } from "@/components/product/ReplicaBadge";
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

  return (
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((i) => ({ id: i.id, url: i.url }))}
          alt={localizedName(product, locale)}
        />
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.25em] text-muted uppercase">
              {product.brand}
            </p>
            <h1 className="text-3xl font-light tracking-tight">
              {localizedName(product, locale)}
            </h1>
            <ReplicaBadge label={t("replica.badge")} />
            <p className="text-sm text-muted">{t("replica.disclaimer")}</p>
          </div>

          <ProductActions
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
            variants={product.variants}
            coverUrl={cover}
            siteUrl={siteUrl}
            waE164={wa}
          />

          <div className="border-t border-line pt-6">
            <p className="text-sm leading-relaxed text-muted">
              {localizedDescription(product, locale)}
            </p>
          </div>

          <div className="border-t border-line pt-6">
            <h2 className="mb-4 text-xs tracking-[0.2em] uppercase">
              {t("product.specs")}
            </h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">{t("catalog.material")}</dt>
                <dd>{localizedMaterial(product, locale)}</dd>
              </div>
              {product.heightCm != null ? (
                <div>
                  <dt className="text-muted">{t("product.height")}</dt>
                  <dd>{product.heightCm} cm</dd>
                </div>
              ) : null}
              {product.widthCm != null ? (
                <div>
                  <dt className="text-muted">{t("product.width")}</dt>
                  <dd>{product.widthCm} cm</dd>
                </div>
              ) : null}
              {product.depthCm != null ? (
                <div>
                  <dt className="text-muted">{t("product.depth")}</dt>
                  <dd>{product.depthCm} cm</dd>
                </div>
              ) : null}
              {product.volumeL != null ? (
                <div>
                  <dt className="text-muted">{t("product.volume")}</dt>
                  <dd>{product.volumeL} L</dd>
                </div>
              ) : null}
              {product.weightKg != null ? (
                <div>
                  <dt className="text-muted">{t("product.weight")}</dt>
                  <dd>{product.weightKg} kg</dd>
                </div>
              ) : null}
              {product.wheels ? (
                <div>
                  <dt className="text-muted">{t("product.wheels")}</dt>
                  <dd>{product.wheels}</dd>
                </div>
              ) : null}
              {product.lockType ? (
                <div>
                  <dt className="text-muted">{t("product.lock")}</dt>
                  <dd>{product.lockType}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <p className="text-xs text-muted">
            {t("delivery.cargo")} · {t("delivery.avia")} ·{" "}
            {t("delivery.express")} — {t("payment.kaspiNote")}
          </p>
        </div>
      </div>
    </Container>
  );
}
