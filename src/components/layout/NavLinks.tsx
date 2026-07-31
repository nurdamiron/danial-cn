"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";

type Item = { href: "/catalog" | "/delivery" | "/about" | "/faq" | "/contacts"; label: string };

export function NavLinks({ items }: { items: readonly Item[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-7 text-[13px] md:flex">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative pb-1 transition hover:opacity-50 ${
              active
                ? "after:absolute after:inset-x-0 after:-bottom-[1px] after:h-px after:bg-ink"
                : ""
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
