import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { getSiteConfig, siteUrls } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("forgotTitle"), robots: { index: false, follow: true } };
}

export default async function ForgotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = await getSiteConfig();
  const { whatsappUrl } = siteUrls(config);

  return (
    <Container className="max-w-md py-12 sm:py-16">
      <Suspense fallback={null}>
        <ForgotPasswordForm whatsappUrl={whatsappUrl} />
      </Suspense>
    </Container>
  );
}
