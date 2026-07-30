import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { CartCount } from "@/components/layout/CartCount";

export async function SiteHeader() {
  const t = await getTranslations();
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_E164 ?? "77001234567";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#fafafa]/95 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4 sm:h-16">
        <Link
          href="/"
          className="text-xs font-medium tracking-[0.28em] uppercase sm:text-sm"
        >
          {t("brand.name")}
        </Link>

        <nav className="hidden items-center gap-6 text-xs tracking-wide md:flex">
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
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <Link href="/cart" className="text-xs tracking-wide">
            {t("nav.cart")}
            <CartCount />
          </Link>
          <a
            href={`https://wa.me/${wa.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs tracking-wide hover:opacity-60"
          >
            WA
          </a>
        </div>
      </Container>
    </header>
  );
}
