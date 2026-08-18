import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db-config";

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
    <AdminShell user={user} catalogEditable={hasDatabase()}>
      {children}
    </AdminShell>
  );
}
