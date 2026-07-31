import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { CartView } from "@/components/cart/CartView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    title: t("cart.title"),
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const { SITE } = await import("@/lib/site");

  return (
    <div>
      <PageHeader eyebrow={t("brand.name")} title={t("cart.title")} />
      <Container className="py-14 sm:py-20">
        <CartView waE164={SITE.whatsappE164} />
      </Container>
    </div>
  );
}
