import { parse } from "cookie";
import type { Handle, GetSession, RequestEvent } from "@sveltejs/kit";
import { getPath, streamFileResponse } from "$server/files";
import { getThumbnail } from "$server/thumbnails";
import type { ThumbnailFormat } from "$server/thumbnails";
import { config } from "$lib/config";

export const handle: Handle = async ({ event, resolve }) => {
  const accept = event.request.headers.get("Accept") ?? "*/*";
  const dest = event.request.headers.get("Sec-Fetch-Dest") ?? "";
  const { searchParams } = event.url;

  if (
    "path" in event.params &&
    (searchParams.has("file") ||
      (!["empty", "document"].includes(dest) &&
        (!accept.startsWith("text/html") || dest === "iframe") &&
        !accept.startsWith("application/json")))
  ) {
    /// File streaming
    let path = getPath(event.params.path);

    if (searchParams.has("size") || searchParams.has("format")) {
      const size = parseInt(event.url.searchParams.get("size") ?? "");
      const format = event.url.searchParams.get("format") ?? "";
      path = await getThumbnail(path, size, format as ThumbnailFormat);
    }

    const response = await streamFileResponse(path);
    if (response) return response;
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%htmlclass%", isDarkmode(event) ?? true ? "dark" : ""),
  });
};

export const getSession: GetSession = async (event) => ({
  darkmode: isDarkmode(event),
});

function isDarkmode(event: RequestEvent) {
  const cookiesHead = event.request.headers.get("cookie");
  const cookies = cookiesHead ? parse(cookiesHead) : {};
  return cookies[config.darkmodeCookie] ? cookies[config.darkmodeCookie] === "true" : undefined;
}
