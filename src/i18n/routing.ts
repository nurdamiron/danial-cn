import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "kk"],
  defaultLocale: "ru",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
