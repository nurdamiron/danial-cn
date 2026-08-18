"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CartIcon,
  GridIcon,
  HomeIcon,
  MenuIcon,
  SlidersIcon,
} from "@/components/ui/icons";

/**
 * The same bar the storefront puts at the bottom on a phone, with the shop's
 * own destinations instead of the customer's.
 *
 * The panel is used standing in a warehouse with one hand, so the things done
 * daily are a thumb away and the rest sits behind "Ещё". Markup and classes
 * deliberately mirror components/layout/BottomNav so the two read as one
 * product rather than two that resemble each other.
 */
export function AdminBottomNav({
  newOrders,
  catalogEditable,
  onMore,
  moreOpen,
}: {
  newOrders: number;
  catalogEditable: boolean;
  onMore: () => void;
  moreOpen: boolean;
}) {
  const pathname = usePathname();

  const items = [
    {
      href: "/admin",
      label: "Обзор",
      icon: HomeIcon,
      match: (p: string) => p === "/admin",
    },
    {
      href: "/admin/orders",
      label: "Заказы",
      icon: CartIcon,
      match: (p: string) => p.startsWith("/admin/orders"),
      badge: newOrders,
    },
    ...(catalogEditable
      ? [
          {
            href: "/admin/products",
            label: "Товары",
            icon: GridIcon,
            match: (p: string) => p.startsWith("/admin/products"),
          },
          {
            href: "/admin/pricing",
            label: "Цены",
            icon: SlidersIcon,
            match: (p: string) => p.startsWith("/admin/pricing"),
          },
        ]
      : []),
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Разделы кабинета"
    >
      <ul className="mx-auto flex h-[3.875rem] max-w-lg items-stretch px-2">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] transition-colors ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <span
                  className={`relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
                    active ? "bg-ink text-paper" : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {"badge" in item && item.badge && item.badge > 0 ? (
                    <span
                      className={`absolute -top-0.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.625rem] leading-none ${
                        active ? "bg-paper text-ink" : "bg-ink text-paper"
                      }`}
                    >
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </span>
                <span className={active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            </li>
          );
        })}

        <li className="flex-1">
          <button
            type="button"
            onClick={onMore}
            aria-expanded={moreOpen}
            className={`flex h-full w-full flex-col items-center justify-center gap-1 text-[0.6875rem] transition-colors ${
              moreOpen ? "text-ink" : "text-muted"
            }`}
          >
            <span
              className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-300 ${
                moreOpen ? "bg-ink text-paper" : ""
              }`}
            >
              <MenuIcon className="h-[18px] w-[18px]" />
            </span>
            <span className={moreOpen ? "font-medium" : ""}>Ещё</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
