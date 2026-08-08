import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { BrandMark } from "@/components/ui/BrandMark";
import { isStaticCatalog } from "@/lib/static-catalog";

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

  let settings: {
    deliveryCargoRu: string;
    deliveryCargoKk: string;
    deliveryAviaRu: string;
    deliveryAviaKk: string;
    deliveryExpressRu: string;
    deliveryExpressKk: string;
    kaspiNoteRu: string;
    kaspiNoteKk: string;
  } | null = null;

  if (!isStaticCatalog()) {
    try {
      const { prisma } = await import("@/lib/prisma");
      settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    } catch {
      settings = null;
    }
  }

  const blocks = [
    {
      title: t("delivery.cargo"),
      body:
        locale === "kk"
          ? (settings?.deliveryCargoKk ?? t("delivery.subtitle"))
          : (settings?.deliveryCargoRu ?? t("delivery.subtitle")),
    },
    {
      title: t("delivery.avia"),
      body:
        locale === "kk"
          ? (settings?.deliveryAviaKk ?? "")
          : (settings?.deliveryAviaRu ?? ""),
    },
    {
      title: t("delivery.express"),
      body:
        locale === "kk"
          ? (settings?.deliveryExpressKk ?? "")
          : (settings?.deliveryExpressRu ?? ""),
    },
  ];

  const kaspi =
    locale === "kk"
      ? (settings?.kaspiNoteKk ?? t("payment.kaspiNote"))
      : (settings?.kaspiNoteRu ?? t("payment.kaspiNote"));

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
          <BrandMark name="pay-kaspi" height={22} label="Kaspi" colored />
          <p className="mt-3 text-sm leading-relaxed text-muted">{kaspi}</p>
        </div>
      </Container>
    </div>
  );
}
