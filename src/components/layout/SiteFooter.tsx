import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { BrandMark } from "@/components/ui/BrandMark";
import { getBrands } from "@/lib/products";
import { SITE } from "@/lib/site";

export async function SiteFooter() {
  const t = await getTranslations();
  const brands = getBrands();

  return (
    <footer className="mt-auto border-t border-line bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <BrandMark
            name="danial-cn"
            height={16}
            label={t("brand.name")}
            className="text-ink"
          />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            {t("footer.rights")}
          </p>
          <div className="mt-6 space-y-2 text-sm">
            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-ink hover:opacity-60"
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              {t("contacts.phoneLabel")} {SITE.whatsappDisplay}
            </a>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-ink hover:opacity-60"
            >
              <InstagramIcon className="h-4 w-4 shrink-0" />
              {t("contacts.instagramLabel")} @{SITE.instagram}
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
          <Link href="/brands" className="hover:opacity-60">
            {t("nav.brands")}
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

        <div className="md:col-span-4">
          <p className="mb-4 text-[10px] tracking-[0.16em] text-muted">
            {t("footer.lines")}
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-4">
            {brands.map((b) => (
              <li key={b.key}>
                <Link
                  href={`/catalog?brand=${b.key}`}
                  className="inline-flex text-ink transition hover:opacity-50"
                >
                  <BrandMark name={b.key} height={11} label={b.name} />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-line pt-5">
            <p className="mb-3 text-[10px] tracking-[0.16em] text-muted">
              {t("footer.order")}
            </p>
            <p className="flex items-center gap-2 text-xs text-muted">
              {t("payment.accepted")}
              <BrandMark name="pay-kaspi" height={18} label="Kaspi" colored />
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {t("delivery.cargo")}, {t("delivery.avia")},{" "}
              {t("delivery.express")}
            </p>
          </div>
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
