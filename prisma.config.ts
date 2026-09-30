/**
 * Prisma 7 configuration. Replaces the inline `datasource url = env(...)` block
 * that used to live in schema.prisma. The CLI reads this for `migrate`,
 * `db push`, `generate`, and `studio`.
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
