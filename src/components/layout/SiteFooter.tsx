import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import {
  InstagramIcon,
  ShellMark,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { getSiteConfig, siteUrls } from "@/lib/settings";

export async function SiteFooter() {
  const t = await getTranslations();
  const locale = await getLocale();
  const config = await getSiteConfig();
  const urls = siteUrls(config);
  const kaspiNote = locale === "kk" ? config.kaspiNoteKk : config.kaspiNoteRu;
  const disclaimer =
    locale === "kk" ? config.disclaimerKk : config.disclaimerRu;

  const menu = [
    { href: "/catalog", label: t("nav.catalog") },
    { href: "/reviews", label: t("nav.reviews") },
    { href: "/delivery", label: t("nav.delivery") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/about", label: t("nav.about") },
    { href: "/contacts", label: t("nav.contacts") },
  ] as const;

  const account = [
    { href: "/profile", label: t("nav.profile") },
    { href: "/orders", label: t("nav.orders") },
    { href: "/favorites", label: t("nav.favorites") },
    { href: "/cart", label: t("nav.cart") },
  ] as const;

  return (
    <footer className="on-dark mt-auto bg-graphite text-paper">
      <div className="flute-edge-dark" aria-hidden="true" />
      <Container className="grid gap-12 py-14 md:grid-cols-12 md:gap-x-10 md:gap-y-0 md:py-20">
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5">
            <ShellMark className="h-7 w-7" />
            <span className="t-display text-base font-medium tracking-[0.3em] uppercase">
              {t("brand.name")}
            </span>
          </div>
          <p className="t-label mt-3 text-alu">{t("footer.tagline")}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
            {t("footer.rights")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={urls.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary h-11 px-5 text-sm"
            >
              <WhatsAppIcon className="h-[18px] w-[18px]" />
              {config.whatsappDisplay}
            </a>
            <a
              href={urls.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-inverse h-11 px-5 text-sm"
            >
              <InstagramIcon className="h-[18px] w-[18px]" />@{config.instagram}
            </a>
          </div>
        </div>

        <nav
          className="mt-2 border-t border-white/10 pt-8 md:col-span-2 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-8"
          aria-label={t("footer.menu")}
        >
          <p className="t-label text-alu">{t("footer.menu")}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {menu.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="text-paper/75 transition hover:text-paper"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          className="border-t border-white/10 pt-8 md:col-span-2 md:mt-0 md:border-t-0 md:border-l md:pt-0 md:pl-8"
          aria-label={t("profile.cabinet")}
        >
          <p className="t-label text-alu">{t("profile.cabinet")}</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {account.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  className="text-paper/75 transition hover:text-paper"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-white/10 pt-8 md:col-span-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
          <p className="t-label text-alu">{t("footer.order")}</p>
          <div className="mt-4 space-y-4 text-sm text-paper/70">
            <div className="flex items-start gap-3">
              <KaspiBadge height={22} />
              <p className="leading-relaxed">{kaspiNote}</p>
            </div>
            <div className="flex items-start gap-3">
              <TruckIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-alu" />
              <p className="t-label text-alu">
                {t("delivery.cargo")} · {t("delivery.avia")} ·{" "}
                {t("delivery.express")}
              </p>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-[0.75rem] text-paper/45 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {t("brand.name")} · {t("footer.tagline")}
          </span>
          <span className="max-w-md sm:text-right">{disclaimer}</span>
        </Container>
      </div>
    </footer>
  );
}
