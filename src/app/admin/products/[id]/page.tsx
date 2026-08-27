import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImagesAdmin } from "@/components/admin/ProductImagesAdmin";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { VariantsAdmin } from "@/components/admin/VariantsAdmin";
import { ProductTabs } from "@/components/admin/ProductTabs";
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
    <div className="space-y-6">
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="t-display t-h2">{product.nameRu}</h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium tracking-[0.08em] uppercase ${
                  product.status === "active"
                    ? "border-ink/15 bg-ink text-paper"
                    : "border-line bg-paper text-muted"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    product.status === "active" ? "bg-paper" : "bg-line-strong"
                  }`}
                />
                {product.status === "active" ? "на сайте" : "черновик"}
              </span>
            </div>
            <p className="t-data mt-1 text-muted">
              {product.brand} · {product.slug}
            </p>
          </div>
        </div>
        <ProductDeleteButton productId={product.id} name={product.nameRu} />
      </div>

      <ProductTabs
        counts={{
          variants: product.variants.length,
          photos: product.images.length,
        }}
        openPhotos={Boolean(photoError)}
        product={<ProductForm product={product} />}
        variants={
          <VariantsAdmin
            productId={product.id}
            productSlug={product.slug}
            initialVariants={product.variants}
          />
        }
        photos={
          <>
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
          </>
        }
      />
    </div>
  );
}
