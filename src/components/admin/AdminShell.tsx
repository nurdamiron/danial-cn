"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { AdminLogout } from "@/components/admin/AdminLogout";

type NavItem = { href: string; label: string; adminOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары", adminOnly: true },
  { href: "/admin/users", label: "Пользователи", adminOnly: true },
  { href: "/admin/settings", label: "Настройки", adminOnly: true },
  { href: "/admin/account", label: "Профиль" },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser | null;
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
              className="text-xs tracking-[0.25em] uppercase"
            >
              Danial CN Admin
            </Link>
            <a href={storeHref} className="text-xs text-muted">
              ← Сайт
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-10">{children}</main>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";
  const items = NAV.filter((n) => !n.adminOnly || isAdmin);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-line md:hidden"
              aria-label={open ? "Закрыть меню" : "Открыть меню"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex flex-col gap-1">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
              </span>
            </button>
            <Link href="/admin" className="text-xs tracking-[0.25em] uppercase">
              Danial CN
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-xs tracking-wide ${
                  isActive(item.href)
                    ? "bg-ink text-paper"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden max-w-[140px] truncate text-muted sm:inline">
              {user.name}
              {isAdmin ? " · admin" : ""}
            </span>
            <a href={storeHref} className="text-muted hover:text-ink">
              Сайт
            </a>
            <AdminLogout />
          </div>
        </div>

        {open ? (
          <nav className="border-t border-line bg-paper px-4 py-2 md:hidden">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-2 py-3 text-sm ${
                  isActive(item.href) ? "font-medium text-ink" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-line px-2 py-3 text-xs text-muted">
              {user.email}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
