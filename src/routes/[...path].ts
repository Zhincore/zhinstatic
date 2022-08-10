import { ErrorResponse } from "$server/ErrorResponse";
import { getPath, getNodeInfo } from "$server/files";
import type { RequestHandler } from "./__types/[...path]";

export const GET: RequestHandler<unknown> = async ({ params }) => {
  const path = getPath(params.path);
  const node = await getNodeInfo(path);

  if (!node) return new ErrorResponse(404, "File ceased to exist while processing?");

  return {
    body: { node, path: "/" + params.path },
  };
};
