/**
 * Loads src/data/static-products.json into the database.
 *
 * Run once when the catalogue moves from the committed file to the database,
 * and again after a restore. It is idempotent: products are matched by slug
 * and rewritten, so running it twice leaves the same rows rather than
 * duplicates.
 *
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run catalog:import
 */
import "dotenv/config";
import { cliPrisma, cliTarget } from "./prisma-cli-client";
import catalog from "../src/data/static-products.json";

const prisma = cliPrisma();

async function main() {
  console.log("importing catalogue →", cliTarget());

  for (const p of catalog) {
    const data = {
      slug: p.slug,
      brand: p.brand,
      brandRu: p.brandRu ?? "",
      brandKk: p.brandKk ?? "",
      taglineRu: p.taglineRu ?? "",
      taglineKk: p.taglineKk ?? "",
      nameRu: p.nameRu,
      nameKk: p.nameKk,
      descriptionRu: p.descriptionRu ?? "",
      descriptionKk: p.descriptionKk ?? "",
      materialRu: p.materialRu ?? "",
      materialKk: p.materialKk ?? "",
      category: p.category,
      basePriceKzt: p.basePriceKzt,
      heightCm: p.heightCm ?? null,
      widthCm: p.widthCm ?? null,
      depthCm: p.depthCm ?? null,
      volumeL: p.volumeL ?? null,
      weightKg: p.weightKg ?? null,
      wheels: p.wheels ?? null,
      lockType: p.lockType ?? null,
      isReplica: p.isReplica ?? true,
      status: p.status,
      featured: p.featured,
      sortOrder: p.sortOrder,
    };

    // Children are replaced wholesale: the file is the source being imported,
    // so a variant or photo it no longer lists should not survive.
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: data,
      create: { id: p.id, ...data },
    });
    const product = await prisma.product.findUniqueOrThrow({
      where: { slug: p.slug },
      select: { id: true },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });

    for (const v of p.variants) {
      await prisma.productVariant.create({
        data: {
          id: v.id,
          productId: product.id,
          sku: v.sku,
          colorKey: v.colorKey,
          colorLabelRu: v.colorLabelRu,
          colorLabelKk: v.colorLabelKk,
          colorHex: v.colorHex ?? "#888888",
          sizeKey: v.sizeKey,
          sizeLabelRu: v.sizeLabelRu,
          sizeLabelKk: v.sizeLabelKk,
          priceKzt: v.priceKzt ?? null,
          stock: v.stock ?? 0,
        },
      });
    }

    for (const i of p.images) {
      await prisma.productImage.create({
        data: {
          id: i.id,
          productId: product.id,
          variantId: null,
          colorKey: i.colorKey ?? null,
          url: i.url,
          sortOrder: i.sortOrder,
          isCover: i.isCover,
          width: i.width ?? null,
          height: i.height ?? null,
        },
      });
    }

    console.log(`  ${p.slug}: ${p.variants.length} вариантов, ${p.images.length} фото`);
  }

  const [products, variants, images] = await Promise.all([
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
  ]);
  console.log(`готово: ${products} товаров, ${variants} вариантов, ${images} фото`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
