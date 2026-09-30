import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient. The `PrismaBetterSqlite3` adapter is the only way
 * to connect to SQLite in Prisma 7 (no more built-in driver).
 *
 * In Next.js dev, route handlers can be re-instantiated frequently; caching
 * the client on `globalThis` survives hot reloads and prevents the
 * "too many connections" warnings SQLite throws when you open many clients.
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
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
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