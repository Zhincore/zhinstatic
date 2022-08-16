import { resolve } from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  envPrefix: "ZSTATIC_",
  plugins: [sveltekit()],
  clearScreen: false,
  resolve: {
    alias: {
      $stores: resolve("./src/lib/stores"),
      $elements: resolve("./src/lib/components/elements"),
      $parts: resolve("./src/lib/components/parts"),
      $server: resolve("./src/server"),
    },
  },
};

export default config;
