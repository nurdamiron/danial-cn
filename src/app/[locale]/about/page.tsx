import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ChatIcon, ShieldIcon, TruckIcon } from "@/components/ui/icons";
import { KaspiBadge } from "@/components/ui/KaspiBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("about.title"),
    description: t("about.lead"),
    alternates: { canonical: `/${locale}/about` },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const values = [
    { icon: ShieldIcon, title: t("about.value1Title"), text: t("about.value1Text") },
    { icon: ChatIcon, title: t("about.value2Title"), text: t("about.value2Text") },
    { icon: TruckIcon, title: t("about.value3Title"), text: t("about.value3Text") },
  ] as const;

  return (
    <div>
      <PageHeader
        eyebrow={t("brand.name")}
        title={t("about.title")}
        subtitle={t("about.lead")}
      />

      <div className="media relative aspect-[16/7] w-full sm:aspect-[21/7]">
        <Image
          src="/editorial/collection-family.jpg"
          alt=""
          fill
          quality={95}
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <Container className="py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="t-lead text-ink/85">{t("about.body")}</p>

            <div className="mt-10">
              <p className="t-label text-muted">{t("about.materialsTitle")}</p>
              <p className="t-lead mt-3 text-ink/85">
                {t("about.materialsText")}
              </p>
            </div>

            <div className="card mt-10 flex items-start gap-4 border-line-strong p-6">
              <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <div>
                <p className="t-label text-muted">
                  {t("about.honestyTitle")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/85">
                  {t("about.honestyText")}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <ul className="space-y-4">
              {values.map((v) => (
                <li key={v.title} className="card flex items-start gap-4 p-5">
                  <v.icon className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
                  <div>
                    <p className="text-sm font-medium">{v.title}</p>
                    <p className="t-micro mt-1 text-muted">{v.text}</p>
                  </div>
                </li>
              ))}
              <li className="card flex items-start gap-4 p-5">
                <KaspiBadge height={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {t("about.value4Title")}
                  </p>
                  <p className="t-micro mt-1 text-muted">
                    {t("about.value4Text")}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </div>
  );
}
