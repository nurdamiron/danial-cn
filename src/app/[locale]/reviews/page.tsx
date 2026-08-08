import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { REVIEWS } from "@/data/reviews";
import { getSiteConfig, siteUrls } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("reviewsPage.title"),
    alternates: { canonical: `/${locale}/reviews` },
  };
}

export default async function ReviewsPage({
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
        title={t("reviewsPage.title")}
        subtitle={t("reviewsPage.subtitle", { n: REVIEWS.length })}
      />
      <Container className="py-14 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} review={r} locale={locale} />
          ))}
        </div>

        <div className="card mt-10 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <p className="t-display t-h3 max-w-md text-balance">
            {t("reviewsPage.cta")}
          </p>
          <a
            href={urls.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClass("primary", "lg")}
          >
            <WhatsAppIcon className="h-[18px] w-[18px]" />
            {config.whatsappDisplay}
          </a>
        </div>
      </Container>
    </div>
  );
}
