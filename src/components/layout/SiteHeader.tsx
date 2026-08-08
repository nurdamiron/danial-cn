import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileMenu } from "@/components/layout/MobileMenu";
import {
  CartIcon,
  HeartIcon,
  InstagramIcon,
  ShellMark,
  TruckIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { getSiteConfig, siteUrls } from "@/lib/settings";

export async function SiteHeader() {
  const t = await getTranslations();
  const config = await getSiteConfig();
  const urls = siteUrls(config);

  const navItems = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/reviews", label: t("nav.reviews") },
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/about", label: t("nav.about") },
    { href: "/contacts", label: t("nav.contacts") },
  ] as const;

  return (
    <header className="sticky top-0 z-50">
      <div className="on-dark relative bg-ink text-paper">
        <Container className="flex h-8 items-center justify-center gap-1.5">
          <TruckIcon className="h-3.5 w-3.5 shrink-0 text-alu" />
          <p className="t-label truncate text-alu">
            {t("home.trustDelivery")}
          </p>
        </Container>
        <div
          className="flute-edge-dark absolute inset-x-0 bottom-0"
          aria-hidden="true"
        />
      </div>

      <div className="border-b border-line bg-sand/92 shadow-[0_1px_0_rgba(11,11,11,0.03)] backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <div className="flex items-center gap-2 sm:gap-4">
            <MobileMenu items={navItems} />
            <Link
              href="/"
              className="group flex items-center gap-2.5 text-ink"
              aria-label={t("brand.name")}
            >
              <ShellMark className="h-[22px] w-[22px] transition-transform duration-500 group-hover:-translate-y-0.5" />
              <span className="t-display text-[0.9375rem] font-medium tracking-[0.3em] uppercase">
                {t("brand.name")}
              </span>
            </Link>
          </div>

          <NavLinks items={navItems} />

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <LocaleSwitcher className="hidden sm:inline-flex" />

            <div className="flex items-center gap-0.5 rounded-full border border-line bg-paper/70 p-0.5">
              <Link
                href="/favorites"
                aria-label={t("nav.favorites")}
                title={t("nav.favorites")}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-stone md:flex"
              >
                <HeartIcon />
              </Link>
              <Link
                href="/profile"
                aria-label={t("nav.profile")}
                title={t("nav.profile")}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-stone sm:flex"
              >
                <UserIcon />
              </Link>
              <Link
                href="/cart"
                aria-label={t("nav.cart")}
                title={t("nav.cart")}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-stone"
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
                className="hidden h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-stone md:flex"
              >
                <InstagramIcon />
              </a>
            </div>

            <a
              href={urls.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary hidden h-10 px-4 text-[0.8125rem] lg:inline-flex"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("nav.chat")}
            </a>
          </div>
        </Container>
      </div>
    </header>
  );
}
