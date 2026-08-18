import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

export const metadata: Metadata = {
  title: "Кабинет | Danial CN",
};

/**
 * Badge for the orders tab. Read here rather than on the orders page so a new
 * order is visible from whichever screen the shop happens to be on.
 */
async function countNewOrders(user: { role: string } | null): Promise<number> {
  if (!user || user.role !== "ADMIN" || !hasDatabase()) return 0;
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.order.count({ where: { status: "new" } });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  const newOrders = await countNewOrders(user);

  return (
    <AdminShell
      user={user}
      catalogEditable={hasDatabase()}
      newOrders={newOrders}
    >
      {children}
    </AdminShell>
  );
}
