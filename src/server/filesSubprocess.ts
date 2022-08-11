import { spawn } from "node:child_process";

export function ffmpegThumbnail(input: string, output: string, size: number, format: string, animated?: boolean) {
  const ffmpeg = spawn("ffmpeg", [
    "-i",
    input,
    "-map",
    "v:0",
    "-v",
    "fatal",
    "-vf",
    `${animated ? "" : "select=gt(scene\\,0.4),"}scale=${size}:${size}:force_original_aspect_ratio=increase`,
    "-pix_fmt",
    "yuv420p",
    ...(animated ? [] : ["frames", "1"]),
    "-vsync",
    "vfr",
    "-r",
    "10",
    "-f",
    format,
    output,
  ]);
  let err = "";
  ffmpeg.stderr.on("data", (d) => (err += String(d)));
  return new Promise<void>((resolve, reject) => {
    ffmpeg.once("error", reject);
    ffmpeg.once("close", (code) => (code === 0 ? resolve() : reject(err)));
  });
}
