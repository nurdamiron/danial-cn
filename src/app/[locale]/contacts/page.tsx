import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <h1 className="text-2xl font-light tracking-tight sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">{t("body")}</p>

      <dl className="mt-10 space-y-6 border border-line bg-paper p-6 sm:p-8">
        <div>
          <dt className="text-xs text-muted">{t("phoneLabel")}</dt>
          <dd className="mt-1">
            <a
              href={SITE.whatsappUrl}
              className="text-lg font-light tracking-tight hover:opacity-60"
            >
              {SITE.whatsappDisplay}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t("chatLabel")}</dt>
          <dd className="mt-1 text-sm">{t("chatHint")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t("instagramLabel")}</dt>
          <dd className="mt-1">
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-light tracking-tight hover:opacity-60"
            >
              @{SITE.instagram}
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={SITE.whatsappUrl} target="_blank" rel="noreferrer">
          <Button>{t("wa")}</Button>
        </a>
        <a href={SITE.instagramUrl} target="_blank" rel="noreferrer">
          <Button variant="outline">{t("openInstagram")}</Button>
        </a>
      </div>
    </Container>
  );
}
