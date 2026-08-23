import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductsList } from "@/components/admin/ProductsList";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (!hasDatabase()) redirect("/admin");

  const { prisma } = await import("@/lib/prisma");
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      _count: { select: { images: true, variants: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { nameRu: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="t-display t-h2">Товары</h1>
          <p className="mt-1 text-sm text-muted">
            Что стоит на сайте, по какой цене и в каком количестве.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn btn-primary h-11 px-6 text-sm"
        >
          + Новый товар
        </Link>
      </div>
      <ProductsList
        products={products.map((p) => ({
          id: p.id,
          brand: p.brand,
          nameRu: p.nameRu,
          slug: p.slug,
          category: p.category,
          status: p.status,
          sortOrder: p.sortOrder,
          basePriceKzt: p.basePriceKzt,
          featured: p.featured,
          imageUrl: p.images[0]?.url ?? null,
          imageCount: p._count.images,
          variantCount: p._count.variants,
        }))}
      />
    </div>
  );
}
