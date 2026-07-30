import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { CartView } from "@/components/cart/CartView";

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
    <Container className="py-12">
      <h1 className="mb-8 text-2xl font-light tracking-tight">
        {t("cart.title")}
      </h1>
      <CartView waE164={SITE.whatsappE164} />
    </Container>
  );
}
