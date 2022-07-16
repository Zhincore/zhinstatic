import type { RequestHandler } from "@sveltejs/kit";

export const get: RequestHandler = async ({ params }) => {
  return {
    body: { path: import.meta.env.ZSTATIC_PATH },
  };
};
