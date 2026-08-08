"use client";

import { Link, usePathname } from "@/i18n/navigation";

type Item = {
  href: "/catalog" | "/reviews" | "/delivery" | "/about" | "/faq" | "/contacts";
  label: string;
};

export function NavLinks({ items }: { items: readonly Item[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm md:flex lg:gap-8">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {item.label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-ink transition-transform duration-300 ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
