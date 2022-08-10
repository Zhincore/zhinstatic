import { parse } from "cookie";
import type { Handle, GetSession, RequestEvent } from "@sveltejs/kit";
import { ErrorResponse } from "$server/ErrorResponse";
import { getPath, streamFileResponse } from "$server/files";
import { config } from "$lib/config";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    /// File streaming
    const accept = event.request.headers.get("Accept");
    if (
      "path" in event.params &&
      !event.request.headers.has("X-Sveltekit-Load") &&
      (!accept || !accept.startsWith("text/html"))
    ) {
      const path = getPath(event.params.path);
      const response = await streamFileResponse(path);
      if (response) return response;
    }

    return await resolve(event, {
      transformPageChunk: ({ html }) => html.replace("%htmlclass%", isDarkmode(event) ?? true ? "dark" : ""),
    });
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return new Response(JSON.stringify(error), { status: error.status });
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
