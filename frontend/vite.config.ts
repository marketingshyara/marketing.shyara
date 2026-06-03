import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { sampleStaticMiddlewarePlugin } from "./src/plugins/sampleStaticMiddleware";

// https://vitejs.dev/config/
const frontendPort = Number(process.env.FRONTEND_PORT ?? 8080);
const backendUrl = process.env.VITE_BACKEND_URL ?? "http://localhost:4000";

export default defineConfig({
  server: {
    host: "localhost",
    port: frontendPort,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), sampleStaticMiddlewarePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // e2e/ holds Playwright specs which import "@playwright/test"; vitest must not load them.
    exclude: ["node_modules", "dist", "e2e/**", "**/*.e2e.spec.*"],
  },
  ssr: {
    format: "esm",
    noExternal: ["react-helmet-async"],
  },
});
