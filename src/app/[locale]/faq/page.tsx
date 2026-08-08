import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("faq.title"),
    alternates: { canonical: `/${locale}/faq` },
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
      <PageHeader eyebrow={t("brand.name")} title={t("faq.title")} />
      <Container className="max-w-2xl py-14 sm:py-20">
        <dl className="divide-y divide-line border-y border-line">
          {items.map(([q, a]) => (
            <div key={q} className="py-7">
              <dt className="t-display t-h3">{t(`faq.${q}`)}</dt>
              <dd className="mt-3 leading-relaxed text-muted">
                {t(`faq.${a}`)}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
