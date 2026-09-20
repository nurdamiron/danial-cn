import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "favorites" });
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("favorites");
  const tBrand = await getTranslations("brand");

  return (
    <div>
      <PageHeader eyebrow={tBrand("name")} title={t("title")} />
      <Container className="max-w-2xl py-10 sm:py-14">
        <FavoritesView />
      </Container>
    </div>
  );
}
