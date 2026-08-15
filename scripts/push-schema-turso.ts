/**
 * Creates the tables in Turso.
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
 * Idempotent for missing tables and indexes; it does not alter tables that
 * already exist. A column change still needs a real migration.
 */
import "dotenv/config";
import { execFileSync } from "child_process";
import { createClient } from "@libsql/client";

function schemaSql(): string {
  const sql = execFileSync(
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

  // The generated script assumes an empty database. Re-running it on a partly
  // seeded one should top up what is missing, not abort on the first table.
  return sql
    .replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "')
    .replace(/CREATE (UNIQUE )?INDEX "/g, "CREATE $1INDEX IF NOT EXISTS \"");
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

  // Comments go first: every statement is preceded by a `-- CreateTable`
  // line, so splitting before stripping them leaves each chunk starting with
  // a comment.
  const statements = schemaSql()
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.execute(statement);
  }

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  console.log(
    "tables:",
    tables.rows.map((r) => r.name).join(", "),
  );
  client.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
