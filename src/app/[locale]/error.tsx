"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

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
      <p className="text-[10px] tracking-[0.2em] text-muted">
        {t("brand.name")}
      </p>
      <h2 className="mt-4 text-lg font-light tracking-tight">
        {t("errorPage.title")}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
        {t("errorPage.body")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={reset}>
          {t("errorPage.retry")}
        </Button>
        <Link href="/catalog">
          <Button variant="ghost">{t("cta.viewCatalog")}</Button>
        </Link>
      </div>
    </Container>
  );
}
