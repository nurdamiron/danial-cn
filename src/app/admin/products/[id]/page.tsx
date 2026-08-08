import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImagesAdmin } from "@/components/admin/ProductImagesAdmin";
import { ProductDeleteButton } from "@/components/admin/ProductDeleteButton";
import { VariantsAdmin } from "@/components/admin/VariantsAdmin";
import { getCurrentUser } from "@/lib/auth";
import { isStaticCatalog } from "@/lib/static-catalog";
import { ArrowRightIcon } from "@/components/ui/icons";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (isStaticCatalog()) redirect("/admin");

  const { id } = await params;
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
            className="inline-flex items-center gap-1 text-xs text-muted underline"
          >
            <ArrowRightIcon className="h-3.5 w-3.5 rotate-180" />
            К списку
          </Link>
          <div>
            <h1 className="text-xl font-light">CRUD товара</h1>
            <p className="text-xs text-muted">
              {product.brand} · {product.slug} · {product.status}
            </p>
          </div>
        </div>
        <ProductDeleteButton productId={product.id} name={product.nameRu} />
      </div>

      <section>
        <h2 className="mb-4 text-xs tracking-widest text-muted uppercase">
          1. Данные (Update)
        </h2>
        <ProductForm product={product} />
      </section>

      <section>
        <h2 className="mb-4 text-xs tracking-widest text-muted uppercase">
          2. Варианты — цвет/размер/сток (CRUD)
        </h2>
        <VariantsAdmin
          productId={product.id}
          productSlug={product.slug}
          initialVariants={product.variants}
        />
      </section>

      <section>
        <h2 className="mb-4 text-xs tracking-widest text-muted uppercase">
          3. Фотографии (Create / Read / Update cover+color / Delete)
        </h2>
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
