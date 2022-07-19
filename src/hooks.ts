import fs from "fs";
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
      return new Response(
        new ReadableStream({
          start(controller) {
            stream.on("data", (d) => controller.enqueue(d));
            stream.on("close", () => controller.close());
          },
          cancel() {
            stream.close();
          },
        }),
        {
          headers: {
            "Content-Type": await probeFile(path),
            "Content-Length": file.stat.size + "",
          },
        },
      );
    }
  }

  return resolve(event);
};
