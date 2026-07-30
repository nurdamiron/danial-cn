import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";

export async function SiteHeader() {
  const t = await getTranslations();
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "77001234567";

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-sand/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-[4.25rem]">
        <Link
          href="/"
          className="text-[11px] font-medium tracking-[0.35em] text-ink uppercase sm:text-xs"
        >
          {t("brand.name")}
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] tracking-[0.14em] uppercase md:flex">
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

        <div className="flex items-center gap-5">
          <LocaleSwitcher />
          <Link
            href="/cart"
            className="text-[11px] tracking-[0.14em] uppercase transition hover:opacity-50"
          >
            {t("nav.cart")}
            <CartCount />
          </Link>
          <a
            href={`https://wa.me/${wa.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="hidden text-[11px] tracking-[0.14em] uppercase transition hover:opacity-50 sm:inline"
          >
            WhatsApp
          </a>
        </div>
      </Container>
    </header>
  );
}
