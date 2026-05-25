/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "node:path";

/* ============================================================================
 *  Vitest config.
 *
 *  Defaults to the `node` environment because the vast majority of our
 *  load-bearing logic is pure functions, drizzle queries, and pure-server
 *  modules. The handful of files that need DOM APIs can opt-in per file via
 *  the magic `// @vitest-environment happy-dom` comment at the top of the
 *  test file.
 * ==========================================================================*/

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts", "src/lib/**/*.tsx"],
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
