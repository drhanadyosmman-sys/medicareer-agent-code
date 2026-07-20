import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
    env: {
      // Session signing refuses to run without a key; give the suite a fixed one.
      JWT_SECRET: "test-only-secret-not-used-anywhere-else",
      VITE_APP_ID: "medicareer-agent-test",
      ADMIN_EMAILS: "owner@example.com, Second.Admin@Example.com",
    },
  },
});
