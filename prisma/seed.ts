import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

function resolveDbPath(url: string) {
  let dbPath = url.replace(/^file:/, "");
  if (dbPath.startsWith("./") || dbPath.startsWith(".\\")) {
    dbPath = path.join(process.cwd(), dbPath.slice(2));
  }
  return dbPath;
}

const adapter = new PrismaBetterSqlite3({
  url: resolveDbPath(process.env.DATABASE_URL ?? "file:./prisma/dev.db"),
});
const prisma = new PrismaClient({ adapter });

async function ensurePlaceholder(
  productId: string,
  label: string,
  color: string,
) {
  const dir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "products",
    productId,
  );
  await fs.mkdir(dir, { recursive: true });
  const filename = "cover.webp";
  const abs = path.join(dir, filename);
  const svg = `
    <svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f3f3"/>
      <rect x="350" y="250" width="500" height="900" rx="24" fill="${color}" stroke="#111" stroke-width="4"/>
      <text x="600" y="1500" text-anchor="middle" font-family="Arial" font-size="36" fill="#111">${label}</text>
      <text x="600" y="1550" text-anchor="middle" font-family="Arial" font-size="22" fill="#666">1:1 replica · Danial CN</text>
    </svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(abs);
  return `/uploads/products/${productId}/${filename}`;
}

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const samples = [
    {
      slug: "alu-cabin-55",
      brand: "Alu Line",
      nameRu: "Cabin 55",
      nameKk: "Cabin 55",
      descriptionRu:
        "Реплика 1:1 cabin-чемодана. Алюминиевый вид, 4 колеса, TSA-замок. Не оригинальный бренд.",
      descriptionKk:
        "1:1 cabin чемодан көшірмесі. Алюминий көрініс, 4 дөңгелек, TSA құлып. Түпнұсқа бренд емес.",
      materialRu: "Алюминий-look / PC",
      materialKk: "Алюминий-look / PC",
      category: "cabin",
      basePriceKzt: 89000,
      heightCm: 55,
      widthCm: 40,
      depthCm: 23,
      volumeL: 38,
      weightKg: 3.8,
      wheels: "4 spinner",
      lockType: "TSA",
      color: "#c0c0c0",
      colorKey: "silver",
      colorRu: "Серебро",
      colorKk: "Күміс",
    },
    {
      slug: "pc-checkin-75",
      brand: "Travel Pro",
      nameRu: "Check-in 75",
      nameKk: "Check-in 75",
      descriptionRu:
        "Реплика 1:1 большого чемодана 75 см. Поликарбонат, расширяемый. Не оригинал.",
      descriptionKk:
        "75 см үлкен чемоданның 1:1 көшірмесі. Поликарбонат, кеңейтілетін. Түпнұсқа емес.",
      materialRu: "Поликарбонат",
      materialKk: "Поликарбонат",
      category: "checkin",
      basePriceKzt: 129000,
      heightCm: 75,
      widthCm: 50,
      depthCm: 30,
      volumeL: 95,
      weightKg: 4.5,
      wheels: "4 spinner",
      lockType: "TSA",
      color: "#111111",
      colorKey: "black",
      colorRu: "Чёрный",
      colorKk: "Қара",
    },
    {
      slug: "soft-cabin-set",
      brand: "Soft Move",
      nameRu: "Cabin Soft 55",
      nameKk: "Cabin Soft 55",
      descriptionRu:
        "Мягкий cabin-чемодан, копия 1:1. Лёгкий, с наружным карманом.",
      descriptionKk:
        "Жұмсақ cabin чемодан, 1:1 көшірме. Жеңіл, сыртқы қалтамен.",
      materialRu: "Полиэстер",
      materialKk: "Полиэстер",
      category: "cabin",
      basePriceKzt: 69000,
      heightCm: 55,
      widthCm: 36,
      depthCm: 22,
      volumeL: 42,
      weightKg: 2.6,
      wheels: "4 spinner",
      lockType: "TSA",
      color: "#2f4f4f",
      colorKey: "navy",
      colorRu: "Тёмно-синий",
      colorKk: "Қара-көк",
    },
  ];

  for (const s of samples) {
    const existing = await prisma.product.findUnique({
      where: { slug: s.slug },
    });
    if (existing) {
      console.log("skip existing", s.slug);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        slug: s.slug,
        brand: s.brand,
        nameRu: s.nameRu,
        nameKk: s.nameKk,
        descriptionRu: s.descriptionRu,
        descriptionKk: s.descriptionKk,
        materialRu: s.materialRu,
        materialKk: s.materialKk,
        category: s.category,
        basePriceKzt: s.basePriceKzt,
        heightCm: s.heightCm,
        widthCm: s.widthCm,
        depthCm: s.depthCm,
        volumeL: s.volumeL,
        weightKg: s.weightKg,
        wheels: s.wheels,
        lockType: s.lockType,
        status: "draft",
        featured: true,
        isReplica: true,
        variants: {
          create: {
            sku: `${s.slug}-${s.colorKey}`,
            colorKey: s.colorKey,
            colorLabelRu: s.colorRu,
            colorLabelKk: s.colorKk,
            sizeKey: String(s.heightCm),
            sizeLabelRu: `${s.heightCm} см`,
            sizeLabelKk: `${s.heightCm} см`,
            stock: 10,
          },
        },
      },
    });

    const url = await ensurePlaceholder(product.id, s.nameRu, s.color);
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url,
        isCover: true,
        sortOrder: 0,
        width: 1200,
        height: 1600,
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { status: "active" },
    });

    console.log("seeded", s.slug);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
