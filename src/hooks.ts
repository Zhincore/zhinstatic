import fs from "node:fs";
import { Readable } from "node:stream";
import { parse } from "cookie";
import type { Handle, GetSession, RequestEvent } from "@sveltejs/kit";
import { getPath, getFile } from "$lib/files";

const DARKMODE_COOKIE = "zhinstatic-darkmode";

export const handle: Handle = async ({ event, resolve }) => {
  /// File streaming
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

  return resolve(event, {
    transformPage: ({ html }) => html.replace("%htmlclass%", isDarkmode(event) ?? true ? "dark" : ""),
  });
};

export const getSession: GetSession = async (event) => ({
  darkmode: isDarkmode(event),
});

function isDarkmode(event: RequestEvent) {
  const cookiesHead = event.request.headers.get("cookie");
  const cookies = cookiesHead ? parse(cookiesHead) : {};
  return cookies[DARKMODE_COOKIE] ? cookies[DARKMODE_COOKIE] === "true" : undefined;
}
