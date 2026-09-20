import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BottomNav } from "@/components/layout/BottomNav";
import { TrackView } from "@/components/analytics/TrackView";
import { bodyFontClass, htmlFontClass } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "../../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Danial CN",
    template: "Danial CN | %s",
  },
  description:
    "Danial CN, премиум багаж. Доставка по Казахстану. Заказ в чате. Оплата через Каспи.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The storefront's own root layout.
 *
 * It owns <html> so that lang can name the language the page is actually
 * written in: a shared layout above this one could not, because it sits
 * outside [locale] and reading the locale there would have to happen per
 * request — which cost every page its static rendering. The admin panel has
 * its own root for the same reason.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${htmlFontClass} h-full antialiased`}>
      <body className={`${bodyFontClass} min-h-full`}>
        <NextIntlClientProvider messages={messages}>
          {/* Bottom padding clears the fixed mobile tab bar — footer included */}
          <div className="flex min-h-screen flex-col pb-[calc(3.875rem+env(safe-area-inset-bottom))] md:pb-0">
            {/* Top of the funnel: every storefront page, admin excluded. */}
            <TrackView type="store_view" />
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <BottomNav />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
