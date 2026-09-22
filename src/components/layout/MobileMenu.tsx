"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";

type Item = { href: string; label: string };

export function MobileMenu({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const panel = (
    <div className="fixed inset-0 z-40 bg-sand md:hidden">
      <div className="h-24 sm:h-[6.5rem]" aria-hidden="true" />
      <div className="border-t border-line">
        <nav className="flex flex-col divide-y divide-line px-5">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`t-display py-4 text-xl ${
                  active ? "text-ink" : "text-ink/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 pt-6">
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-stone"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/*
        The panel hangs off <body>, not off this button.

        The header blurs what scrolls under it, and backdrop-filter makes an
        element the containing block for every fixed descendant. Left in place,
        "fixed inset-0" resolved against the 64px header bar instead of the
        viewport: the sand ground painted only that strip, the links spilled
        out over the page with nothing behind them, and the spacer below them
        covered the close button so the menu could not be shut.

        Only a click opens it, so by the time there is a panel to place there
        is always a document to place it in.
      */}
      {open ? createPortal(panel, document.body) : null}
    </div>
  );
}
