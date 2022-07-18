import { cpus } from "os";
import { spawn } from "child_process";
import Limiter from "p-limit";

const limit = Limiter(cpus().length);

export type MediaInfo = { width: number; height: number; length?: number };
export type ProbeResult = Partial<MediaInfo> & { mime: string };

export async function probeFile(path: string): Promise<ProbeResult> {
  const mime = await limit(() => probeMime(path));
  const [type] = mime.split("/");
  let media: MediaInfo | Record<string, never> = {};

  if (["video", "image"].includes(type)) {
    media = await limit(() => probeMedia(path, type === "video").catch(() => ({})));
  }

  return { mime, ...media };
}

/**
 * probeMime
 */
export function probeMime(path: string): Promise<string> {
  let output = "";
  const file = spawn("file", ["-biLnNp", path]);

  file.stderr.on("data", (d) => console.log(d.toString()));
  file.stdout.on("data", (data) => (output += data.toString("utf-8")));
  return new Promise((resolve, reject) =>
    file.on("close", (code) => {
      output = output.split(";")[0].trim();
      if (code !== 0 || !output) return reject("Mime probing failed");

      resolve(output);
    }),
  );
}

/**
 * probeMedia
 */
export function probeMedia(path: string, video: boolean): Promise<MediaInfo> {
  let output = "";
  const ffprobe = spawn("ffprobe", [
    "-v",
    "fatal",
    "-select_streams",
    "v:0",
    "-print_format",
    "json",
    "-show_format",
    "-show_entries",
    "stream=width,height",
    path,
  ]);

  ffprobe.stderr.on("data", (d) => console.log(d.toString()));
  ffprobe.stdout.on("data", (data) => (output += data.toString("utf-8")));
  return new Promise((resolve, reject) =>
    ffprobe.on("close", (code) => {
      const data = JSON.parse(output.trim());
      if (code !== 0 || !("streams" in data) || !data.streams.length) return reject(new Error("Failed to probe media"));

      const [stream] = data.streams;
      resolve({
        width: stream.width,
        height: stream.height,
        length: video ? parseFloat(data.format.duration) : undefined,
      });
    }),
  );
}

/**
 * generatePoster
 */
export function generatePoster(path: string, size: number, sizing: "increase" | "decrease") {
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    path,
    "-map",
    "v:0",
    "-v",
    "fatal",
    "-vf",
    `select=gt(scene\\,0.4),scale=${size}:${size}:force_original_aspect_ratio=${sizing}`,
    "-pix_fmt",
    "yuv420p",
    "-frames",
    "1",
    "-vsync",
    "vfr",
    "-y",
    "-",
  ]);
  ffmpeg.stderr.on("data", (d) => console.log(d.toString()));
  return ffmpeg.stdout;
}
