import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { isStaticCatalog } from "@/lib/static-catalog";

export const metadata: Metadata = {
  title: "Кабинет | Danial CN",
};

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

  return (
    <AdminShell user={user} catalogEditable={!isStaticCatalog()}>
      {children}
    </AdminShell>
  );
}
