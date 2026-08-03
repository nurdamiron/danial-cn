"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Two languages, so a segmented switch beats a dropdown: both options stay
 * visible and one tap changes the site.
 */
export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("lang");
  const pathname = usePathname();
  const router = useRouter();

  const options = [
    { key: "ru" as const, short: t("ruShort"), full: t("ru") },
    { key: "kk" as const, short: t("kkShort"), full: t("kk") },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-full border border-line bg-paper p-0.5 ${className}`}
      role="group"
      aria-label={t("label")}
    >
      {options.map((o) => {
        const active = locale === o.key;
        return (
          <button
            key={o.key}
            type="button"
            aria-label={o.full}
            aria-pressed={active}
            onClick={() => {
              if (!active) router.replace(pathname, { locale: o.key });
            }}
            className={`t-label rounded-full px-2.5 py-1.5 transition ${
              active ? "bg-ink text-paper" : "text-muted hover:text-ink"
            }`}
          >
            {o.short}
          </button>
        );
      })}
    </div>
  );
}
