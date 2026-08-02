import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { getSiteConfig } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("delivery.title"),
    description: t("delivery.subtitle"),
    alternates: { canonical: `/${locale}/delivery` },
  };
}

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const settings = await getSiteConfig();

  const blocks = [
    {
      title: t("delivery.cargo"),
      body:
        locale === "kk"
          ? settings.deliveryCargoKk
          : settings.deliveryCargoRu,
    },
    {
      title: t("delivery.avia"),
      body:
        locale === "kk" ? settings.deliveryAviaKk : settings.deliveryAviaRu,
    },
    {
      title: t("delivery.express"),
      body:
        locale === "kk"
          ? settings.deliveryExpressKk
          : settings.deliveryExpressRu,
    },
  ];

  const kaspi =
    locale === "kk" ? settings.kaspiNoteKk : settings.kaspiNoteRu;

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("delivery.title")}
        subtitle={t("delivery.subtitle")}
      />
      <Container className="max-w-3xl py-14 sm:py-20">
        <div className="grid gap-4">
          {blocks.map((b) => (
            <div key={b.title} className="border border-line bg-white p-6">
              <h2 className="text-sm tracking-widest uppercase">{b.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {b.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 border border-line bg-white p-6">
          <KaspiBadge className="text-sm" />
          <p className="mt-3 text-sm leading-relaxed text-muted">{kaspi}</p>
        </div>
      </Container>
    </div>
  );
}
