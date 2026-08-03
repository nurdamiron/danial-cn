/**
 * Where the user/session data lives.
 *
 * The product catalogue is served from static JSON (fast, no queries), but
 * accounts need a durable store. Locally that is the SQLite file; in
 * production it is Turso, which speaks the same SQLite dialect — so the Prisma
 * schema, the queries and the seed script are identical in both places.
 */

export type DbKind = "turso" | "file" | "none";

function tursoUrl(): string | undefined {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  return url || undefined;
}

export function dbKind(): DbKind {
  if (tursoUrl()) return "turso";

  // A bare SQLite file is only durable where the filesystem is:
  // serverless deployments reset it on every cold start.
  const serverless =
    process.env.VERCEL === "1" || process.env.VERCEL === "true";
  if (serverless) return "none";

  return "file";
}

/**
 * True when accounts can actually be read and written. Auth routes check this
 * instead of guessing from the hosting platform.
 */
export function hasDatabase(): boolean {
  return dbKind() !== "none";
}

export function tursoConfig(): { url: string; authToken?: string } | null {
  const url = tursoUrl();
  if (!url) return null;
  return {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
  };
}

/** Message shown when a request needs accounts and none are configured. */
export const NO_DATABASE_ERROR =
  "База данных не настроена. Добавьте TURSO_DATABASE_URL и TURSO_AUTH_TOKEN.";
