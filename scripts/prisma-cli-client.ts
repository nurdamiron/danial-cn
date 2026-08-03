import "dotenv/config";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Prisma client for CLI scripts (seed, export).
 *
 * Mirrors src/lib/prisma.ts so `npm run db:seed` and `npm run export:static`
 * hit whichever database the app itself would use — the local SQLite file, or
 * Turso when TURSO_DATABASE_URL is set.
 */
export function cliPrisma(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();

  if (tursoUrl) {
    type LibSqlAdapter = typeof import("@prisma/adapter-libsql");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const libsql = require("@prisma/adapter-libsql") as LibSqlAdapter;
    return new PrismaClient({
      adapter: new libsql.PrismaLibSql({
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
      }),
    });
  }

  type SqliteAdapter = typeof import("@prisma/adapter-better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite = require("@prisma/adapter-better-sqlite3") as SqliteAdapter;
  const { PrismaBetterSqlite3 } = sqlite;

  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  let dbPath = url.replace(/^file:/, "");
  if (dbPath.startsWith("./") || dbPath.startsWith(".\\")) {
    dbPath = path.join(process.cwd(), dbPath.slice(2));
  }
  return new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbPath }),
  });
}

/** Where the CLI is pointed — printed so a seed never lands in a surprise DB. */
export function cliTarget(): string {
  const turso = process.env.TURSO_DATABASE_URL?.trim();
  return turso ? `Turso (${turso})` : process.env.DATABASE_URL ?? "file:./prisma/dev.db";
}
