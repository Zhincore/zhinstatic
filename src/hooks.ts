import { parse } from "cookie";
import type { Handle } from "@sveltejs/kit";
import { getPath, streamFileResponse } from "$server/files";
import { getThumbnail } from "$server/thumbnails";
import type { ThumbnailFormat } from "$server/thumbnails";
import { config } from "$lib/config";

const RANGE_RE = /^bytes=(?<start>\d+)-(?<end>\d+)/;

export const handle: Handle = async ({ event, resolve }) => {
  const { headers } = event.request;
  const accept = headers.get("Accept") ?? "*/*";
  const dest = headers.get("Sec-Fetch-Dest") ?? "";
  const { searchParams } = event.url;

  if (
    "path" in event.params &&
    (searchParams.has("file") ||
      (!["empty", "document"].includes(dest) &&
        (!accept.startsWith("text/html") || dest === "iframe") &&
        !accept.startsWith("application/json")))
  ) {
    /// File streaming
    let path = getPath(event.params.path as string);

    if (searchParams.has("size") || searchParams.has("format")) {
      const size = parseInt(searchParams.get("size") ?? "");
      const format = searchParams.get("format") ?? "";
      path = await getThumbnail(path, size, format as ThumbnailFormat);
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

  const cookiesHead = event.request.headers.get("cookie");
  const cookies = cookiesHead ? parse(cookiesHead) : {};
  const darkmode = cookies[config.darkmodeCookie] ? cookies[config.darkmodeCookie] === "true" : undefined;
  event.locals.darkmode = darkmode;

  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%htmlclass%", darkmode ?? true ? "dark" : ""),
  });
};
