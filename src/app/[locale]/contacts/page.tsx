import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "77001234567";

  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-light tracking-tight">{t("title")}</h1>
      <p className="mt-4 text-sm text-muted">{t("body")}</p>
      <a
        href={`https://wa.me/${wa.replace(/\D/g, "")}`}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-block"
      >
        <Button>{t("wa")}</Button>
      </a>
    </Container>
  );
}
