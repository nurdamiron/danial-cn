/**
 * Seeds the local sqlite database from src/data/static-products.json, the same
 * file the deployed static catalog reads. Photos are real files already under
 * public/products, so nothing here draws placeholder artwork.
 */
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import catalog from "../src/data/static-products.json";

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

async function assertPhotoExists(url: string) {
  const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await fs.access(abs);
  } catch {
    throw new Error(
      `Missing photo ${url}. Run node scripts/build-catalog.mjs after adding files to public/products.`,
    );
  }
}

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  for (const p of catalog) {
    await Promise.all(p.images.map((i) => assertPhotoExists(i.url)));

    await prisma.product.deleteMany({ where: { slug: p.slug } });
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        brandKey: p.brandKey,
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
        basePriceKzt: p.basePriceKzt,
        heightCm: p.heightCm,
        widthCm: p.widthCm,
        depthCm: p.depthCm,
        volumeL: p.volumeL,
        weightKg: p.weightKg,
        isReplica: p.isReplica,
        status: p.status,
        featured: p.featured,
        sortOrder: p.sortOrder,
        variants: {
          create: p.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            colorKey: v.colorKey,
            colorLabelRu: v.colorLabelRu,
            colorLabelKk: v.colorLabelKk,
            colorHex: v.colorHex,
            sizeKey: v.sizeKey,
            sizeLabelRu: v.sizeLabelRu,
            sizeLabelKk: v.sizeLabelKk,
            priceKzt: v.priceKzt,
            stock: v.stock,
          })),
        },
        images: {
          create: p.images.map((i) => ({
            id: i.id,
            colorKey: i.colorKey,
            url: i.url,
            sortOrder: i.sortOrder,
            isCover: i.isCover,
            width: i.width,
            height: i.height,
          })),
        },
      },
    });
  }

  const products = await prisma.product.count();
  const images = await prisma.productImage.count();
  const variants = await prisma.productVariant.count();
  console.log(`Seeded ${products} products, ${images} photos, ${variants} variants`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
