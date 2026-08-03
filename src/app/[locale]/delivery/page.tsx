import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { TruckIcon } from "@/components/ui/icons";
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
        <div className="grid gap-4 sm:grid-cols-3">
          {blocks.map((b) => (
            <div key={b.title} className="card flex flex-col p-6">
              <TruckIcon className="h-5 w-5 text-ink" />
              <h2 className="t-display mt-4 text-lg">{b.title}</h2>
              <p className="t-micro mt-2 text-muted">{b.body}</p>
            </div>
          ))}
        </div>
        <div className="card mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 p-6">
          <KaspiBadge height={26} />
          <p className="min-w-[16rem] flex-1 text-sm leading-relaxed text-muted">
            {kaspi}
          </p>
        </div>
      </Container>
    </div>
  );
}
