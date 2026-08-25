"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { AdminLogout } from "@/components/admin/AdminLogout";
import { AdminBottomNav } from "@/components/admin/AdminBottomNav";
import { StoreIcon } from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  adminOnly?: boolean;
  /** Hidden where the catalogue is an export and these pages redirect away. */
  catalogOnly?: boolean;
};

/** Destinations the bottom bar shows, so "Ещё" does not repeat them. */
const BOTTOM_BAR = ["/admin", "/admin/orders", "/admin/products", "/admin/pricing"];

const NAV: NavItem[] = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/orders", label: "Заказы", adminOnly: true },
  { href: "/admin/products", label: "Товары", adminOnly: true, catalogOnly: true },
  { href: "/admin/pricing", label: "Цены", adminOnly: true, catalogOnly: true },
  { href: "/admin/users", label: "Пользователи", adminOnly: true },
  { href: "/admin/security", label: "Безопасность", adminOnly: true },
  { href: "/admin/settings", label: "Настройки", adminOnly: true, catalogOnly: true },
  { href: "/admin/account", label: "Профиль" },
];

export function AdminShell({
  user,
  catalogEditable,
  newOrders,
  children,
}: {
  user: SessionUser | null;
  catalogEditable: boolean;
  /** Badged on the orders tab so a new order is visible from any screen. */
  newOrders: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/register";

  const storeUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "/ru";
  const storeHref = storeUrl.startsWith("http") ? `${storeUrl}/ru` : "/ru";

  if (isAuthPage || !user) {
    return (
      <div className="min-h-screen bg-sand text-ink">
        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link
              href="/admin/login"
              className="t-label tracking-[0.25em]"
            >
              Danial CN Admin
            </Link>
            <a
              href={storeHref}
              className="inline-flex items-center gap-1 text-[0.8125rem] text-muted"
            >
              <StoreIcon className="h-3.5 w-3.5" />
              Сайт
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-10">{children}</main>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const items = NAV.filter(
    (n) => (!n.adminOnly || isAdmin) && (!n.catalogOnly || catalogEditable),
  );

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="t-label tracking-[0.25em]">
              Danial CN
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-[0.8125rem] tracking-wide ${
                  isActive(item.href)
                    ? "bg-ink text-paper"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-[0.8125rem]">
            <span className="hidden max-w-[140px] truncate text-muted sm:inline">
              {user.name}
              {isAdmin ? " · администратор" : ""}
            </span>
            <a href={storeHref} className="text-muted hover:text-ink">
              Сайт
            </a>
            <AdminLogout />
          </div>
        </div>
        {/* The flute: the same rib pattern the aluminium shells carry, so the
            panel reads as part of the shop rather than a tool bolted to it. */}
        <div className="flute h-1.5 w-full" aria-hidden="true" />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8 md:pb-8">
        {children}
      </main>

      {/* Everything the bottom bar has no room for. */}
      {open ? (
        <>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="fixed inset-0 z-40 bg-ink/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-x-0 bottom-[3.875rem] z-50 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
            aria-label="Остальные разделы"
          >
            {items
              .filter((item) => !BOTTOM_BAR.includes(item.href))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-5 py-3.5 text-sm ${
                    isActive(item.href) ? "font-medium text-ink" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[0.8125rem] text-muted">
              <span className="truncate">{user.email}</span>
              <AdminLogout />
            </div>
          </nav>
        </>
      ) : null}

      <AdminBottomNav
        newOrders={newOrders}
        catalogEditable={catalogEditable}
        moreOpen={open}
        onMore={() => setOpen((v) => !v)}
      />
    </div>
  );
}
