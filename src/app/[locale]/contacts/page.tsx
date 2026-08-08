import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/Button";
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
        <dl className="card divide-y divide-line">
          <div className="p-6 sm:p-7">
            <dt className="t-label text-muted">{t("contacts.phoneLabel")}</dt>
            <dd className="mt-2">
              <a
                href={urls.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="t-display inline-flex items-center gap-2.5 text-xl hover:opacity-60"
              >
                <WhatsAppIcon className="h-5 w-5 shrink-0" />
                {config.whatsappDisplay}
              </a>
              <p className="t-micro mt-2 text-muted">
                {t("contacts.chatHint")}
              </p>
            </dd>
          </div>
          <div className="p-6 sm:p-7">
            <dt className="t-label text-muted">
              {t("contacts.instagramLabel")}
            </dt>
            <dd className="mt-2">
              <a
                href={urls.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="t-display inline-flex items-center gap-2.5 text-xl hover:opacity-60"
              >
                <InstagramIcon className="h-5 w-5 shrink-0" />@
                {config.instagram}
              </a>
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={urls.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClass("primary", "lg")}
          >
            <WhatsAppIcon />
            {t("contacts.wa")}
          </a>
          <a
            href={urls.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClass("outline", "lg")}
          >
            <InstagramIcon />
            {t("contacts.openInstagram")}
          </a>
        </div>

        <div className="mt-14">
          <p className="t-label text-muted">{t("contacts.helpTitle")}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {(["help1", "help2", "help3"] as const).map((key) => (
              <div key={key} className="card p-5">
                <p className="text-sm font-medium">
                  {t(`contacts.${key}Title`)}
                </p>
                <p className="t-micro mt-1.5 text-muted">
                  {t(`contacts.${key}Text`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
