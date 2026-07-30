import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <Container className="grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="text-xs tracking-[0.28em] uppercase">{t("brand.name")}</p>
          <p className="mt-3 text-sm text-muted">{t("footer.rights")}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/catalog">{t("nav.catalog")}</Link>
          <Link href="/delivery">{t("nav.delivery")}</Link>
          <Link href="/about">{t("nav.about")}</Link>
          <Link href="/faq">{t("nav.faq")}</Link>
          <Link href="/contacts">{t("nav.contacts")}</Link>
        </div>
        <div className="text-sm text-muted">
          <p>{t("replica.disclaimer")}</p>
          <p className="mt-3">{t("payment.kaspiNote")}</p>
        </div>
      </Container>
    </footer>
  );
}
