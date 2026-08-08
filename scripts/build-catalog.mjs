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
};

const SIZES = {
  55: { ru: "Ручная кладь 55 см", kk: "Қол жүгі 55 см" },
  65: { ru: "Средний 65 см", kk: "Орташа 65 см" },
  75: { ru: "Большой 75 см", kk: "Үлкен 75 см" },
  set3: { ru: "Набор из 3 предметов", kk: "3 заттан тұратын жинақ" },
  set4: { ru: "Набор из 4 предметов", kk: "4 заттан тұратын жинақ" },
  "40l": { ru: "Объём 40 л", kk: "Көлемі 40 л" },
  "55l": { ru: "Объём 55 л", kk: "Көлемі 55 л" },
};

export const SIZE_ORDER = ["55", "65", "75", "set3", "set4", "40l", "55l"];

const PRODUCTS = [
  {
    slug: "aluma-cabin-55",
    brandKey: "aluma",
    category: "cabin",
    featured: true,
    nameRu: "Aluma Cabin 55",
    nameKk: "Aluma Cabin 55",
    descriptionRu:
      "Цельный алюминиевый корпус с вертикальными рёбрами. Он не боится ударов и красиво стареет, поэтому с каждой поездкой чемодан обретает свой характер, а не теряет вид. Кодовый замок и четыре бесшумных колеса держат вещи в порядке в любом аэропорту.",
    descriptionKk:
      "Тік қырлары бар тұтас алюминий корпус. Ол соққыға төзімді және жылдар бойы әдемі ескіреді, сондықтан әр сапар сайын чемодан өз мінезін алады. Кодты құлып пен төрт үнсіз дөңгелек жүгіңізді кез келген әуежайда ретте ұстайды.",
    materialRu: "Анодированный алюминий",
    materialKk: "Анодталған алюминий",
    wheelsRu: "4 колеса, поворот 360",
    wheelsKk: "4 дөңгелек, 360 бұрылыс",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { heightCm: 55, widthCm: 40, depthCm: 23, volumeL: 38, weightKg: 4.2 },
    colors: ["silver", "graphite", "champagne"],
    sizes: [
      ["55", 189000],
      ["65", 219000],
      ["75", 249000],
    ],
  },
  {
    slug: "aluma-trunk-75",
    brandKey: "aluma",
    category: "checkin",
    featured: true,
    nameRu: "Aluma Trunk 75",
    nameKk: "Aluma Trunk 75",
    descriptionRu:
      "Большой алюминиевый чемодан для долгих маршрутов. Усиленные углы и рамочный замок держат форму даже после жёсткой погрузки, а внутри два отделения с ремнями, чтобы вещи не смещались за перелёт.",
    descriptionKk:
      "Ұзақ бағыттарға арналған үлкен алюминий чемодан. Күшейтілген бұрыштар мен рамалық құлып қатты тиеуден кейін де пішінін сақтайды, ал ішінде белдіктері бар екі бөлім бар, сондықтан заттар ұшу кезінде жылжымайды.",
    materialRu: "Анодированный алюминий",
    materialKk: "Анодталған алюминий",
    wheelsRu: "4 колеса, поворот 360",
    wheelsKk: "4 дөңгелек, 360 бұрылыс",
    lockRu: "Рамочный замок",
    lockKk: "Рамалық құлып",
    dims: { heightCm: 75, widthCm: 52, depthCm: 30, volumeL: 96, weightKg: 6.1 },
    colors: ["champagne", "graphite"],
    sizes: [
      ["65", 259000],
      ["75", 289000],
    ],
  },
  {
    slug: "orbit-cabin-55",
    brandKey: "orbit",
    category: "cabin",
    featured: true,
    nameRu: "Orbit Cabin 55",
    nameKk: "Orbit Cabin 55",
    descriptionRu:
      "Семь цветов и лёгкий ребристый поликарбонат. Корпус пружинит на ударе и возвращает форму, а вес позволяет спокойно проходить с ним в салон на большинстве рейсов по Казахстану.",
    descriptionKk:
      "Жеті түс және жеңіл қырлы поликарбонат. Корпус соққыда серпіліп, пішінін қалпына келтіреді, ал салмағы Қазақстан бойынша көптеген рейстерде салонға еркін өтуге мүмкіндік береді.",
    materialRu: "Поликарбонат",
    materialKk: "Поликарбонат",
    wheelsRu: "4 колеса, поворот 360",
    wheelsKk: "4 дөңгелек, 360 бұрылыс",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { heightCm: 55, widthCm: 38, depthCm: 22, volumeL: 36, weightKg: 2.9 },
    colors: ["azure", "crimson", "amber", "black", "olive", "graphite", "blush"],
    sizes: [
      ["55", 99000],
      ["65", 129000],
      ["75", 149000],
    ],
  },
  {
    slug: "orbit-set-3",
    brandKey: "orbit",
    category: "set",
    featured: true,
    nameRu: "Orbit Set",
    nameKk: "Orbit Set",
    descriptionRu:
      "Ручная кладь, средний и большой чемодан в одной отделке. Меньшие вкладываются в больший, поэтому набор занимает мало места дома и сразу закрывает и короткие выезды, и переезд на месяц.",
    descriptionKk:
      "Қол жүгі, орташа және үлкен чемодан бірдей әрлеуде. Кішілері үлкеніне салынады, сондықтан жинақ үйде аз орын алады және қысқа сапарды да, бір айлық көшуді де бірден жабады.",
    materialRu: "Поликарбонат",
    materialKk: "Поликарбонат",
    wheelsRu: "4 колеса на каждом",
    wheelsKk: "Әрқайсысында 4 дөңгелек",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { volumeL: 175, weightKg: 11.4 },
    colors: ["cream", "blush"],
    sizes: [
      ["set3", 269000],
      ["set4", 319000],
    ],
  },
  {
    slug: "vecta-cabin-55",
    brandKey: "vecta",
    category: "cabin",
    featured: true,
    nameRu: "Vecta Cabin 55",
    nameKk: "Vecta Cabin 55",
    descriptionRu:
      "Гранёный корпус, утопленный замок и алюминиевая рама по периметру. Внутри жёсткая перегородка с ремнями и сетчатый карман, так что рубашки доезжают без заломов.",
    descriptionKk:
      "Қырлы корпус, батырылған құлып және периметр бойынша алюминий рама. Ішінде белдіктері бар қатты бөлгіш пен торлы қалта бар, сондықтан жейделер мыжылмай жетеді.",
    materialRu: "Поликарбонат и алюминиевая рама",
    materialKk: "Поликарбонат және алюминий рама",
    wheelsRu: "4 колеса, поворот 360",
    wheelsKk: "4 дөңгелек, 360 бұрылыс",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { heightCm: 55, widthCm: 39, depthCm: 23, volumeL: 39, weightKg: 3.6 },
    colors: ["graphite"],
    sizes: [
      ["55", 139000],
      ["65", 169000],
      ["75", 199000],
    ],
  },
  {
    slug: "vecta-set-3",
    brandKey: "vecta",
    category: "set",
    nameRu: "Vecta Set",
    nameKk: "Vecta Set",
    descriptionRu:
      "Три размера линейки Vecta одной отделки. Один набор закрывает командировку на пару дней, отпуск на две недели и переезд, и всё это выглядит как один комплект, а не случайная сборка.",
    descriptionKk:
      "Vecta желісінің үш өлшемі бірдей әрлеуде. Бір жинақ бірнеше күндік іссапарды, екі апталық демалысты және көшуді жабады, әрі бәрі кездейсоқ жиынтық емес, бір комплект болып көрінеді.",
    materialRu: "Поликарбонат и алюминиевая рама",
    materialKk: "Поликарбонат және алюминий рама",
    wheelsRu: "4 колеса на каждом",
    wheelsKk: "Әрқайсысында 4 дөңгелек",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { volumeL: 182, weightKg: 12.2 },
    colors: ["graphite"],
    sizes: [["set3", 349000]],
  },
  {
    slug: "strata-checkin-75",
    brandKey: "strata",
    category: "checkin",
    featured: true,
    nameRu: "Strata Check In 75",
    nameKk: "Strata Check In 75",
    descriptionRu:
      "Матовый поликарбонат, который не собирает отпечатки и царапины видно куда меньше, чем на глянце. Расширительная молния добавляет пять сантиметров объёма на обратную дорогу.",
    descriptionKk:
      "Күңгірт поликарбонат саусақ іздерін жинамайды, ал сызаттар жылтырға қарағанда әлдеқайда аз көрінеді. Кеңейтетін сыдырма кері жолға бес сантиметр көлем қосады.",
    materialRu: "Матовый поликарбонат",
    materialKk: "Күңгірт поликарбонат",
    wheelsRu: "4 колеса, поворот 360",
    wheelsKk: "4 дөңгелек, 360 бұрылыс",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { heightCm: 75, widthCm: 50, depthCm: 30, volumeL: 95, weightKg: 4.5 },
    colors: ["black", "navy", "sage"],
    sizes: [
      ["65", 129000],
      ["75", 149000],
    ],
  },
  {
    slug: "nomad-cabin-55",
    brandKey: "nomad",
    category: "cabin",
    nameRu: "Nomad Cabin 55",
    nameKk: "Nomad Cabin 55",
    descriptionRu:
      "Мягкий корпус из плотного нейлона с передним карманом под ноутбук и документы. Он прощает перегруз, слегка растягивается и легче жёстких моделей того же объёма.",
    descriptionKk:
      "Ноутбук пен құжаттарға арналған алдыңғы қалтасы бар тығыз нейлоннан жасалған жұмсақ корпус. Ол артық жүкті кешіреді, аздап созылады және сол көлемдегі қатты модельдерден жеңілірек.",
    materialRu: "Нейлон 900D",
    materialKk: "Нейлон 900D",
    wheelsRu: "4 колеса, поворот 360",
    wheelsKk: "4 дөңгелек, 360 бұрылыс",
    lockRu: "Кодовый замок",
    lockKk: "Кодты құлып",
    dims: { heightCm: 55, widthCm: 40, depthCm: 23, volumeL: 41, weightKg: 3.1 },
    colors: ["navy", "black", "grey"],
    sizes: [
      ["55", 89000],
      ["65", 109000],
    ],
  },
  {
    slug: "atlas-weekender",
    brandKey: "atlas",
    category: "bag",
    featured: true,
    nameRu: "Atlas Weekender",
    nameKk: "Atlas Weekender",
    descriptionRu:
      "Кожаная сумка на выходные с широким входом и съёмным плечевым ремнём. Кожа мнётся и темнеет со временем, и именно поэтому через год она выглядит лучше, чем в день покупки.",
    descriptionKk:
      "Кең кіреберісі және алынбалы иық белдігі бар демалыс күндеріне арналған былғары сөмке. Былғары уақыт өте мыжылып, қараяды, сондықтан бір жылдан кейін ол сатып алған күнгіден әдемірек көрінеді.",
    materialRu: "Натуральная кожа",
    materialKk: "Табиғи былғары",
    wheelsRu: "Без колёс",
    wheelsKk: "Дөңгелексіз",
    lockRu: "Молния",
    lockKk: "Сыдырма",
    dims: { heightCm: 30, widthCm: 52, depthCm: 26, volumeL: 40, weightKg: 1.8 },
    colors: ["cognac"],
    sizes: [["40l", 79000]],
  },
  {
    slug: "atlas-holdall",
    brandKey: "atlas",
    category: "bag",
    nameRu: "Atlas Holdall",
    nameKk: "Atlas Holdall",
    descriptionRu:
      "Большая кожаная сумка на пять дней. Дно усилено, ручки прошиты в четыре ряда, а лямка снимается, если сумку удобнее нести в руке.",
    descriptionKk:
      "Бес күнге арналған үлкен былғары сөмке. Түбі күшейтілген, тұтқалары төрт қатар тігілген, ал белдік сөмкені қолмен алып жүру ыңғайлы болса, шешіледі.",
    materialRu: "Натуральная кожа",
    materialKk: "Табиғи былғары",
    wheelsRu: "Без колёс",
    wheelsKk: "Дөңгелексіз",
    lockRu: "Молния",
    lockKk: "Сыдырма",
    dims: { heightCm: 34, widthCm: 58, depthCm: 28, volumeL: 55, weightKg: 2.2 },
    colors: ["chestnut"],
    sizes: [["55l", 94000]],
  },
];

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
    brand: brand.name,
    brandKey: brand.key,
    brandTaglineRu: brand.taglineRu,
    brandTaglineKk: brand.taglineKk,
    nameRu: p.nameRu,
    nameKk: p.nameKk,
    descriptionRu: p.descriptionRu,
    descriptionKk: p.descriptionKk,
    materialRu: p.materialRu,
    materialKk: p.materialKk,
    wheelsRu: p.wheelsRu,
    wheelsKk: p.wheelsKk,
    lockRu: p.lockRu,
    lockKk: p.lockKk,
    category: p.category,
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
