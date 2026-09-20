import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { buttonClass } from "@/components/ui/Button";

export default async function LocaleNotFound() {
  const t = await getTranslations();

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="t-data text-muted">404</p>
      <h1 className="t-display t-h1 mt-4">{t("notFound.title")}</h1>
      <p className="t-lead mt-4 max-w-sm text-muted">{t("notFound.body")}</p>
      <Link
        href="/catalog"
        className={buttonClass("primary", "lg", "mt-8 inline-flex")}
      >
        {t("cta.viewCatalog")}
      </Link>
    </Container>
  );
}
