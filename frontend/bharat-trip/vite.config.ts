import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import {
  getSitemapRoutes,
  SITE_URL,
  type SEORouteConfig,
} from "./src/seo/seo-routes";

/**
 * Custom Vite plugin to generate sitemap.xml at build time.
 * Reads routes from src/seo/seo-routes.ts (single source of truth).
 * When you add a new route to seo-routes.ts with includeInSitemap: true,
 * it will automatically appear in sitemap.xml on next build.
 */
function generateSitemapPlugin(): Plugin {
  return {
    name: "generate-sitemap",
    apply: "build",
    generateBundle() {
      const routes = getSitemapRoutes();
      const today = new Date().toISOString().split("T")[0];

      const urls = routes
        .map(
          (route: SEORouteConfig) => `  <url>
    <loc>${SITE_URL}${route.path === "/" ? "" : route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`
        )
        .join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: sitemap,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), generateSitemapPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
