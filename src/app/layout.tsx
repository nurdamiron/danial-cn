import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans-family",
});

export const metadata: Metadata = {
  title: {
    default: "Danial CN",
    template: "Danial CN | %s",
  },
  description:
    "Danial CN — премиум-багаж. Доставка по Казахстану. Заказ в WhatsApp. Оплата Kaspi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
