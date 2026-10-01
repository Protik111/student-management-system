import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient. The `PrismaPg` adapter is Prisma 7's driver adapter
 * for PostgreSQL — it owns a `pg` connection pool internally and is the only
 * way to talk to Postgres from Prisma 7 (no more built-in driver).
 *
 * In Next.js dev, route handlers can be re-instantiated frequently; caching
 * the client on `globalThis` survives hot reloads and prevents the
 * "too many connections" warnings that the `pg` pool throws when many
 * clients open in parallel.
 */
declare global {
  // eslint-disable-next-line no-var
  var __smsPrisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });
}

export const prisma = globalThis.__smsPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__smsPrisma = prisma;
}

export default prisma;