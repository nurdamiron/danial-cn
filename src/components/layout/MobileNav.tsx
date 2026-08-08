"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, usePathname } from "@/i18n/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { ArrowIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";

type NavItem = {
  href: "/catalog" | "/brands" | "/delivery" | "/about" | "/faq" | "/contacts";
  label: string;
};

type BrandItem = { key: string; name: string };

type Props = {
  items: readonly NavItem[];
  brands: BrandItem[];
  labels: {
    open: string;
    close: string;
    lines: string;
    chat: string;
    instagram: string;
    phone: string;
  };
  whatsappUrl: string;
  instagramUrl: string;
};

export function MobileNav({
  items,
  brands,
  labels,
  whatsappUrl,
  instagramUrl,
}: Props) {
  const pathname = usePathname();

  // Remember which route the drawer was opened on, so a navigation closes it
  // on its own rather than needing an effect to chase the pathname.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn !== null && openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  // The drawer covers the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedOn(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.open}
        aria-expanded={open}
        className="-m-1.5 flex items-center justify-center p-1.5 text-ink transition hover:opacity-50 md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          aria-hidden="true"
        >
          <path d="M3 6.5h18M3 12h18M3 17.5h18" />
        </svg>
      </button>

      {/*
        The header sits behind a backdrop-filter, which makes it a containing
        block for fixed children and would trap the drawer inside its 64px box.
        Portalling to body puts the overlay back on the viewport. Only ever
        reached after a click, so document is always defined here.
      */}
      {open
        ? createPortal(
            <div className="fixed inset-0 z-[60] md:hidden">
              <button
                type="button"
                aria-label={labels.close}
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-ink/45"
              />
              <div className="dropdown-in absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col bg-sand">
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                  <BrandMark
                    name="danial-cn"
                    height={15}
                    label=""
                    className="text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={labels.close}
                    className="-m-2 p-2 text-sm text-muted"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      aria-hidden="true"
                    >
                      <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-5 py-6">
                  <ul>
                    {items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between border-b border-line py-4 text-lg font-light tracking-tight"
                        >
                          {item.label}
                          <ArrowIcon className="h-4 w-4 text-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-8 mb-4 text-[10px] tracking-[0.18em] text-muted">
                    {labels.lines}
                  </p>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-5">
                    {brands.map((b) => (
                      <li key={b.key}>
                        <Link
                          href={`/catalog?brand=${b.key}`}
                          className="inline-flex text-ink"
                        >
                          <BrandMark name={b.key} height={12} label={b.name} />
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 border-t border-line pt-6">
                    <LocaleSwitcher />
                  </div>
                </nav>

                <div className="flex gap-3 border-t border-line px-5 py-4">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 bg-ink px-4 py-3 text-sm text-paper"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    {labels.chat}
                  </a>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={labels.instagram}
                    className="flex items-center justify-center border border-line px-4 text-ink"
                  >
                    <InstagramIcon />
                  </a>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
