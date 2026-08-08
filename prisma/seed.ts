/**
 * Seeds the database from src/data/static-products.json, the same file the
 * deployed static catalog reads, so both modes always show the same shop.
 *
 * Photos are real files already committed under public/products. Nothing here
 * draws placeholder artwork; a product whose photo is missing fails the seed
 * rather than shipping a stand-in.
 */
import "dotenv/config";
import path from "path";
import fs from "fs/promises";
import { cliPrisma, cliTarget } from "../scripts/prisma-cli-client";
import catalog from "../src/data/static-products.json";

const prisma = cliPrisma();
console.log("seeding →", cliTarget());

async function ensureAdmin() {
  const { hashPassword } = await import("../src/lib/password");
  const email = (
    process.env.ADMIN_EMAIL || "admin@danial.cn"
  ).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "danial-admin";
  const name = process.env.ADMIN_NAME || "Admin";

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (existingAdmin) {
    console.log("admin exists:", existingAdmin.email);
    return;
  }

  const byEmail = await prisma.user.findUnique({ where: { email } });
  if (byEmail) {
    await prisma.user.update({
      where: { id: byEmail.id },
      data: { role: "ADMIN" },
    });
    console.log("promoted to admin:", email);
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      phone: "",
      role: "ADMIN",
    },
  });
  console.log("seeded admin:", email);
}

async function assertPhotoExists(url: string) {
  const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await fs.access(abs);
  } catch {
    throw new Error(
      `Missing photo ${url}. Add the file under public/products, then rerun node scripts/build-catalog.mjs`,
    );
  }
}

async function main() {
  const wa =
    process.env.NEXT_PUBLIC_WHATSAPP_E164?.replace(/\D/g, "") || "77066316449";
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { whatsappE164: wa },
    create: { id: 1, whatsappE164: wa },
  });

  await ensureAdmin();

  for (const p of catalog) {
    await Promise.all(p.images.map((i) => assertPhotoExists(i.url)));

    // Replace rather than skip, so editing the catalog and reseeding is enough
    // to move the shop forward.
    await prisma.product.deleteMany({ where: { slug: p.slug } });
    await prisma.product.create({
      data: {
        id: p.id,
        slug: p.slug,
        brand: p.brand,
        nameRu: p.nameRu,
        nameKk: p.nameKk,
        descriptionRu: p.descriptionRu,
        descriptionKk: p.descriptionKk,
        materialRu: p.materialRu,
        materialKk: p.materialKk,
        category: p.category,
        basePriceKzt: p.basePriceKzt,
        heightCm: p.heightCm,
        widthCm: p.widthCm,
        depthCm: p.depthCm,
        volumeL: p.volumeL,
        weightKg: p.weightKg,
        wheels: p.wheels,
        lockType: p.lockType,
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
    console.log("seeded", p.slug);
  }

  const [products, images, variants] = await Promise.all([
    prisma.product.count(),
    prisma.productImage.count(),
    prisma.productVariant.count(),
  ]);
  console.log(`${products} products, ${images} photos, ${variants} variants`);
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
