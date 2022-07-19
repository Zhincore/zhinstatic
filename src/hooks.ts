import fs from "node:fs";
import { Readable } from "node:stream";
import type { Handle } from "@sveltejs/kit";
import { getPath, getFile } from "$lib/files";
import { probeFile } from "$lib/filesSubprocess";

export const handle: Handle = async ({ event, resolve }) => {
  const accept = event.request.headers.get("Accept");
  if (
    "path" in event.params &&
    !event.request.headers.has("X-Sveltekit-Load") &&
    (!accept || !accept.startsWith("text/html"))
  ) {
    const path = getPath(event.params.path);

    const file = await getFile(path);
    if (file.stat.isFile()) {
      const stream = fs.createReadStream(path);
      stream.on("error", (error) => {
        if (!["EPIPE", "AbortError"].includes(error.name)) throw error;
      });
      return new Response(Readable.toWeb(stream), {
        headers: {
          "Content-Type": await probeFile(path),
          "Content-Length": file.stat.size + "",
        },
      });
    }
  }

  return resolve(event);
};
