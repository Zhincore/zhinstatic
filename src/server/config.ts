import { config } from "$lib/config";

export const serverConfig = {
  ...config,

  checkMagicFor: ["application/octet-stream"],

  mimeOverride: {
    ".ts": "text/x.typescript",
    ".svelte": "text/x.svelte+xml",
  },

  thumbnails: {
    ...config.thumbnails,
    path: "cache/thumbnails",
  },
};
