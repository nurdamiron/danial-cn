import type { Metadata } from "next";
import Link from "next/link";
import { bodyFontClass, htmlFontClass } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | Danial CN",
  robots: { index: false, follow: false },
};

/**
 * The 404 for addresses that match no route at all.
 *
 * With a root layout per section there is no single layout left to compose a
 * 404 from, which is the case Next documents this file for — so it carries
 * its own document, styles and fonts.
 */
export default function GlobalNotFound() {
  return (
    <html lang="ru" className={`${htmlFontClass} h-full antialiased`}>
      <body className={`${bodyFontClass} min-h-full`}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-sand px-4 text-center text-ink">
          <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
            Danial CN
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">
            404
          </h1>
          <p className="mt-4 max-w-sm text-sm text-muted">
            Страница не найдена.
          </p>
          <Link
            href="/ru"
            className="mt-8 inline-block border border-ink px-6 py-3 text-sm transition hover:bg-ink hover:text-paper"
          >
            На главную
          </Link>
        </div>
      </body>
    </html>
  );
}
