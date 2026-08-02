import "dotenv/config";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import products from "../src/data/static-products.json";

function resolveDbPath(url: string) {
  let dbPath = url.replace(/^file:/, "");
  if (dbPath.startsWith("./") || dbPath.startsWith(".\\")) {
    dbPath = path.join(process.cwd(), dbPath.slice(2));
  }
  return dbPath;
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: resolveDbPath(process.env.DATABASE_URL ?? "file:./prisma/dev.db"),
  }),
});

async function main() {
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        nameRu: p.nameRu,
        nameKk: p.nameKk,
        descriptionRu: p.descriptionRu || "",
        descriptionKk: p.descriptionKk || "",
        materialRu: p.materialRu || "",
        materialKk: p.materialKk || "",
        category: p.category || "cabin",
        basePriceKzt: p.basePriceKzt,
        heightCm: p.heightCm ?? null,
        widthCm: p.widthCm ?? null,
        depthCm: p.depthCm ?? null,
        volumeL: p.volumeL ?? null,
        weightKg: p.weightKg ?? null,
        wheels: p.wheels ?? null,
        lockType: p.lockType ?? null,
        isReplica: p.isReplica !== false,
        status: p.status || "active",
        featured: !!p.featured,
        sortOrder: p.sortOrder || 0,
        variants: {
          create: p.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            colorKey: v.colorKey,
            colorLabelRu: v.colorLabelRu,
            colorLabelKk: v.colorLabelKk,
            colorHex: v.colorHex || "#888888",
            sizeKey: v.sizeKey,
            sizeLabelRu: v.sizeLabelRu,
            sizeLabelKk: v.sizeLabelKk,
            priceKzt: v.priceKzt ?? null,
            stock: v.stock ?? 0,
          })),
        },
        images: {
          create: p.images.map((im, i) => ({
            id: im.id,
            url: im.url,
            colorKey: im.colorKey || null,
            sortOrder: im.sortOrder ?? i,
            isCover: !!im.isCover,
            width: im.width ?? null,
            height: im.height ?? null,
          })),
        },
      },
    });
    console.log("seeded", p.brand, p.slug);
  }

  console.log("total", await prisma.product.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
