import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";
import { NavLinks } from "@/components/layout/NavLinks";
import {
  CartIcon,
  HeartIcon,
  InstagramIcon,
  ShellMark,
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
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/about", label: t("nav.about") },
    { href: "/contacts", label: t("nav.contacts") },
  ] as const;

  return (
    <header className="sticky top-0 z-50">
      {/* What every visitor asks first: where do you ship, how do I pay.
          Narrow screens get the delivery half only — a clipped promise is worse
          than a short one. */}
      <div className="on-dark bg-ink text-paper">
        <Container className="flex h-8 items-center justify-center">
          <p className="t-label truncate text-alu">
            {t("home.trustDelivery")}
            <span className="hidden sm:inline">
              <span className="mx-2 text-alu/50">·</span>
              {t("payment.kaspiNote")}
            </span>
          </p>
        </Container>
      </div>

      <div className="border-b border-line bg-sand/92 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
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

          <NavLinks items={navItems} />

          <div className="flex items-center gap-1 sm:gap-1.5">
            <LocaleSwitcher className="mr-1 hidden sm:inline-flex" />

            <Link
              href="/favorites"
              aria-label={t("nav.favorites")}
              title={t("nav.favorites")}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-stone md:flex"
            >
              <HeartIcon />
            </Link>
            <Link
              href="/profile"
              aria-label={t("nav.profile")}
              title={t("nav.profile")}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-stone sm:flex"
            >
              <UserIcon />
            </Link>
            <Link
              href="/cart"
              aria-label={t("nav.cart")}
              title={t("nav.cart")}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-stone"
            >
              <CartIcon />
              <CartCount />
            </Link>

            <span
              aria-hidden="true"
              className="mx-1 hidden h-5 w-px bg-line md:block"
            />

            <a
              href={urls.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("nav.instagram")}
              title={t("nav.instagram")}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-stone md:flex"
            >
              <InstagramIcon />
            </a>
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
