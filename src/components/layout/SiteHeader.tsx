import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileNav } from "@/components/layout/MobileNav";
import { BrandMark } from "@/components/ui/BrandMark";
import { CartIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getBrands } from "@/lib/products";
import { SITE } from "@/lib/site";

export async function SiteHeader() {
  const t = await getTranslations();

  const navItems = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/brands", label: t("nav.brands") },
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/about", label: t("nav.about") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/contacts", label: t("nav.contacts") },
  ] as const;

  const brands = getBrands().map((b) => ({ key: b.key, name: b.name }));

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-paper">
        <Container className="flex h-9 items-center justify-center">
          <p className="truncate text-center text-[9px] tracking-[0.14em] text-paper/70 sm:text-[10px] sm:tracking-[0.18em]">
            {t("announce.line")}
          </p>
        </Container>
      </div>

      <div className="border-b border-line/80 bg-sand/92 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-3 sm:h-[4.25rem] sm:gap-4">
          <Link
            href="/"
            aria-label={t("brand.name")}
            className="flex shrink-0 items-center text-ink transition hover:opacity-60"
          >
            <BrandMark name="danial-cn" height={16} label={t("brand.name")} />
          </Link>

          <NavLinks items={navItems} />

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>
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
              className="-m-1.5 hidden items-center justify-center p-1.5 text-ink transition hover:opacity-50 lg:flex"
            >
              <InstagramIcon />
            </a>
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={t("nav.chat")}
              title={t("nav.chat")}
              className="-m-1.5 hidden items-center justify-center p-1.5 text-ink transition hover:opacity-50 sm:flex"
            >
              <WhatsAppIcon />
            </a>

            <MobileNav
              items={navItems}
              brands={brands}
              labels={{
                open: t("nav.menuOpen"),
                close: t("catalog.close"),
                lines: t("footer.lines"),
                chat: t("nav.chat"),
                instagram: t("nav.instagram"),
                phone: t("contacts.phoneLabel"),
              }}
              whatsappUrl={SITE.whatsappUrl}
              instagramUrl={SITE.instagramUrl}
            />
          </div>
        </Container>
      </div>
    </header>
  );
}
