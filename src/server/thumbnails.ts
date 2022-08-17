import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import Path from "node:path";
import { cpus } from "node:os";
import Sharp from "sharp";
import type { FormatEnum } from "sharp";
import Limit from "p-limit";
import { error } from "@sveltejs/kit";
import { getFile } from "$server/files";
import type { FileInfo } from "$server/files";
import { serverConfig } from "./config";
import { ffmpegThumbnail } from "./filesSubprocess";

export type ThumbnailFormat = typeof serverConfig.thumbnails.formats[number];

const limit = Limit(Math.max(1, Math.floor(cpus().length * (2 / 3))));

export async function getThumbnail(path: string, size: number, format: ThumbnailFormat, info?: FileInfo) {
  if (!serverConfig.thumbnails.formats.includes(format)) throw error(400, "Unsupported output format");
  if (!serverConfig.thumbnails.widths.includes(size)) throw error(400, "Unsupported output width");

  const outputDir = Path.join(serverConfig.thumbnails.path, size + "");
  const outputPath = Path.join(outputDir, encodeFilename(path) + "." + format);
  if (existsSync(outputPath)) return outputPath;

  if (!info) info = await getFile(path);
  const [type, inFormat] = info.mime?.split("/") ?? [];
  if (!info.mime || !["video", "image"].includes(type)) throw error(400, "Unsupported source format");
  if (serverConfig.thumbnails.keepMimes.includes(info.mime)) return path;

  // AVIF is regarded as HEIF in sharp
  const mapFormat = (fmt: string) => ({ avif: "heif" }[fmt] ?? fmt);
  const sharpInSupport = Sharp.format[mapFormat(inFormat) as keyof FormatEnum]?.input.file;
  const sharpOutSupport = Sharp.format[mapFormat(format) as keyof FormatEnum]?.output.file;
  const animated = serverConfig.thumbnails.animatedMimes.includes(info.mime);

  await fs.mkdir(outputDir, { recursive: true });

  return limit(async () => {
    let inputPath = path;

    if (!sharpInSupport || !sharpOutSupport) {
      // Convert unsupported files first
      inputPath = Path.join(serverConfig.thumbnails.path, encodeFilename(path) + ".png");
      try {
        await ffmpegThumbnail(path, inputPath, Math.max(...serverConfig.thumbnails.widths));
      } catch (error) {
        if ((error as Record<string, string>)?.code === "ENOENT") return path; // FFmpeg not found
        throw error;
      }
    }

    await Sharp(inputPath, { animated, pages: format === "avif" ? 1 : -1 })
      .rotate()
      .resize(size, size, { fit: "inside", withoutEnlargement: true })
      .toFormat(format, { mozjpeg: true })
      .toFile(outputPath);

    return outputPath;
  }).catch((err) => {
    // TODO: Error handling?
    if (process.env.NODE_ENV != "production") console.error(err);
    return path;
  });
}

function encodeFilename(path: string) {
  return path.replace(/\/|%/g, "-").replace(/-{2,}/g, "-").replace(/^-/, "");
}
