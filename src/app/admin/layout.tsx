import type { Metadata } from "next";
import Link from "next/link";
import { AdminLogout } from "@/components/admin/AdminLogout";

export const metadata: Metadata = {
  title: "Admin | Danial CN",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#111]">
      <header className="border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="text-xs tracking-[0.25em] uppercase">
            Danial CN Admin
          </Link>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/ru">← Site</Link>
            <AdminLogout />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
