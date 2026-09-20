import { Golos_Text, JetBrains_Mono, Manrope } from "next/font/google";

/*
  Three voices, all carrying full Kazakh Cyrillic (ә ғ қ ң ө ұ ү һ і) through
  the cyrillic-ext subset:
    Manrope     — headlines, prices, product names
    Golos Text  — Cyrillic-first UI and body copy
    JetBrains   — machined data: cm, litres, kg, SKU, size codes

  Shared by both root layouts — the storefront and the admin panel — so the
  two cannot drift onto different typefaces.
*/
export const display = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-display-family",
  display: "swap",
});

export const sans = Golos_Text({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-sans-family",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  variable: "--font-mono-family",
  display: "swap",
});

/** The class pair every <html>/<body> in the app uses. */
export const htmlFontClass = `${display.variable} ${sans.variable} ${mono.variable}`;
export const bodyFontClass = sans.className;
