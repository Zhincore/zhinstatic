import { config } from "$lib/config";

type Config = typeof config;
export interface ServerConfig extends Config {
  checkMagicFor: string[];
  mimeOverride: Record<string, string>;
  thumbnails: Config["thumbnails"] & {
    path: string;
  };
}

export const serverConfig: ServerConfig = {
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
