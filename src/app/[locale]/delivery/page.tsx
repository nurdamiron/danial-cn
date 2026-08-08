import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import {
  BoltIcon,
  ChatIcon,
  PlaneIcon,
  SlidersIcon,
  TruckIcon,
} from "@/components/ui/icons";
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

  const methods = [
    {
      key: "cargo",
      icon: TruckIcon,
      tier: 1,
      highlight: false,
      title: t("delivery.cargo"),
      body: locale === "kk" ? settings.deliveryCargoKk : settings.deliveryCargoRu,
    },
    {
      key: "avia",
      icon: PlaneIcon,
      tier: 2,
      highlight: false,
      title: t("delivery.avia"),
      body: locale === "kk" ? settings.deliveryAviaKk : settings.deliveryAviaRu,
    },
    {
      key: "express",
      icon: BoltIcon,
      tier: 3,
      highlight: true,
      title: t("delivery.express"),
      body:
        locale === "kk" ? settings.deliveryExpressKk : settings.deliveryExpressRu,
    },
  ];

  const info = [
    {
      key: "info1",
      icon: SlidersIcon,
      kaspi: false,
      title: t("delivery.info1Title"),
      text: t("delivery.info1Text"),
    },
    {
      key: "info2",
      icon: SlidersIcon,
      kaspi: true,
      title: t("delivery.info2Title"),
      text: t("delivery.info2Text"),
    },
    {
      key: "info3",
      icon: ChatIcon,
      kaspi: false,
      title: t("delivery.info3Title"),
      text: t("delivery.info3Text"),
    },
  ];

  const steps = [
    { n: 1, title: t("home.step1Title"), text: t("home.step1Text") },
    { n: 2, title: t("home.step2Title"), text: t("home.step2Text") },
    { n: 3, title: t("home.step3Title"), text: t("home.step3Text") },
    { n: 4, title: t("home.step4Title"), text: t("home.step4Text") },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("delivery.title")}
        subtitle={t("delivery.subtitle")}
      />

      <div className="media relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <Image
          src="/editorial/hero-doorway.jpg"
          alt=""
          fill
          quality={95}
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <Container className="max-w-3xl py-14 sm:py-20">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {methods.map((m) => (
              <div
                key={m.key}
                className={`card flex flex-col p-6 ${
                  m.highlight ? "border-ink bg-ink text-paper" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <m.icon
                    className={`h-5 w-5 ${
                      m.highlight ? "text-paper" : "text-ink"
                    }`}
                  />
                  <div className="flex items-end gap-1" aria-hidden="true">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full ${
                          i <= m.tier
                            ? m.highlight
                              ? "bg-paper"
                              : "bg-ink"
                            : m.highlight
                              ? "bg-paper/25"
                              : "bg-line-strong"
                        }`}
                        style={{ height: `${i * 4 + 4}px` }}
                      />
                    ))}
                  </div>
                </div>
                <h2
                  className={`t-display mt-4 text-lg ${
                    m.highlight ? "text-paper" : ""
                  }`}
                >
                  {m.title}
                </h2>
                <p
                  className={`t-micro mt-2 ${
                    m.highlight ? "text-paper/70" : "text-muted"
                  }`}
                >
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-14">
            <p className="t-label text-muted">{t("delivery.infoTitle")}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {info.map((i) => (
                <div key={i.key} className="card flex items-start gap-3.5 p-5">
                  {i.kaspi ? (
                    <KaspiBadge height={20} className="mt-0.5 shrink-0" />
                  ) : (
                    <i.icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{i.title}</p>
                    <p className="t-micro mt-1.5 text-muted">{i.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>

      <section className="on-dark border-t border-line bg-graphite py-14 text-paper sm:py-20">
        <Container>
          <Reveal>
            <p className="t-label text-alu">{t("home.orderPath")}</p>
            <h2 className="t-display t-h2 mt-2">{t("home.howTitle")}</h2>

            <ol className="mt-10 grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li key={s.n} className="bg-graphite p-6">
                  <span className="t-data text-alu">
                    {String(s.n).padStart(2, "0")}
                  </span>
                  <p className="t-display mt-3 text-lg">{s.title}</p>
                  <p className="t-micro mt-2 text-paper/60">{s.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
