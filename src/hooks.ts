import { parse } from "cookie";
import type { Handle, GetSession, RequestEvent } from "@sveltejs/kit";
import { HTTPError } from "$server/HTTPError";
import { getPath, streamFileResponse } from "$server/files";
import { getThumbnail } from "$server/thumbnails";
import type { ThumbnailFormat } from "$server/thumbnails";
import { config } from "$lib/config";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    const accept = event.request.headers.get("Accept") ?? "*/*";
    if (
      "path" in event.params &&
      !event.request.headers.has("X-Sveltekit-Load") &&
      !accept.startsWith("text/html") &&
      !accept.startsWith("application/json")
    ) {
      /// File streaming
      let path = getPath(event.params.path);

      const { searchParams } = event.url;
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
  } catch (error) {
    if (error instanceof HTTPError) {
      return new Response(JSON.stringify({ status: error.status, message: error.message }), { status: error.status });
    }
    throw error;
  }
};

export const getSession: GetSession = async (event) => ({
  darkmode: isDarkmode(event),
});

function isDarkmode(event: RequestEvent) {
  const cookiesHead = event.request.headers.get("cookie");
  const cookies = cookiesHead ? parse(cookiesHead) : {};
  return cookies[config.darkmodeCookie] ? cookies[config.darkmodeCookie] === "true" : undefined;
}
