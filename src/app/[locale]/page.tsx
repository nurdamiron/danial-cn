import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCinematic } from "@/components/home/HeroCinematic";
import { TrustBar } from "@/components/home/TrustBar";
import { OrderPath } from "@/components/home/OrderPath";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { MarqueeBar } from "@/components/home/MarqueeBar";
import {
  listFeaturedProducts,
  listActiveProducts,
  localizedName,
  pickCoverUrl,
} from "@/lib/products";
import { formatKzt } from "@/lib/money";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let featured = await listFeaturedProducts(8);
  if (featured.length === 0) {
    featured = (await listActiveProducts()).slice(0, 8);
  }

  const categories = [
    {
      key: "cabin",
      href: "/catalog?category=cabin",
      image: "/products/alu-cabin-55/silver-front.jpg",
    },
    {
      key: "checkin",
      href: "/catalog?category=checkin",
      image: "/products/pc-checkin-75/01-front.jpg",
    },
    {
      key: "set",
      href: "/catalog?category=set",
      image: "/products/soft-cabin-55/01-front.jpg",
    },
    {
      key: "bag",
      href: "/catalog?category=bag",
      image: "/products/soft-cabin-55/02-interior.jpg",
    },
  ] as const;

  const orderSteps =
    locale === "kk"
      ? [
          {
            n: "01",
            title: "Үлгіні таңдау",
            text: "Каталогтан чемоданды ашып, түс пен өлшемді (55 / 65 / 75) таңдаңыз.",
          },
          {
            n: "02",
            title: "Себетке қосу",
            text: "Бірнеше позицияны жинаңыз — cabin + check-in жиынтығын да жасауға болады.",
          },
          {
            n: "03",
            title: "WhatsApp-қа жіберу",
            text: "Аты, қала, жеткізу түрі (карго / әуе / экспресс) — бір хабарламада.",
          },
          {
            n: "04",
            title: "Kaspi + жеткізу",
            text: "Менеджер растайды, Kaspi төлемі, содан кейін Қазақстан бойынша жібереміз.",
          },
        ]
      : [
          {
            n: "01",
            title: "Выбор модели",
            text: "Откройте каталог, выберите цвет и размер (Cabin 55 / M 65 / Check-in 75).",
          },
          {
            n: "02",
            title: "Корзина",
            text: "Соберите 1–N позиций. Удобно заказать cabin + check-in комплектом.",
          },
          {
            n: "03",
            title: "WhatsApp",
            text: "Имя, город, способ доставки (карго / авиа / экспресс) — одним сообщением.",
          },
          {
            n: "04",
            title: "Kaspi + отправка",
            text: "Менеджер подтверждает заказ, вы оплачиваете Kaspi — отправляем по KZ.",
          },
        ];

  const features =
    locale === "kk"
      ? [
          {
            title: "Aluminium",
            text: "Қатты қабық, тік қырлар, TSA — ұзақ сапарға.",
            image: "/products/alu-cabin-55/silver-front.jpg",
          },
          {
            title: "Hardside",
            text: "Матовый поликарбонат, жеңіл және берік.",
            image: "/products/pc-checkin-75/01-front.jpg",
          },
          {
            title: "Softside",
            text: "Жұмсақ корпус, алдыңғы қалта, ыңғайлы ішкі ұйымдастыру.",
            image: "/products/soft-cabin-55/01-front.jpg",
          },
        ]
      : [
          {
            title: "Aluminium",
            text: "Жёсткий корпус, вертикальные рёбра, TSA — для дальних маршрутов.",
            image: "/products/alu-cabin-55/silver-front.jpg",
          },
          {
            title: "Hardside",
            text: "Матовый поликарбонат: лёгкий, устойчивый к ударам.",
            image: "/products/pc-checkin-75/01-front.jpg",
          },
          {
            title: "Softside",
            text: "Мягкий корпус, передний карман, продуманный интерьер.",
            image: "/products/soft-cabin-55/01-front.jpg",
          },
        ];

  const marquee =
    locale === "kk"
      ? [
          "Danial CN",
          "Premium luggage",
          "Cabin · Check-in",
          "Kaspi",
          "WhatsApp order",
          "Қазақстан",
          "Alu · PC · Soft",
        ]
      : [
          "Danial CN",
          "Premium luggage",
          "Cabin · Check-in",
          "Kaspi",
          "WhatsApp order",
          "Казахстан",
          "Alu · PC · Soft",
        ];

  return (
    <div>
      <HeroCinematic
        brand={t("brand.name")}
        hero={t("home.hero")}
        catalogLabel={t("cta.viewCatalog")}
        aboutLabel={t("nav.about")}
      />

      <TrustBar locale={locale} />
      <MarqueeBar items={marquee} />

      {/* Categories */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
                Shop
              </p>
              <h2 className="mt-2 text-[11px] tracking-[0.28em] uppercase sm:text-sm sm:tracking-[0.2em]">
                {t("home.categories")}
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-[11px] tracking-[0.14em] text-muted uppercase underline-offset-4 hover:underline"
            >
              {t("cta.viewCatalog")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {categories.map((c) => (
              <Link
                key={c.key}
                href={c.href}
                className="group relative aspect-[3/4] overflow-hidden border border-line bg-white"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  quality={95}
                  className="object-contain p-6 transition duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 border-t border-line bg-white/95 px-3 py-3 backdrop-blur-sm">
                  <p className="text-center text-[11px] tracking-[0.2em] uppercase">
                    {t(`category.${c.key}`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Collection */}
      {featured.length > 0 ? (
        <section className="border-t border-line bg-stone py-20 sm:py-24">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
                  Collection
                </p>
                <h2 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
                  {t("home.bestsellers")}
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-[11px] tracking-[0.14em] text-muted uppercase underline-offset-4 hover:underline"
              >
                {t("cta.viewCatalog")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
              {featured.map((p) => {
                const cover = pickCoverUrl(p.images);
                if (!cover) return null;
                const hover = p.images.find((i) => i.url !== cover)?.url;
                return (
                  <ProductCard
                    key={p.id}
                    href={`/catalog/${p.slug}`}
                    brand={p.brand}
                    name={localizedName(p, locale)}
                    priceLabel={formatKzt(p.basePriceKzt)}
                    coverUrl={cover}
                    hoverUrl={hover}
                  />
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      <FeatureStrip
        eyebrow={locale === "kk" ? "Материалдар" : "Материалы"}
        title={
          locale === "kk"
            ? "Әр сапарға — өз формасы"
            : "Свой формат под каждый маршрут"
        }
        features={features}
      />

      <OrderPath
        title={t("home.howTitle")}
        steps={orderSteps}
        cta={t("cta.viewCatalog")}
        locale={locale}
      />

      {/* Why us */}
      <section className="border-t border-line bg-paper py-20 sm:py-24">
        <Container className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-muted uppercase">
              Danial CN
            </p>
            <h2 className="mt-3 text-2xl font-light tracking-tight sm:text-3xl">
              {t("home.whyTitle")}
            </h2>
          </div>
          <ul className="space-y-0">
            {[t("home.why1"), t("home.why2"), t("home.why3"), t("home.why4")].map(
              (item, i) => (
                <li
                  key={item}
                  className="flex gap-5 border-b border-line py-5 first:pt-0"
                >
                  <span className="text-[11px] tracking-[0.2em] text-muted">
                    0{i + 1}
                  </span>
                  <span className="text-sm font-light tracking-tight">
                    {item}
                  </span>
                </li>
              ),
            )}
          </ul>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ink py-20 text-paper sm:py-24">
        <Container className="text-center">
          <p className="text-[11px] tracking-[0.35em] text-paper/45 uppercase">
            Danial CN
          </p>
          <h2 className="mx-auto mt-5 max-w-xl text-2xl font-light tracking-tight sm:text-4xl">
            {t("home.hero")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-paper/55">
            {locale === "kk"
              ? "Каталог → себет → WhatsApp → Kaspi → жеткізу"
              : "Каталог → корзина → WhatsApp → Kaspi → доставка"}
          </p>
          <div className="mt-9">
            <Link href="/catalog">
              <Button className="bg-paper text-ink hover:bg-paper/90">
                {t("cta.viewCatalog")}
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
}
