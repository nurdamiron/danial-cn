/**
 * Creates and updates the tables in Turso.
 *
 * `prisma db push` cannot do this: prisma.config.ts hands the schema engine a
 * `DATABASE_URL`, and the engine's sqlite connector only speaks `file:` — it
 * has no idea what a `libsql://` host is. Pointing db:push at a Turso URL
 * silently writes to the local dev.db instead, which is how production ended
 * up with a schema-less database.
 *
 * So the SQL is generated from the same datamodel (`prisma migrate diff`) and
 * executed over the libSQL protocol, the way the app itself connects.
 *
 * Handles a fresh database (creates everything) and an existing one (adds
 * tables, indexes and columns that the datamodel gained since). It never drops
 * or retypes anything: a renamed or narrowed column still needs a hand-written
 * migration, and this script will leave the old one in place rather than guess.
 */
import "dotenv/config";
import { execFileSync } from "child_process";
import { createClient, type Client } from "@libsql/client";

type TableDef = { name: string; columns: { name: string; def: string }[] };

function schemaSql(): string {
  return execFileSync(
    "npx",
    [
      "prisma",
      "migrate",
      "diff",
      "--from-empty",
      "--to-schema",
      "prisma/schema.prisma",
      "--script",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );
}

/** Statements, comments stripped, in the order the generator emitted them. */
function statements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Pulls the column list back out of a generated CREATE TABLE so missing ones
 * can be added to a table that already exists.
 */
function parseTable(statement: string): TableDef | null {
  const match = statement.match(/^CREATE TABLE "([^"]+)" \(([\s\S]*)\)$/);
  if (!match) return null;

  const columns = match[2]
    .split("\n")
    .map((line) => line.trim().replace(/,$/, ""))
    .filter((line) => line.startsWith('"'))
    .map((def) => ({ name: def.slice(1, def.indexOf('"', 1)), def }));

  return { name: match[1], columns };
}

async function liveColumns(client: Client, table: string): Promise<string[]> {
  const info = await client.execute(`PRAGMA table_info("${table}")`);
  return info.rows.map((r) => String(r.name));
}

async function main() {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Export it (and TURSO_AUTH_TOKEN) first.",
    );
  }

  console.log("pushing schema →", url);
  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
  });

  const sql = schemaSql();
  const created: string[] = [];
  const added: string[] = [];

  for (const statement of statements(sql)) {
    const table = parseTable(statement);

    if (!table) {
      // Indexes and anything else the generator emits.
      await client.execute(
        statement.replace(/^CREATE (UNIQUE )?INDEX "/, 'CREATE $1INDEX IF NOT EXISTS "'),
      );
      continue;
    }

    const existing = await liveColumns(client, table.name);
    if (existing.length === 0) {
      await client.execute(statement);
      created.push(table.name);
      continue;
    }

    // SQLite can only append columns, which is all a Prisma field addition
    // needs. NOT NULL without a default would be rejected — and would mean the
    // datamodel changed in a way that needs a real migration anyway.
    for (const column of table.columns) {
      if (existing.includes(column.name)) continue;
      await client.execute(
        `ALTER TABLE "${table.name}" ADD COLUMN ${column.def}`,
      );
      added.push(`${table.name}.${column.name}`);
    }
  }

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  console.log("tables:", tables.rows.map((r) => r.name).join(", "));
  console.log("created:", created.length ? created.join(", ") : "nothing new");
  console.log("columns added:", added.length ? added.join(", ") : "none");
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
