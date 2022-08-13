import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import Path from "node:path";
import { cpus } from "node:os";
import Sharp, { format as sharpFormat } from "sharp";
import type { FormatEnum } from "sharp";
import Limit from "p-limit";
import { HTTPError } from "$server/HTTPError";
import { getFile } from "$server/files";
import { serverConfig } from "./config";
import { ffmpegThumbnail } from "./filesSubprocess";

export type ThumbnailFormat = typeof serverConfig.thumbnails.formats[number];

const limit = Limit(cpus().length);

export async function getThumbnail(path: string, width: number, format: ThumbnailFormat) {
  if (!serverConfig.thumbnails.formats.includes(format)) throw new HTTPError(400, "Unsupported output format");
  if (!serverConfig.thumbnails.widths.includes(width)) throw new HTTPError(400, "Unsupported output width");

  const outputDir = Path.join(serverConfig.thumbnails.path, width + "");
  const outputPath = Path.join(outputDir, encodeURIComponent(path) + "." + format);
  if (existsSync(outputPath)) return outputPath;

  const info = await getFile(path);
  const [type, inFormat] = info.mime?.split("/") ?? [];
  if (!info.mime || !["video", "image"].includes(type)) throw new HTTPError(400, "Unsupported source format");
  if (serverConfig.thumbnails.keepMimes.includes(info.mime)) return path;

  // AVIF is regarded as HEIF in sharp
  const mapFormat = (fmt: string) => ({ avif: "heif" }[fmt] ?? fmt);
  const sharpInSupport = sharpFormat[mapFormat(inFormat) as keyof FormatEnum]?.input.file;
  const sharpOutSupport = sharpFormat[mapFormat(format) as keyof FormatEnum]?.output.file;
  const animated = serverConfig.thumbnails.animatedMimes.includes(info.mime);

  await fs.mkdir(outputDir, { recursive: true });

  return limit(async () => {
    let inputPath = path;

    if (!sharpInSupport || !sharpOutSupport) {
      // Convert unsupported files first
      inputPath = Path.join(serverConfig.thumbnails.path, encodeURIComponent(path) + ".png");
      try {
        await ffmpegThumbnail(path, inputPath, Math.max(...serverConfig.thumbnails.widths));
      } catch (error) {
        if ((error as Record<string, string>)?.code === "ENOENT") return path; // FFmpeg not found
        throw error;
      }
    }

    await Sharp(inputPath, { animated, pages: format === "avif" ? 1 : -1 })
      .rotate()
      .resize(width, width, { fit: "outside", withoutEnlargement: true })
      .toFormat(format, { mozjpeg: true })
      .toFile(outputPath);

    return outputPath;
  }).catch(() => path); // TODO: Error handling?
}
