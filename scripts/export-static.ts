import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: dbPath }),
});

async function main() {
  const products = await prisma.product.findMany({
    include: {
      images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] },
      variants: true,
    },
    orderBy: { sortOrder: "asc" },
  });
  const out = path.join(process.cwd(), "src", "data", "static-products.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(products, null, 2));
  console.log("wrote", out, "count", products.length);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
