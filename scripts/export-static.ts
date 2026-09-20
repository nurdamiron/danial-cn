import "dotenv/config";
import path from "path";
import fs from "fs";
import { cliPrisma, cliTarget } from "./prisma-cli-client";

// Mirrors isStaticCatalog(); read from the environment directly because this
// script runs outside Next and does not resolve the "@/" alias that module
// uses. Without this the build's prebuild step overwrote the committed
// catalogue with whatever the database held — which is precisely the file
// static mode is there to serve.
if (
  process.env.USE_STATIC_CATALOG === "1" ||
  process.env.NEXT_PUBLIC_USE_STATIC_CATALOG === "1"
) {
  console.log("USE_STATIC_CATALOG is on — keeping the committed catalogue");
  process.exit(0);
}

const prisma = cliPrisma();
console.log("exporting from →", cliTarget());

async function main() {
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
  fs.mkdirSync(dataDir, { recursive: true });

  const productsOut = path.join(dataDir, "static-products.json");
  const settingsOut = path.join(dataDir, "static-settings.json");

  fs.writeFileSync(productsOut, JSON.stringify(products, null, 2));
  fs.writeFileSync(settingsOut, JSON.stringify(settings, null, 2));

  console.log("wrote", productsOut, "count", products.length);
  console.log("wrote", settingsOut);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
