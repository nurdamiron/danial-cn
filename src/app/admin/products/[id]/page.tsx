import { redirect, notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductImagesAdmin } from "@/components/admin/ProductImagesAdmin";
import { useStaticCatalog } from "@/lib/static-catalog";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  if (useStaticCatalog()) {
    redirect("/admin");
  }
  const { id } = await params;
  const { prisma } = await import("@/lib/prisma");
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
  });
  if (!product) notFound();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 text-xl font-light">Edit product</h1>
        <ProductForm product={product} />
      </div>
      <div>
        <h2 className="mb-4 text-sm tracking-widest uppercase">Photos</h2>
        <ProductImagesAdmin
          productId={product.id}
          initialImages={product.images.map((i) => ({
            id: i.id,
            url: i.url,
            isCover: i.isCover,
          }))}
        />
      </div>
    </div>
  );
}
