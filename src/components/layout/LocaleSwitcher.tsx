"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: "ru" | "kk") {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
      <button
        type="button"
        onClick={() => switchTo("kk")}
        className={locale === "kk" ? "text-[#111]" : "text-muted"}
      >
        ҚАЗ
      </button>
      <span className="text-line">|</span>
      <button
        type="button"
        onClick={() => switchTo("ru")}
        className={locale === "ru" ? "text-[#111]" : "text-muted"}
      >
        РУС
      </button>
    </div>
  );
}
