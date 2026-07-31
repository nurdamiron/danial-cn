import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("contacts.title"),
    description: t("contacts.body"),
    alternates: { canonical: `/${locale}/contacts` },
  };
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("contacts.title")}
        subtitle={t("contacts.body")}
      />
      <Container className="max-w-2xl py-14 sm:py-20">
        <dl className="space-y-6 border border-line bg-paper p-6 sm:p-8">
          <div>
            <dt className="text-xs text-muted">{t("contacts.phoneLabel")}</dt>
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
            <dt className="text-xs text-muted">{t("contacts.chatLabel")}</dt>
            <dd className="mt-1 text-sm">{t("contacts.chatHint")}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">
              {t("contacts.instagramLabel")}
            </dt>
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
            <Button>{t("contacts.wa")}</Button>
          </a>
          <a href={SITE.instagramUrl} target="_blank" rel="noreferrer">
            <Button variant="outline">{t("contacts.openInstagram")}</Button>
          </a>
        </div>
      </Container>
    </div>
  );
}
