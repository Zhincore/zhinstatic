import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import Path from "node:path";
import Sharp, { format as sharpFormat } from "sharp";
import type { FormatEnum } from "sharp";
import { config } from "$lib/config";
import { HTTPError } from "$server/HTTPError";
import { getFile } from "$server/files";
import { ffmpegThumbnail } from "./filesSubprocess";

type Formats = typeof config.thumbnails.formats[number];

export async function getThumbnail(path: string, width: number, format: Formats) {
  if (!config.thumbnails.formats.includes(format)) throw new HTTPError(400, "Unsupported output format");
  if (!config.thumbnails.widths.includes(width)) throw new HTTPError(400, "Unsupported output width");

  const outputPath = Path.join(config.thumbnails.path, width + "", encodeURIComponent(path) + "." + format);
  if (existsSync(outputPath)) return outputPath;

  const info = await getFile(path);
  const [type, inFormat] = info.mime?.split("/") ?? [];
  if (!info.mime || !["video", "image"].includes(type)) throw new HTTPError(400, "Unsupported source format");

  const animated = config.thumbnails.animatedMimes.includes(info.mime);
  const sharpInSupport = !!sharpFormat[inFormat as keyof FormatEnum]?.input.file;
  const sharpOutSupport = !!sharpFormat[format as keyof FormatEnum]?.output.file;

  if (animated || !sharpInSupport || !sharpOutSupport) {
    try {
      await ffmpegThumbnail(path, outputPath, width, format, animated);
    } catch (error) {
      if ((error as Record<string, string>)?.code === "ENOENT") return; // FFmpeg not found
      throw error;
    }
  }

  return outputPath;
}
