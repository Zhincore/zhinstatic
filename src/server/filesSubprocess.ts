import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { cpus } from "node:os";
import exitHook from "exit-hook";

const ffmpegs = new Set<ChildProcess>();

// Failsafe
exitHook(() => {
  for (const ffmpeg of ffmpegs) {
    ffmpeg.kill(9);
  }
});

export function ffmpegThumbnail(input: string, output: string, size: number) {
  const ffmpeg = spawn("ffmpeg", [
    "-v",
    "error",
    "-threads",
    "" + cpus().length,
    "-i",
    input,
    "-map",
    "v:0",
    "-vf",
    `select=gt(scene\\,0.4),scale=${size}:${size}:force_original_aspect_ratio=increase`,
    "-frames",
    "1",
    output,
  ]);
  ffmpegs.add(ffmpeg);

  let err = "";
  ffmpeg.stderr.on("data", (d) => (err += String(d)));

  return new Promise<void>((resolve, reject) => {
    ffmpeg.once("exit", (code) => {
      ffmpegs.delete(ffmpeg);

      if (!code) return resolve();
      reject(new SubprocessError("FFmpeg exitted with non-null exit code.", err));
    });
  });
}

class SubprocessError extends Error {
  constructor(message: string, readonly output?: string) {
    super(message);
  }

  toString() {
    return super.toString() + JSON.stringify({ output: this.output });
  }
}
