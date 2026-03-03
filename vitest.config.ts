/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/",
        "src/test/**",
        "src/vite-env.d.ts",
        "**/*.d.ts",
        "src/main.tsx",
        "src/assets/**",
        "src/api/http.ts", // HTTP wrapper - not critical to test
        "src/domain/orderStatus.ts", // Constants and enums - simple mappings
      ],
      // ── Quality gates ─────────────────────────────────
      // Tests fail if coverage drops below these thresholds
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
