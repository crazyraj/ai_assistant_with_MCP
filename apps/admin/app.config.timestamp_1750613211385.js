// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
var app_config_default = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  vite: {
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      tailwindcss()
    ]
  }
});
export {
  app_config_default as default
};
