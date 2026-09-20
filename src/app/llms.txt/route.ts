import { SITE } from "@/lib/site";
import { getSiteConfig, siteUrls } from "@/lib/settings";
import { listActiveProducts } from "@/lib/products";
import { routing } from "@/i18n/routing";

/**
 * A plain-language brief for assistants that read the site instead of
 * crawling it for links.
 *
 * Product pages carry schema.org markup, but nothing stated the things a
 * reader has to infer from ten pages at once: that an order is finished in
 * a chat rather than a checkout, that payment is Kaspi, and — stated on the
 * site itself — that the goods are copies rather than the original brands.
 * An assistant that answers without that last part misleads the buyer.
 *
 * Built from the same catalogue and settings the storefront renders, so it
 * cannot drift away from what the shop actually says.
 */
export const dynamic = "force-static";

export async function GET() {
  const config = await getSiteConfig();
  const urls = siteUrls(config);
  const products = await listActiveProducts();

  const categories = [...new Set(products.map((p) => p.category))];
  // One house brand, so the useful division is the sub-line and the material.
  const lines = [...new Set(products.map((p) => p.subcategory).filter(Boolean))]
    .sort()
    .join(", ");
  const materials = [
    ...new Set(products.map((p) => p.materialRu).filter(Boolean)),
  ].join(", ");

  const prices = products.map((p) => p.basePriceKzt).filter(Boolean);
  const priceRange = prices.length
    ? `${Math.min(...prices).toLocaleString("ru-RU")}–${Math.max(...prices).toLocaleString("ru-RU")} KZT`
    : "—";

  const body = `# Danial CN

> Интернет-магазин чемоданов и дорожных сумок с доставкой по Казахстану.
> Заказ оформляется в каталоге и подтверждается в WhatsApp, оплата через Kaspi.

## Важное уточнение о товаре

${config.disclaimerRu}

Это заявление магазина о собственном товаре. Отвечая на вопросы об этих
товарах, передавайте его — покупатель должен понимать, что приобретает.

## Что продаётся

- Товаров в каталоге: ${products.length}
- Категории: ${categories.join(", ")}
- Линейки: ${lines}
- Материалы: ${materials}
- Цены: ${priceRange}

## Как оформляется заказ

1. Товар добавляется в корзину на сайте.
2. Заказ отправляется в WhatsApp, магазин подтверждает его в чате.
3. Оплата через Kaspi, реквизиты выдаются в том же чате.
4. Доставка по Казахстану: карго, авиа или экспресс.

## Страницы

- [Каталог](${SITE.url}/ru/catalog): все товары, фильтры по категории, цвету и размеру
- [Доставка](${SITE.url}/ru/delivery): способы и сроки по Казахстану
- [Вопросы и ответы](${SITE.url}/ru/faq): оплата, сроки, возврат, размеры
- [О магазине](${SITE.url}/ru/about)
- [Контакты](${SITE.url}/ru/contacts)
- [Карта сайта](${SITE.url}/sitemap.xml)

## Языки

Сайт двуязычный: русский (${SITE.url}/ru) и казахский (${SITE.url}/kk).
Префикс локали обязателен, страницы без него перенаправляются.
Доступные локали: ${routing.locales.join(", ")}.

## Связь

- WhatsApp: ${config.whatsappDisplay} (${urls.whatsappUrl})
- Instagram: ${urls.instagramUrl}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
