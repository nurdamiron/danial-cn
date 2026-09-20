import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { CustomerAuthForm } from "@/components/auth/CustomerAuthForm";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("loginTitle"), robots: { index: false, follow: true } };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    redirect(`/${locale}/profile`);
  }

  return (
    <Container className="max-w-md py-12 sm:py-16">
      <CustomerAuthForm mode="login" />
    </Container>
  );
}
