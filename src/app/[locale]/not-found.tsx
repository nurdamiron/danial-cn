import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default async function LocaleNotFound() {
  const t = await getTranslations();

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-[10px] tracking-[0.2em] text-muted">
        {t("brand.name")}
      </p>
      <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">
        404
      </h1>
      <h2 className="mt-3 text-lg font-light tracking-tight">
        {t("notFound.title")}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        {t("notFound.body")}
      </p>
      <div className="mt-8">
        <Link href="/catalog">
          <Button variant="outline">{t("cta.viewCatalog")}</Button>
        </Link>
      </div>
    </Container>
  );
}
