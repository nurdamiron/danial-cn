"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CartIcon, GridIcon, HomeIcon, UserIcon } from "@/components/ui/icons";
import { loadCart } from "@/store/cart";

export function BottomNav() {
  const t = useTranslations("tab");
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const sync = () => setCartCount(loadCart().reduce((s, i) => s + i.qty, 0));
    sync();
    window.addEventListener("danial-cart-updated", sync);
    return () => window.removeEventListener("danial-cart-updated", sync);
  }, []);

  const items = [
    {
      href: "/",
      label: t("home"),
      icon: HomeIcon,
      match: (p: string) => p === "/",
    },
    {
      href: "/catalog",
      label: t("catalog"),
      icon: GridIcon,
      match: (p: string) => p.startsWith("/catalog"),
    },
    {
      href: "/cart",
      label: t("cart"),
      icon: CartIcon,
      match: (p: string) => p.startsWith("/cart"),
      badge: cartCount,
    },
    {
      href: "/profile",
      label: t("profile"),
      icon: UserIcon,
      match: (p: string) =>
        p.startsWith("/profile") ||
        p.startsWith("/orders") ||
        p.startsWith("/favorites"),
    },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      aria-label="Main"
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
      </ul>
    </nav>
  );
}
