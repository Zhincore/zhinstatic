import { parse } from "cookie";
import { error, type Handle, type RequestEvent } from "@sveltejs/kit";
import { building } from "$app/environment";
import { getPath, streamFileResponse } from "$server/files";
import { getThumbnail } from "$server/thumbnails";
import type { ThumbnailFormat } from "$server/thumbnails";
import { config } from "$lib/config";

const RANGE_RE = /^bytes=(?<start>\d+)?-(?<end>\d+)?/;

export const handle: Handle = async ({ event, resolve }) => {
  if (!building && !event.isDataRequest) {
    const { headers } = event.request;
    const accept = headers.get("Accept") ?? "*/*";
    const dest = event.request.destination || headers.get("sec-fetch-dest") || "empty";
    const searchParams = event.url.searchParams || new URLSearchParams();

    if (
      event.params.path &&
      (searchParams.has("file") ||
        ((dest === "iframe" || !accept.startsWith("text/html")) && !accept.startsWith("application/json")))
    ) {
      const stream = await streamFile(event);
      if (stream) return stream;
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

async function streamFile(event: RequestEvent) {
  const { headers } = event.request;
  const searchParams = event.url.searchParams || new URLSearchParams();
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
