import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";
import { SITE } from "@/lib/site";

export async function SiteHeader() {
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-sand/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        <Link
          href="/"
          className="text-[11px] font-medium tracking-[0.35em] text-ink uppercase sm:text-xs"
        >
          {t("brand.name")}
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] md:flex">
          <Link href="/catalog" className="transition hover:opacity-50">
            {t("nav.catalog")}
          </Link>
          <Link href="/delivery" className="transition hover:opacity-50">
            {t("nav.delivery")}
          </Link>
          <Link href="/about" className="transition hover:opacity-50">
            {t("nav.about")}
          </Link>
          <Link href="/faq" className="transition hover:opacity-50">
            {t("nav.faq")}
          </Link>
          <Link href="/contacts" className="transition hover:opacity-50">
            {t("nav.contacts")}
          </Link>
        </nav>

        <div className="flex items-center gap-4 sm:gap-5">
          <LocaleSwitcher />
          <Link
            href="/cart"
            className="text-[13px] transition hover:opacity-50"
          >
            {t("nav.cart")}
            <CartCount />
          </Link>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13px] transition hover:opacity-50 md:inline"
          >
            {t("nav.instagram")}
          </a>
          <a
            href={SITE.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[13px] transition hover:opacity-50 sm:inline"
          >
            {t("nav.chat")}
          </a>
        </div>
      </Container>
    </header>
  );
}
