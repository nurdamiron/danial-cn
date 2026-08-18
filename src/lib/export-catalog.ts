import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { isStaticCatalog } from "@/lib/static-catalog";

/**
 * Dump DB catalog + settings to JSON for Vercel static mode.
 * No-op when static catalog is forced (no durable DB).
 */
export async function exportCatalogToStatic(): Promise<{
  products: number;
  settings: boolean;
}> {
  if (isStaticCatalog()) {
    throw new Error(
      "USE_STATIC_CATALOG is on, so the database is not being read and there is nothing new to export",
    );
  }

  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const dataDir = path.join(process.cwd(), "src", "data");
  await fs.mkdir(dataDir, { recursive: true });

  await fs.writeFile(
    path.join(dataDir, "static-products.json"),
    JSON.stringify(products, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(dataDir, "static-settings.json"),
    JSON.stringify(settings, null, 2),
    "utf8",
  );

  return { products: products.length, settings: true };
}
