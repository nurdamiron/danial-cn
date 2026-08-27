import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImagesAdmin } from "@/components/admin/ProductImagesAdmin";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { VariantsAdmin } from "@/components/admin/VariantsAdmin";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { ArrowRightIcon } from "@/components/ui/icons";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ photos?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (!hasDatabase()) redirect("/admin");

  const { id } = await params;
  // Set when the product saved but its photos did not: the create screen sends
  // the reason on rather than losing it behind a redirect.
  const { photos: photoError } = await searchParams;
  const { prisma } = await import("@/lib/prisma");
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: { orderBy: [{ colorKey: "asc" }, { sizeKey: "asc" }] },
    },
  });
  if (!product) notFound();

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products"
            className="link-quiet inline-flex items-center gap-1 text-[0.8125rem] text-muted"
          >
            <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
            К списку
          </Link>
          <div>
            <h1 className="t-display t-h2">{product.nameRu}</h1>
            <p className="t-data mt-1 text-muted">
              {product.brand} · {product.slug} ·{" "}
              {product.status === "active" ? "на сайте" : "черновик"}
            </p>
          </div>
        </div>
        <ProductDeleteButton productId={product.id} name={product.nameRu} />
      </div>

      <section>
        <h2 className="t-label mb-4 text-muted">Описание и цена</h2>
        <ProductForm product={product} />
      </section>

      <section>
        <h2 className="t-label mb-4 text-muted">Цвета, размеры и наличие</h2>
        <VariantsAdmin
          productId={product.id}
          productSlug={product.slug}
          initialVariants={product.variants}
        />
      </section>

      <section>
        <h2 className="t-label mb-4 text-muted">Фотографии</h2>
        {photoError ? (
          <p className="alert-error mb-4">
            Товар сохранён, но с фото не всё получилось. {photoError}
          </p>
        ) : null}
        <ProductImagesAdmin
          productId={product.id}
          colorKeys={[...new Set(product.variants.map((v) => v.colorKey))]}
          initialImages={product.images.map((i) => ({
            id: i.id,
            url: i.url,
            isCover: i.isCover,
            colorKey: i.colorKey,
          }))}
        />
      </section>
    </div>
  );
}
