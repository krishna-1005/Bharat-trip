// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import tsconfigPaths from "vite-tsconfig-paths";
var app_config_default = defineConfig({
  vite: {
    plugins: [
      tsconfigPaths()
    ]
  },
  server: {
    preset: "static"
  },
  ssr: false
});
export {
  app_config_default as default
};
