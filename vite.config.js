import { resolve } from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  envPrefix: "ZSTATIC_",
  plugins: [sveltekit()],
  clearScreen: false,
  resolve: {
    alias: {
      $lib: resolve("./src/lib"),
      $comps: resolve("./src/lib/components"),
    },
  },
};

export default config;
