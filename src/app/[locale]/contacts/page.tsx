import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getSiteConfig, siteUrls } from "@/lib/settings";

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
  const config = await getSiteConfig();
  const urls = siteUrls(config);

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
                href={urls.whatsappUrl}
                className="inline-flex items-center gap-2 text-lg font-light tracking-tight hover:opacity-60"
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0" />
                {config.whatsappDisplay}
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
                href={urls.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-lg font-light tracking-tight hover:opacity-60"
              >
                <InstagramIcon className="h-5 w-5 shrink-0" />@
                {config.instagram}
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={urls.whatsappUrl} target="_blank" rel="noreferrer">
            <Button className="gap-2">
              <WhatsAppIcon />
              {t("contacts.wa")}
            </Button>
          </a>
          <a href={urls.instagramUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2">
              <InstagramIcon />
              {t("contacts.openInstagram")}
            </Button>
          </a>
        </div>
      </Container>
    </div>
  );
}
