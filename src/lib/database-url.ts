import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

/** Load `.env`, then optional `.env.production.local` when seeding/migrating prod from a laptop. */
export function loadDatabaseEnvFiles(): void {
  config();
  const prodPath = resolve(process.cwd(), ".env.production.local");
  if (existsSync(prodPath)) {
    config({ path: prodPath, override: true });
  }
  clearEmptyDatabaseEnvVars();
}

/** Pulled Vercel env files often set `POSTGRES_URL=""`, which blocks fallbacks. */
function clearEmptyDatabaseEnvVars(): void {
  for (const key of [
    "DATABASE_URL",
    "POSTGRES_URL",
    "PRISMA_DATABASE_URL",
  ] as const) {
    if (process.env[key]?.trim() === "") {
      delete process.env[key];
    }
  }
}

/** Same precedence as Vercel Prisma Postgres: DATABASE_URL, then direct POSTGRES_URL. */
export function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.PRISMA_DATABASE_URL?.trim() ||
    ""
  );
}
