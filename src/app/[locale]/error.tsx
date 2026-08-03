"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button, buttonClass } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="t-label text-muted">{t("brand.name")}</p>
      <h2 className="t-display t-h2 mt-4">{t("errorPage.title")}</h2>
      <p className="t-lead mt-4 max-w-sm text-muted">{t("errorPage.body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          {t("errorPage.retry")}
        </Button>
        <Link href="/catalog" className={buttonClass("outline", "lg")}>
          {t("cta.viewCatalog")}
        </Link>
      </div>
    </Container>
  );
}
