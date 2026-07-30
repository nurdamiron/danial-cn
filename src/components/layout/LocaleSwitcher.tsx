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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11px] tracking-[0.08em] text-ink"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current}
        <span className="text-[9px] opacity-60">▾</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[8.5rem] border border-line bg-paper py-1 shadow-lg"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={locale === "ru"}
              className={`block w-full px-3 py-2 text-left text-xs ${
                locale === "ru" ? "bg-stone text-ink" : "text-muted hover:bg-stone"
              }`}
              onClick={() => switchTo("ru")}
            >
              {t("ru")}
            </button>
          </li>
          <li>
            <button
              type="button"
              role="option"
              aria-selected={locale === "kk"}
              className={`block w-full px-3 py-2 text-left text-xs ${
                locale === "kk" ? "bg-stone text-ink" : "text-muted hover:bg-stone"
              }`}
              onClick={() => switchTo("kk")}
            >
              {t("kk")}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
