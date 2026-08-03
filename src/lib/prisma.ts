import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { dbKind, tursoConfig } from "@/lib/db-config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDbPath(url: string) {
  let dbPath = url.replace(/^file:/, "");
  if (dbPath.startsWith("./") || dbPath.startsWith(".\\")) {
    dbPath = path.join(process.cwd(), dbPath.slice(2));
  }
  return dbPath;
}

export function createPrismaClient(): PrismaClient {
  const turso = tursoConfig();
  if (turso) {
    return new PrismaClient({ adapter: new PrismaLibSql(turso) });
  }

  // better-sqlite3 is a native binding. It is required lazily on purpose: a
  // Turso deployment must never have to resolve a platform-specific .node file
  // it will not use. A static import would load it on every cold start.
  type SqliteAdapter = typeof import("@prisma/adapter-better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite = require("@prisma/adapter-better-sqlite3") as SqliteAdapter;
  const { PrismaBetterSqlite3 } = sqlite;

  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: resolveDbPath(url) }),
  });
}

function client(): PrismaClient {
  if (dbKind() === "none") {
    throw new Error(
      "Prisma was used without a database configured — check hasDatabase() first.",
    );
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Connects on first use, not on import: a deployment without a database can
 * still render the static storefront without ever constructing a client.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(client(), prop, receiver);
  },
});
