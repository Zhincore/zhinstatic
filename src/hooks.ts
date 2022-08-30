import { parse } from "cookie";
import { error, type Handle } from "@sveltejs/kit";
import { prerendering } from "$app/environment";
import { getPath, streamFileResponse } from "$server/files";
import { getThumbnail } from "$server/thumbnails";
import type { ThumbnailFormat } from "$server/thumbnails";
import { config } from "$lib/config";

const RANGE_RE = /^bytes=(?<start>\d+)?-(?<end>\d+)?/;

export const handle: Handle = async ({ event, resolve }) => {
  if (!prerendering) {
    const { headers } = event.request;
    const accept = headers.get("Accept") ?? "*/*";
    const dest = event.request.destination || headers.get("sec-fetch-dest") || "empty";
    const searchParams = event.url.searchParams || new URLSearchParams();

    if (
      "path" in event.params &&
      (searchParams.has("file") ||
        (!["document", "script"].includes(dest) &&
          (dest === "iframe" || !accept.startsWith("text/html")) &&
          !accept.startsWith("application/json")))
    ) {
      /// File streaming
      const abort = event.request.signal;
      let path = getPath(event.params.path as string);

      if (searchParams.has("size") || searchParams.has("format")) {
        const size = parseInt(searchParams.get("size") ?? "");
        const format = searchParams.get("format") ?? "";
        const thumbnail = await getThumbnail(path, size, format as ThumbnailFormat, undefined, abort);
        if (!thumbnail) throw error(404, "Failed to generate thumbnail");
        path = thumbnail;
      }

      let start: number | undefined;
      let end: number | undefined;
      if (headers.has("Range")) {
        const match = (headers.get("Range") ?? "").match(RANGE_RE);
        start = parseInt(match?.groups?.start ?? "") || undefined;
        end = parseInt(match?.groups?.end ?? "") || undefined;
      }

      const response = await streamFileResponse(path, undefined, start, end);
      if (response) return response;
    }
  }

  const cookiesHead = event.request.headers.get("cookie");
  const cookies = cookiesHead ? parse(cookiesHead) : {};
  const darkmode = cookies[config.darkmodeCookie] ? cookies[config.darkmodeCookie] === "true" : undefined;
  event.locals.darkmode = darkmode;

  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%htmlclass%", darkmode ?? true ? "dark" : ""),
  });
};
