import { spawn } from "node:child_process";

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
