import { redirect } from "next/navigation";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { ADMIN_ORDER_INCLUDE, type AdminOrder } from "@/lib/admin-orders";

async function loadOrders(): Promise<AdminOrder[]> {
  const { prisma } = await import("@/lib/prisma");
  const orders = await prisma.order.findMany({
    ...ADMIN_ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return orders.map((o) => ({ ...o, createdAt: o.createdAt.toISOString() }));
}

export default async function AdminOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "ADMIN") redirect("/admin/account");
  // Orders live in the database, like accounts, so this page works whether or
  // not the catalogue is a static export.
  if (!hasDatabase()) redirect("/admin");

  const orders = await loadOrders();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-light">Заказы</h1>
        <p className="mt-1 text-sm text-muted">
          Всё, что покупатели отправили в WhatsApp, с составом и суммой.
        </p>
      </div>
      <OrdersAdmin orders={orders} />
    </div>
  );
}
