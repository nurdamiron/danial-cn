import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const items = [
    ["q1", "a1"],
    ["q2", "a2"],
    ["q3", "a3"],
    ["q4", "a4"],
  ] as const;

  return (
    <Container className="max-w-2xl py-12">
      <h1 className="mb-8 text-2xl font-light tracking-tight">{t("title")}</h1>
      <div className="space-y-6">
        {items.map(([q, a]) => (
          <div key={q} className="border-b border-line pb-6">
            <h2 className="text-sm">{t(q)}</h2>
            <p className="mt-2 text-sm text-muted">{t(a)}</p>
          </div>
        ))}
      </div>
    </Container>
  );
}
