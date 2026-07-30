import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/lib/site";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-xs tracking-[0.28em] uppercase">
            {t("brand.name")}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {t("footer.rights")}
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-ink hover:opacity-60"
            >
              {t("contacts.phoneLabel")}: {SITE.whatsappDisplay}
            </a>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-ink hover:opacity-60"
            >
              {t("contacts.instagramLabel")}: @{SITE.instagram}
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm md:col-span-3">
          <p className="mb-1 text-[10px] tracking-[0.16em] text-muted">
            {t("footer.menu")}
          </p>
          <Link href="/catalog" className="hover:opacity-60">
            {t("nav.catalog")}
          </Link>
          <Link href="/delivery" className="hover:opacity-60">
            {t("nav.delivery")}
          </Link>
          <Link href="/about" className="hover:opacity-60">
            {t("nav.about")}
          </Link>
          <Link href="/faq" className="hover:opacity-60">
            {t("nav.faq")}
          </Link>
          <Link href="/contacts" className="hover:opacity-60">
            {t("nav.contacts")}
          </Link>
        </div>
        <div className="space-y-4 text-sm text-muted md:col-span-4">
          <p className="text-[10px] tracking-[0.16em] text-muted">
            {t("footer.order")}
          </p>
          <p className="leading-relaxed">{t("payment.kaspiNote")}</p>
          <p className="leading-relaxed">
            {t("delivery.cargo")} · {t("delivery.avia")} · {t("delivery.express")}
          </p>
        </div>
      </Container>
      <div className="border-t border-line">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-5 text-[10px] tracking-[0.12em] text-muted">
          <span>
            © {new Date().getFullYear()} {t("brand.name")}
          </span>
          <span>{t("footer.tagline")}</span>
        </Container>
      </div>
    </footer>
  );
}
