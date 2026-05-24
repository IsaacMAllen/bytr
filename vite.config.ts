import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite config.
 *
 * - Aliases `@/` to `src/` (shadcn-style).
 * - Proxies `/api/*` to the local m4l-telemetry-api so the browser sees
 *   same-origin requests during dev (avoids CORS round-trip + simplifies
 *   token handling).  Override the API URL via VITE_API_URL.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://127.0.0.1:8080";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: "127.0.0.1",
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
    preview: {
      port: 4173,
      host: "127.0.0.1",
    },
    build: {
      sourcemap: true,
      target: "es2022",
      rollupOptions: {
        output: {
          // Hand-rolled chunk strategy keeps recharts/d3 out of the entry
          // bundle so the dashboard paints faster on first visit.
          manualChunks: {
            recharts: ["recharts"],
            tanstack: ["@tanstack/react-query", "@tanstack/react-table"],
          },
        },
      },
    },
  };
});
