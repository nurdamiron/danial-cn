import { redirect } from "next/navigation";
import { PricingBoard, type PricingProduct } from "@/components/admin/PricingBoard";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

async function loadPricing(): Promise<PricingProduct[]> {
  const { prisma } = await import("@/lib/prisma");
  return prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameRu: "asc" }],
    select: {
      id: true,
      slug: true,
      nameRu: true,
      brand: true,
      status: true,
      basePriceKzt: true,
      variants: {
        orderBy: [{ colorLabelRu: "asc" }, { sizeKey: "asc" }],
        select: {
          id: true,
          colorLabelRu: true,
          colorHex: true,
          sizeLabelRu: true,
          sizeKey: true,
          priceKzt: true,
          stock: true,
        },
      },
    },
  });
}

export default async function AdminPricingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  if (!hasDatabase()) redirect("/admin");

  const products = await loadPricing();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-light">Цены и наличие</h1>
        <p className="mt-1 text-sm text-muted">
          Все позиции магазина на одном экране. Правьте прямо в строках и
          сохраните одной кнопкой.
        </p>
      </div>
      <PricingBoard products={products} />
    </div>
  );
}
