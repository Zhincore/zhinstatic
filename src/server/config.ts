import { config } from "$lib/config";

export const serverConfig = {
  ...config,

  checkMagicFor: ["application/octet-stream"],

  thumbnails: {
    ...config.thumbnails,
    path: "cache/thumbnails",
  },
};
