import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import * as schema from "./schema";

// `server-only` throws when imported in plain Node (e.g. the seed CLI). Only
// enforce it when running inside Next.js — detected via NEXT_RUNTIME which is
// injected by the Next bundler and absent in CLI scripts.
if (process.env.NEXT_RUNTIME) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("server-only");
}

const DB_PATH = process.env.DATABASE_PATH || "./data/sms.db";

// Ensure the data directory exists. For production (Docker), DATABASE_PATH will
// point at /app/data/sms.db which is mounted as a named volume.
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

/**
 * Singleton drizzle client. In Next.js dev, route handlers can be re-instantiated
 * frequently; the module-level `sqlite` instance survives hot reloads because
 * Next caches it on `globalThis` in development.
 */
declare global {
  // eslint-disable-next-line no-var
  var __smsDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
  // eslint-disable-next-line no-var
  var __smsSqlite: Database.Database | undefined;
}

const client =
  globalThis.__smsSqlite ??
  (() => {
    if (process.env.NODE_ENV !== "production") {
      globalThis.__smsSqlite = sqlite;
    }
    return sqlite;
  })();

export const db =
  globalThis.__smsDb ??
  drizzle(client, { schema, logger: process.env.NODE_ENV === "development" });

if (process.env.NODE_ENV !== "production") {
  globalThis.__smsDb = db;
}

export { schema };
