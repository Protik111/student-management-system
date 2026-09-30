import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config. We use the `node` environment because the actions we're
 * testing are server-only. `pool: "forks"` ensures each test file runs in
 * its own process so multiple SQLite clients don't open conflicting
 * connections to the same file. Path alias `@/*` mirrors the project's
 * tsconfig.
 *
 * The `server-only` package throws when imported outside Next.js's bundler
 * context; we alias it to a no-op stub so the test process can load
 * server actions without the bundler runtime.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 20_000,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
  },
});