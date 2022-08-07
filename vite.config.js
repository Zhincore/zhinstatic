import { resolve } from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

/** @type {import('vite').UserConfig} */
const config = {
  envPrefix: "ZSTATIC_",
  plugins: [sveltekit(), viteCommonjs()],
  clearScreen: false,
  resolve: {
    alias: {
      $lib: resolve("./src/lib"),
      $comps: resolve("./src/lib/components"),
    },
  },
};

export default config;
