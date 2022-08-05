import fs from "node:fs";
import { Readable } from "node:stream";
import type { Handle } from "@sveltejs/kit";
import { getPath, getFile } from "$lib/files";

export const handle: Handle = async ({ event, resolve }) => {
  const accept = event.request.headers.get("Accept");
  if (
    "path" in event.params &&
    !event.request.headers.has("X-Sveltekit-Load") &&
    (!accept || !accept.startsWith("text/html"))
  ) {
    const path = getPath(event.params.path);

    const stat = await fs.promises.stat(path);
    if (stat.isFile()) {
      const info = await getFile(path, stat);
      const stream = fs.createReadStream(path);
      stream.on("error", (error) => {
        if (!["EPIPE", "AbortError"].includes(error.name)) throw error;
      });
      return new Response(Readable.toWeb(stream), {
        headers: {
          "Content-Type": info.mime ?? "application/octet-stream",
          "Content-Length": stat.size + "",
        },
      });
    }
  }

  return resolve(event);
};
