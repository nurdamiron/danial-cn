"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { CartIcon } from "@/components/ui/icons";
import { loadCart } from "@/store/cart";

function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function CatalogIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProfileIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
    </svg>
  );
}

export function BottomNav() {
  const t = useTranslations("tab");
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const sync = () =>
      setCartCount(loadCart().reduce((s, i) => s + i.qty, 0));
    sync();
    window.addEventListener("danial-cart-updated", sync);
    return () => window.removeEventListener("danial-cart-updated", sync);
  }, []);

  const items = [
    { href: "/", label: t("home"), icon: HomeIcon, match: (p: string) => p === "/" },
    {
      href: "/catalog",
      label: t("catalog"),
      icon: CatalogIcon,
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
      icon: ProfileIcon,
      match: (p: string) =>
        p.startsWith("/profile") ||
        p.startsWith("/orders") ||
        p.startsWith("/favorites"),
    },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Main"
    >
      <ul className="mx-auto flex h-[3.75rem] max-w-lg items-stretch px-1">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`relative flex h-full flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] tracking-wide ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <span
                  className={`relative flex h-8 w-12 items-center justify-center rounded-full ${
                    active ? "bg-stone" : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {"badge" in item && item.badge && item.badge > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[9px] text-paper">
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
