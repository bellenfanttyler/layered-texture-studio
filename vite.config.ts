import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { brandDefaults } from "./src/config/brandDefaults";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const productName =
    env.VITE_PRODUCT_NAME?.trim() || brandDefaults.productName;
  const description = brandDefaults.description;
  const primaryColor =
    env.VITE_PRIMARY_COLOR?.trim() || brandDefaults.primaryColor;

  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [
      react(),
      {
        name: "brand-html",
        transformIndexHtml(html) {
          return html
            .replaceAll("__PRODUCT_NAME__", productName)
            .replaceAll("__PRODUCT_DESCRIPTION__", description)
            .replaceAll("__PRIMARY_COLOR__", primaryColor);
        },
      },
    ],
    build: {
      sourcemap: true,
      target: "es2022",
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test/setup.ts",
      css: true,
      exclude: ["e2e/**", "node_modules/**", "dist/**"],
    },
  };
});
