import { resolve } from "node:path";
import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  envPrefix: "ZSTATIC_",
  plugins: [sveltekit()],
  clearScreen: false,
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
  resolve: {
    alias: {
      $stores: resolve("./src/lib/stores"),
      $elements: resolve("./src/lib/components/elements"),
      $parts: resolve("./src/lib/components/parts"),
      $server: resolve("./src/server"),
    },
  },
});
