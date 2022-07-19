import { cpus } from "os";
import { spawn } from "child_process";
import Limiter from "p-limit";

const limit = Limiter(cpus().length);

export async function probeFile(path: string) {
  return limit(() => probeMime(path));
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
