import { error  } from "@sveltejs/kit";
import { getPath, streamFileResponse } from "$server/files";
import { getThumbnail } from "$server/thumbnails";
import type { ThumbnailFormat } from "$server/thumbnails";
import type { RequestHandler } from './$types';

const RANGE_RE = /^bytes=(?<start>\d+)?-(?<end>\d+)?/;

export const GET: RequestHandler = async (event) => {
    const { headers } = event.request;
  const searchParams = event.url.searchParams || new URLSearchParams();
  const abort = event.request.signal;
  let path = getPath(event.params.path);

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
    const match = RANGE_RE.exec(headers.get("Range") ?? "");
    start = parseInt(match?.groups?.start ?? "") || undefined;
    end = parseInt(match?.groups?.end ?? "") || undefined;
  }

  const response = await streamFileResponse(path, undefined, start, end);
  if (response) return response;
  throw error(404, "Streaming failed");
};
