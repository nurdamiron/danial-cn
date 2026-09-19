/**
 * Builds src/data/static-products.json from the definitions below.
 *
 * Colourways are matched to files that actually exist, so a product can never
 * advertise a colour we have no photo of. Filenames follow
 * public/products/<slug>/<colorKey>-<n>.jpg and the first file of the first
 * colourway becomes the cover.
 *
 * Run `node scripts/build-catalog.mjs` after adding photos or editing copy.
 */
import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const ROOT = process.cwd();
const PHOTOS = path.join(ROOT, "public", "products");
const OUT = path.join(ROOT, "src", "data", "static-products.json");

export const BRANDS = [
  { key: "aluma", name: "ALUMA", taglineRu: "Анодированный алюминий", taglineKk: "Анодталған алюминий" },
  { key: "orbit", name: "ORBIT", taglineRu: "Поликарбонат в цвете", taglineKk: "Түрлі түсті поликарбонат" },
  { key: "vecta", name: "VECTA", taglineRu: "Техничный жёсткий корпус", taglineKk: "Техникалық қатты корпус" },
  { key: "strata", name: "STRATA", taglineRu: "Матовый поликарбонат", taglineKk: "Күңгірт поликарбонат" },
  { key: "nomad", name: "NOMAD", taglineRu: "Мягкий нейлон", taglineKk: "Жұмсақ нейлон" },
  { key: "atlas", name: "ATLAS", taglineRu: "Кожаные дорожные сумки", taglineKk: "Былғары жол сөмкелері" },
  { key: "mono", name: "MONO", taglineRu: "Монограмма на корпусе", taglineKk: "Корпустағы монограмма" },
];

const COLORS = {
  silver: { hex: "#C3C7CB", ru: "Серебро", kk: "Күміс" },
  graphite: { hex: "#33363A", ru: "Графит", kk: "Графит" },
  champagne: { hex: "#C4A57B", ru: "Шампань", kk: "Шампан" },
  azure: { hex: "#1F6FB2", ru: "Лазурный", kk: "Көгілдір" },
  crimson: { hex: "#B8323C", ru: "Красный", kk: "Қызыл" },
  amber: { hex: "#E1782A", ru: "Оранжевый", kk: "Қызғылт сары" },
  black: { hex: "#1A1A1A", ru: "Чёрный", kk: "Қара" },
  olive: { hex: "#5D6650", ru: "Олива", kk: "Зәйтүн" },
  blush: { hex: "#E5A9B8", ru: "Пудровый", kk: "Опалы қызғылт" },
  navy: { hex: "#26344B", ru: "Тёмно синий", kk: "Қою көк" },
  sage: { hex: "#7C8B77", ru: "Шалфей", kk: "Ақжелкен" },
  grey: { hex: "#8A8D91", ru: "Серый", kk: "Сұр" },
  cream: { hex: "#E2D8C6", ru: "Кремовый", kk: "Кілегей" },
  cognac: { hex: "#9A5B31", ru: "Коньяк", kk: "Коньяк" },
  chestnut: { hex: "#7A4A2B", ru: "Каштан", kk: "Каштан" },
  forest: { hex: "#234B36", ru: "Тёмно зелёный", kk: "Қою жасыл" },
  lavender: { hex: "#B0A0D8", ru: "Лавандовый", kk: "Лаванда" },
  sky: { hex: "#8FBEDD", ru: "Небесно голубой", kk: "Ашық көк" },
  taupe: { hex: "#8B8079", ru: "Мокко", kk: "Мокко" },
  clear: { hex: "#D7DCE0", ru: "Прозрачный", kk: "Мөлдір" },
  green: { hex: "#3C7A4E", ru: "Зелёный", kk: "Жасыл" },
  titanium: { hex: "#8E9296", ru: "Титан", kk: "Титан" },
  beige: { hex: "#D8C9AE", ru: "Бежевый", kk: "Бозғылт" },
  magenta: { hex: "#9B3D7A", ru: "Пурпурный", kk: "Күрең қызыл" },
  white: { hex: "#EDEDED", ru: "Белый", kk: "Ақ" },
  burgundy: { hex: "#6E1F2A", ru: "Бордовый", kk: "Бордо" },
};

const SIZES = {
  55: { ru: "Ручная кладь 55 см", kk: "Қол жүгі 55 см" },
  65: { ru: "Средний 65 см", kk: "Орташа 65 см" },
  75: { ru: "Большой 75 см", kk: "Үлкен 75 см" },
  85: { ru: "Очень большой 85 см", kk: "Өте үлкен 85 см" },
  set3: { ru: "Набор из 3 предметов", kk: "3 заттан тұратын жинақ" },
  set4: { ru: "Набор из 4 предметов", kk: "4 заттан тұратын жинақ" },
  "40l": { ru: "Объём 40 л", kk: "Көлемі 40 л" },
  "55l": { ru: "Объём 55 л", kk: "Көлемі 55 л" },
  standard: { ru: "Стандартный размер", kk: "Стандартты өлшем" },
};

export const SIZE_ORDER = ["55", "65", "75", "85", "set3", "set4", "40l", "55l", "standard"];

