import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";
import { NavLinks } from "@/components/layout/NavLinks";
import { CartIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getSiteConfig, siteUrls } from "@/lib/settings";

function ProfileIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="9" r="3.5" />
      <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
    </svg>
  );
}

export async function SiteHeader() {
  const t = await getTranslations();
  const config = await getSiteConfig();
  const urls = siteUrls(config);

  const navItems = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/about", label: t("nav.about") },
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

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <Link
            href="/profile"
            aria-label={t("nav.profile")}
            title={t("nav.profile")}
            className="relative -m-1.5 flex items-center justify-center p-1.5 text-ink transition hover:opacity-50"
          >
            <ProfileIcon />
          </Link>
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
            href={urls.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.instagram")}
            title={t("nav.instagram")}
            className="-m-1.5 hidden items-center justify-center p-1.5 text-ink transition hover:opacity-50 md:flex"
          >
            <InstagramIcon />
          </a>
          <a
            href={urls.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.chat")}
            title={t("nav.chat")}
            className="-m-1.5 hidden items-center justify-center p-1.5 text-ink transition hover:opacity-50 sm:flex"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </Container>
    </header>
  );
}
