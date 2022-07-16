import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  envPrefix: "ZSTATIC_",
  plugins: [sveltekit()],
  clearScreen: false,
};

export default config;
