import bytes from "bytes";
import { config } from "$lib/config";

type Config = typeof config;
export interface ServerConfig extends Config {
  checkMagicFor: string[];
  mimeOverride: Record<string, string>;
  thumbnails: Config["thumbnails"] & {
    path: string;
    minSize: number;
    maxSize: number;
    maxPixels: number;
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
    minSize: bytes("1kb"),
    maxSize: bytes("10mb"),
    maxPixels: 4*8 * 1024**2,
  },
};
