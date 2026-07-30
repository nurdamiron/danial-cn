import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-light tracking-tight">{t("title")}</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted">{t("body")}</p>
    </Container>
  );
}