// The one hand-curated entry left: a promotional bundle (buy the cabin +
// checkin 65 + checkin 75 together, cheaper than the three separately),
// matching the shop's own WhatsApp price list. Everything else in the
// catalogue comes from rimo_products, so this is deliberately the exception.
const PRODUCTS = [
  {
    slug: "orbit-essential-set-3",
    brandKey: "orbit",
    category: "set",
    featured: true,
    nameRu: "Essential Набор из 3 чемоданов",
    nameKk: "Essential 3 чемодан жинағы",
    descriptionRu:
      "Ручная кладь, средний и большой чемодан Essential одной отделки. Комплектом выгоднее, чем покупать каждый размер отдельно — закрывает и короткую поездку, и переезд на месяц.",
    descriptionKk:
      "Essential сериясының қол жүгі, орташа және үлкен чемоданы бір әрлеуде. Жинақпен әр өлшемді бөлек алғаннан тиімдірек — қысқа сапарды да, бір айлық көшуді де жабады.",
    materialRu: "Поликарбонат",
    materialKk: "Поликарбонат",
    wheelsRu: "4 колеса на каждом",
    wheelsKk: "Әрқайсысында 4 дөңгелек",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { volumeL: 197, weightKg: 11.5 },
    colors: ["black", "green", "grey"],
    sizes: [["set3", 175000]],
  },
];

// Extra catalogue entries generated from size/material reference data.
// Names, copy, and photos are original to this store — see
// rimo_products/data/generate_derived.py for how they were produced.
const GENERATED_PRODUCTS_PATH =
  "/Users/nurdauletakhmatov/rimo_products/data/generated_products.json";
try {
  const generated = JSON.parse(await fs.readFile(GENERATED_PRODUCTS_PATH, "utf8"));
  PRODUCTS.push(...generated);
  console.log(`  + ${generated.length} generated products from ${GENERATED_PRODUCTS_PATH}`);
} catch (e) {
  console.warn(`  no generated products loaded (${e.message})`);
}

const brandByKey = Object.fromEntries(BRANDS.map((b) => [b.key, b]));
const STAMP = "2026-08-08T00:00:00.000Z";

async function imagesFor(slug, colors) {
  const dir = path.join(PHOTOS, slug);
  let files;
  try {
    files = (await fs.readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch {
    throw new Error(`no photo folder for ${slug}`);
  }

  const out = [];
  for (const colorKey of colors) {
    const own = files.filter((f) => f.startsWith(`${colorKey}-`));
    if (!own.length) throw new Error(`${slug} declares colour "${colorKey}" with no photo`);
    for (const file of own) {
      const meta = await sharp(path.join(dir, file)).metadata();
      out.push({
        id: `${slug}-${file.replace(/\.\w+$/, "")}`,
        productId: `prod-${slug}`,
        variantId: null,
        colorKey,
        url: `/products/${slug}/${file}`,
        sortOrder: out.length,
        isCover: out.length === 0,
        width: meta.width ?? null,
        height: meta.height ?? null,
        createdAt: STAMP,
      });
    }
  }

  const orphans = files.filter((f) => !colors.some((c) => f.startsWith(`${c}-`)));
  if (orphans.length) {
    console.warn(`  warn ${slug} has unused photos: ${orphans.join(", ")}`);
  }
  return out;
}

const catalog = [];
let order = 0;
for (const p of PRODUCTS) {
  const brand = brandByKey[p.brandKey];
  if (!brand) throw new Error(`unknown brand ${p.brandKey}`);

  const images = await imagesFor(p.slug, p.colors);
  const variants = [];
  for (const colorKey of p.colors) {
    const c = COLORS[colorKey];
    if (!c) throw new Error(`unknown colour ${colorKey}`);
    for (const [sizeKey, priceKzt] of p.sizes) {
      const s = SIZES[sizeKey];
      if (!s) throw new Error(`unknown size ${sizeKey}`);
      variants.push({
        id: `${p.slug}-${colorKey}-${sizeKey}`,
        productId: `prod-${p.slug}`,
        sku: `${p.slug}-${colorKey}-${sizeKey}`.toUpperCase(),
        colorKey,
        colorLabelRu: c.ru,
        colorLabelKk: c.kk,
        colorHex: c.hex,
        sizeKey,
        sizeLabelRu: s.ru,
        sizeLabelKk: s.kk,
        priceKzt,
        stock: 4 + ((p.slug.length + colorKey.length + sizeKey.length) % 7),
      });
    }
  }

  catalog.push({
    id: `prod-${p.slug}`,
    slug: p.slug,
    // The storefront prints one house name everywhere; brand.name (ALUMA,
    // ORBIT...) still decides the material tagline and pricing tier below.
    brand: "RIMO",
    brandRu: "RIMO",
    brandKk: "RIMO",
    taglineRu: brand.taglineRu,
    taglineKk: brand.taglineKk,
    nameRu: p.nameRu,
    nameKk: p.nameKk,
    descriptionRu: p.descriptionRu,
    descriptionKk: p.descriptionKk,
    materialRu: p.materialRu,
    materialKk: p.materialKk,
    wheels: p.wheelsRu,
    lockType: p.lockRu,
    category: p.category,
    subcategory: p.subcategory ?? "",
    basePriceKzt: Math.min(...p.sizes.map(([, price]) => price)),
    heightCm: p.dims.heightCm ?? null,
    widthCm: p.dims.widthCm ?? null,
    depthCm: p.dims.depthCm ?? null,
    volumeL: p.dims.volumeL ?? null,
    weightKg: p.dims.weightKg ?? null,
    isReplica: true,
    status: "active",
    featured: Boolean(p.featured),
    sortOrder: order++,
    createdAt: STAMP,
    updatedAt: STAMP,
    images,
    variants,
  });
}

await fs.writeFile(OUT, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(
  `wrote ${path.relative(ROOT, OUT)} with ${catalog.length} products, ` +
    `${catalog.reduce((n, p) => n + p.images.length, 0)} photos, ` +
    `${catalog.reduce((n, p) => n + p.variants.length, 0)} variants`,
);
