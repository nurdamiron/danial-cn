import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";
import { NavLinks } from "@/components/layout/NavLinks";
import { CartIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { SITE } from "@/lib/site";

export async function SiteHeader() {
  const t = await getTranslations();

  const navItems = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/about", label: t("nav.about") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/contacts", label: t("nav.contacts") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-sand/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        <Link
          href="/"
          className="text-[11px] font-medium tracking-[0.35em] text-ink uppercase sm:text-xs"
        >
          {t("brand.name")}
        </Link>

        <NavLinks items={navItems} />

        <div className="flex items-center gap-3.5 sm:gap-4">
          <LocaleSwitcher />
          <Link
            href="/cart"
            aria-label={t("nav.cart")}
            title={t("nav.cart")}
            className="relative -m-1.5 flex items-center justify-center p-1.5 text-ink transition hover:opacity-50"
          >
            <CartIcon />
            <CartCount />
          </Link>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.instagram")}
            title={t("nav.instagram")}
            className="-m-1.5 flex items-center justify-center p-1.5 text-ink transition hover:opacity-50"
          >
            <InstagramIcon />
          </a>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.chat")}
            title={t("nav.chat")}
            className="-m-1.5 flex items-center justify-center p-1.5 text-ink transition hover:opacity-50"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </Container>
    </header>
  );
}
