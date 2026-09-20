import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";
import { bodyFontClass, htmlFontClass } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "../../globals.css";

/** The panel is a second root layout: it owns its own <html>. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Кабинет | Danial CN",
  robots: { index: false, follow: false },
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
    <html lang="ru" className={`${htmlFontClass} h-full antialiased`}>
      <body className={`${bodyFontClass} min-h-full`}>
        <AdminShell
          user={user}
          catalogEditable={hasDatabase()}
          newOrders={newOrders}
        >
          {children}
        </AdminShell>
      </body>
    </html>
  );
}
