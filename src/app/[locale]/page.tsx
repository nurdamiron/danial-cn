import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonClass } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeHero } from "@/components/home/HomeHero";
import { SizeGuide } from "@/components/home/SizeGuide";
import { KaspiBadge } from "@/components/ui/KaspiBadge";
import { ChatIcon, TruckIcon, WhatsAppIcon } from "@/components/ui/icons";
import { getSiteConfig, siteUrls } from "@/lib/settings";
import { formatSpecLine } from "@/lib/specs";
import {
  listFeaturedProducts,
  listActiveProducts,
  localizedBrand,
  localizedName,
  pickCoverUrl,
  uniqueColorDots,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return {
    description: t("home.heroLead"),
    alternates: { canonical: `/${locale}` },
  };
}

/**
 * Home reads as one decision path:
 * hero → size (the real first question) → categories → the shelf → how it
 * works → chat.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const config = await getSiteConfig();
  const urls = siteUrls(config);
  const kaspiNote = locale === "kk" ? config.kaspiNoteKk : config.kaspiNoteRu;

  const allProducts = await listActiveProducts();
  let featured = await listFeaturedProducts(8);
  if (featured.length === 0) featured = allProducts.slice(0, 8);

  const categories = [
    {
      key: "cabin" as const,
      href: "/catalog?category=cabin",
      image: "/editorial/cat-cabin.jpg",
    },
    {
      key: "checkin" as const,
      href: "/catalog?category=checkin",
      image: "/editorial/cat-checkin.jpg",
    },
    {
      key: "set" as const,
      href: "/catalog?category=set",
      image: "/editorial/cat-set.jpg",
    },
    {
      key: "bag" as const,
      href: "/catalog?category=bag",
      image: "/editorial/cat-bag.jpg",
    },
  ];

  const steps = [
    { n: 1, title: t("home.step1Title"), text: t("home.step1Text") },
    { n: 2, title: t("home.step2Title"), text: t("home.step2Text") },
    { n: 3, title: t("home.step3Title"), text: t("home.step3Text") },
    { n: 4, title: t("home.step4Title"), text: t("home.step4Text") },
  ];

  return (
    <div>
      <HomeHero
        eyebrow={t("home.heroEyebrow")}
        title={t("home.hero")}
        lead={t("home.heroLead")}
        spec={t("home.heroSpec")}
        catalogLabel={t("cta.viewCatalog")}
        chatLabel={t("nav.chat")}
        kaspiNote={kaspiNote}
        whatsappUrl={urls.whatsappUrl}
      />

      {/* Three promises, stated once, right under the fold */}
      <section className="border-b border-line bg-paper">
        <Container>
          <ul className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <li className="flex items-start gap-3 py-5 sm:py-6 sm:pr-6">
              <KaspiBadge height={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{t("home.trustKaspi")}</p>
                <p className="t-micro text-muted">{t("home.trustKaspiDesc")}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 py-5 sm:px-6 sm:py-6">
              <ChatIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <div>
                <p className="text-sm font-medium">{t("home.trustChat")}</p>
                <p className="t-micro text-muted">{t("home.trustChatDesc")}</p>
              </div>
            </li>
            <li className="flex items-start gap-3 py-5 sm:py-6 sm:pl-6">
              <TruckIcon className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
              <div>
                <p className="text-sm font-medium">{t("home.trustDelivery")}</p>
                <p className="t-micro text-muted">
                  {t("home.trustDeliveryDesc")}
                </p>
              </div>
            </li>
          </ul>
        </Container>
      </section>

      <SizeGuide />

      {/* Categories */}
      <section className="border-t border-line bg-sand py-14 sm:py-20">
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <p className="t-label text-muted">{t("home.categories")}</p>
                <h2 className="t-display t-h2 mt-2">
                  {t("home.materialsTitle")}
                </h2>
              </div>
              <Link href="/catalog" className="link-quiet t-micro shrink-0">
                {t("cta.viewCatalog")} →
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {categories.map((c) => (
                <Link
                  key={c.key}
                  href={c.href}
                  className="media lift group flex flex-col"
                >
                  <div className="relative aspect-[5/4]">
                    <Image
                      src={c.image}
                      alt=""
                      fill
                      quality={95}
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width:640px) 50vw, 25vw"
                    />
                  </div>
                  <p className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
                    {t(`category.${c.key}`)}
                    <span
                      aria-hidden="true"
                      className="text-muted transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* The shelf */}
      <section className="border-t border-line bg-paper py-14 sm:py-20">
        <Container>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <p className="t-label text-muted">{t("home.shop")}</p>
                <h2 className="t-display t-h2 mt-2">{t("home.bestsellers")}</h2>
              </div>
              <Link href="/catalog" className="link-quiet t-micro shrink-0">
                {t("cta.viewCatalog")} →
              </Link>
            </div>

            {featured.length === 0 ? (
              <p className="card mt-8 py-16 text-center text-sm text-muted">
                {t("catalog.empty")}
              </p>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
                {featured.map((p, i) => {
                  const cover = pickCoverUrl(p.images);
                  if (!cover) return null;
                  const hover = p.images.find((img) => img.url !== cover)?.url;
                  const name = localizedName(p, locale);
                  return (
                    <ProductCard
                      key={p.id}
                      href={`/catalog/${p.slug}`}
                      brand={localizedBrand(
                        p as {
                          brand: string;
                          brandRu?: string;
                          brandKk?: string;
                        },
                        locale,
                      )}
                      name={name}
                      priceLabel={formatKzt(p.basePriceKzt)}
                      coverUrl={cover}
                      hoverUrl={hover}
                      colors={uniqueColorDots(p.variants, locale)}
                      specs={formatSpecLine(p, locale) ?? undefined}
                      priority={i < 2}
                      favorite={{
                        productId: p.id,
                        slug: p.slug,
                        brand: p.brand,
                        name,
                        priceLabel: formatKzt(p.basePriceKzt),
                        coverUrl: cover,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </Reveal>
        </Container>
      </section>

      {/* How ordering works — a real sequence, so it is numbered */}
      <section className="on-dark border-t border-line bg-graphite py-14 text-paper sm:py-20">
        <Container>
          <Reveal>
            <p className="t-label text-alu">{t("home.orderPath")}</p>
            <h2 className="t-display t-h2 mt-2 max-w-xl text-balance">
              {t("home.howTitle")}
            </h2>

            <ol className="mt-10 grid gap-px overflow-hidden rounded-lg bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <li key={s.n} className="bg-graphite p-6">
                  <span className="t-data text-alu">
                    {String(s.n).padStart(2, "0")}
                  </span>
                  <p className="t-display mt-3 text-lg">{s.title}</p>
                  <p className="t-micro mt-2 text-paper/60">{s.text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      {/* Close: one action, one number */}
      <section className="border-t border-line bg-sand py-14 sm:py-20">
        <Container>
          <Reveal>
            <div className="card flex flex-col items-start gap-6 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="t-display t-h2 text-balance">
                  {t("home.finalTitle")}
                </h2>
                <p className="t-lead mt-3 text-muted">{t("home.finalText")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/catalog" className={buttonClass("primary", "lg")}>
                  {t("cta.viewCatalog")}
                </Link>
                <a
                  href={urls.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonClass("outline", "lg")}
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  {config.whatsappDisplay}
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
