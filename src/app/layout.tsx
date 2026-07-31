import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

// Noto Sans: full Kazakh Cyrillic (ә ғ қ ң ө ұ ү һ і) via cyrillic-ext
const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Danial CN",
    template: "Danial CN | %s",
  },
  description:
    "Danial CN — премиум-багаж. Доставка по Казахстану. Заказ в чате. Оплата через Каспи.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${notoSans.variable} h-full antialiased`}>
      <body className={`${notoSans.className} min-h-full`}>{children}</body>
    </html>
  );
}
