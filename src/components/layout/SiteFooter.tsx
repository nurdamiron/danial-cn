import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { getSiteConfig, siteUrls } from "@/lib/settings";

export async function SiteFooter() {
  const t = await getTranslations();
  const config = await getSiteConfig();
  const urls = siteUrls(config);
  const kaspi = config.kaspiNoteRu;

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
              href={urls.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-ink hover:opacity-60"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              {t("contacts.phoneLabel")}: {config.whatsappDisplay}
            </a>
            <a
              href={urls.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-ink hover:opacity-60"
            >
              <InstagramIcon className="h-4 w-4 shrink-0" />
              {t("contacts.instagramLabel")}: @{config.instagram}
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
          <Link href="/cart" className="hover:opacity-60">
            {t("nav.cart")}
          </Link>
          <Link href="/profile" className="hover:opacity-60">
            {t("nav.profile")}
          </Link>
          <Link href="/orders" className="hover:opacity-60">
            {t("nav.orders")}
          </Link>
          <Link href="/favorites" className="hover:opacity-60">
            {t("nav.favorites")}
          </Link>
          <Link href="/delivery" className="hover:opacity-60">
            {t("nav.delivery")}
          </Link>
          <Link href="/contacts" className="hover:opacity-60">
            {t("nav.contacts")}
          </Link>
        </div>
        <div className="space-y-4 text-sm text-muted md:col-span-4">
          <p className="text-[10px] tracking-[0.16em] text-muted">
            {t("footer.order")}
          </p>
          <p className="flex flex-wrap items-center gap-1.5 leading-relaxed">
            <KaspiBadge />
            {kaspi || t("payment.kaspiNote")}
          </p>
          <p className="leading-relaxed">
            {t("delivery.cargo")} · {t("delivery.avia")} ·{" "}
            {t("delivery.express")}
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
