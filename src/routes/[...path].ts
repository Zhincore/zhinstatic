import { ErrorResponse } from "$lib/ErrorResponse";
import { getPath, getNodeInfo } from "$lib/files";
import type { RequestHandler } from "./__types/[...path]";

export const get: RequestHandler<unknown> = async ({ params }) => {
  const path = getPath(params.path);

  const nodeInfo = await getNodeInfo(path);

  if (!nodeInfo) return new ErrorResponse(404, "File ceased to exist while processing?");

  return {
    body: {
      nodeInfo,
      path: "/" + params.path,
      mime: "mime" in nodeInfo ? nodeInfo.mime : null,
    },
  };
};
