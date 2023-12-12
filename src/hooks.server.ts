import { parse } from "cookie";
import { redirect, type Handle } from "@sveltejs/kit";
import { config } from "$lib/config";


export const handle: Handle = async ({ event, resolve }) => {
  if (!event.route.id?.startsWith("/_files") && event.url.searchParams.has("file")) {
    event.url.searchParams.delete("file");
    throw redirect(302, "/_files"+event.url.pathname +"?"+ event.url.searchParams);
  }

  const cookiesHead = event.request.headers.get("cookie");
  const cookies = cookiesHead ? parse(cookiesHead) : {};
  const darkmode = cookies[config.darkmodeCookie] ? cookies[config.darkmodeCookie] === "true" : undefined;
  event.locals.darkmode = darkmode;

  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%htmlclass%", darkmode ?? true ? "dark" : ""),
  });
};


