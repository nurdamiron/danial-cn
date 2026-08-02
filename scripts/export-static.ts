import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

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
