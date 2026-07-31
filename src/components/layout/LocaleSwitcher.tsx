"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function switchTo(next: "ru" | "kk") {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  const current = locale === "kk" ? t("kk") : t("ru");
  const options = [
    { key: "ru" as const, label: t("ru") },
    { key: "kk" as const, label: t("kk") },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 border px-3 py-1.5 text-[11px] tracking-[0.08em] text-ink transition ${
          open ? "border-ink" : "border-line hover:border-ink"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current}
        <span
          className={`text-[8px] opacity-60 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="dropdown-in absolute right-0 z-50 mt-2 min-w-[9rem] origin-top-right divide-y divide-line border border-line bg-paper py-1 shadow-lg"
        >
          {options.map((o) => {
            const active = locale === o.key;
            return (
              <li key={o.key}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition ${
                    active ? "text-ink" : "text-muted hover:bg-stone hover:text-ink"
                  }`}
                  onClick={() => switchTo(o.key)}
                >
                  {o.label}
                  {active ? <span className="text-[10px]">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
