import type { Metadata } from "next";
import { Golos_Text, JetBrains_Mono, Manrope } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

/*
  Three voices, all carrying full Kazakh Cyrillic (ә ғ қ ң ө ұ ү һ і) through
  the cyrillic-ext subset:
    Manrope     — headlines, prices, product names
    Golos Text  — Cyrillic-first UI and body copy
    JetBrains   — machined data: cm, litres, kg, SKU, size codes
*/
const display = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-display-family",
  display: "swap",
});

const sans = Golos_Text({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans-family",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  variable: "--font-mono-family",
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
    <html
      lang="ru"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className={`${sans.className} min-h-full`}>{children}</body>
    </html>
  );
}
