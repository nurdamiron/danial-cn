import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChevronDownIcon } from "@/components/ui/icons";
import { faqJsonLd, pageAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("faq.title"),
    alternates: pageAlternates(locale, "/faq"),
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const items = [
    ["q1", "a1"],
    ["q2", "a2"],
    ["q3", "a3"],
    ["q4", "a4"],
    ["q5", "a5"],
    ["q6", "a6"],
  ] as const;

  return (
    <div>
      {/* The answers are already written; this is the same six, in the shape
          search engines and assistants quote from. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqJsonLd(
              items.map(([q, a]) => ({
                question: t(`faq.${q}`),
                answer: t(`faq.${a}`),
              })),
            ),
          ),
        }}
      />
      <PageHeader eyebrow={t("brand.name")} title={t("faq.title")} />
      {/*
        Questions that open, the first one already open. Laid out in full the
        six answers ran to four phone screens, and the question someone came
        with could be the last. The answers stay in the page either way.
      */}
      <Container className="max-w-2xl py-8 sm:py-20">
        <div className="divide-y divide-line border-y border-line">
          {items.map(([q, a], i) => (
            <details key={q} className="group" open={i === 0}>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                <h2 className="t-display t-h3">{t(`faq.${q}`)}</h2>
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="pb-6 leading-relaxed text-muted">
                {t(`faq.${a}`)}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </div>
  );
}
