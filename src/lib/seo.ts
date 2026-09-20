import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE } from "@/lib/site";

/**
 * Canonical plus the hreflang set for one page.
 *
 * Both languages carry the same catalogue, so each page has to name its
 * counterpart: without these a search engine treats /ru and /kk as rival
 * copies rather than two renderings of one thing, and picks one for every
 * reader. x-default points at Russian, which is the shop's own language.
 */
export function pageAlternates(locale: string, path = ""): Metadata["alternates"] {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path}`]),
  );
  return {
    canonical: `/${locale}${path}`,
    languages: { ...languages, "x-default": `/${routing.defaultLocale}${path}` },
  };
}

/**
 * Who the shop is, in the form a search engine or an assistant can quote.
 *
 * Product pages already describe what is for sale; nothing described the
 * seller — the name, the channel an order actually goes through, the country
 * it ships to. Everything here is taken from the same settings the storefront
 * prints, so the two cannot drift apart.
 */
export function storeJsonLd({
  whatsappE164,
  instagramUrl,
}: {
  whatsappE164: string;
  instagramUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${SITE.url}/#store`,
    name: "Danial CN",
    url: SITE.url,
    logo: `${SITE.url}/apple-icon`,
    sameAs: [instagramUrl],
    areaServed: { "@type": "Country", name: "KZ" },
    currenciesAccepted: "KZT",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: `+${whatsappE164}`,
      areaServed: "KZ",
      availableLanguage: [...routing.locales],
    },
  };
}

/** Mirrors the breadcrumb the page already draws above the product. */
export function breadcrumbJsonLd(
  locale: string,
  trail: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${SITE.url}/${locale}${step.path}`,
    })),
  };
}

export function faqJsonLd(pairs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.question,
      acceptedAnswer: { "@type": "Answer", text: p.answer },
    })),
  };
}
