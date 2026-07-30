import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { prisma } from "@/lib/prisma";

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: 1 } })) ?? null;

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
    <Container className="max-w-3xl py-12">
      <h1 className="text-2xl font-light tracking-tight">{t("delivery.title")}</h1>
      <p className="mt-3 text-sm text-muted">{t("delivery.subtitle")}</p>
      <div className="mt-10 grid gap-4">
        {blocks.map((b) => (
          <div key={b.title} className="border border-line bg-white p-6">
            <h2 className="text-sm tracking-widest uppercase">{b.title}</h2>
            <p className="mt-3 text-sm text-muted">{b.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 border border-line bg-white p-6">
        <h2 className="text-sm tracking-widest uppercase">Kaspi</h2>
        <p className="mt-3 text-sm text-muted">{kaspi}</p>
      </div>
    </Container>
  );
}
