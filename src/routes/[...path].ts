import { ErrorResponse } from "$lib/ErrorResponse";
import { getPath, getNodeInfo } from "$lib/files";
import { probeFile } from "$lib/filesSubprocess";
import type { RequestHandler } from "./__types/[...path]";

export const get: RequestHandler = async ({ params }) => {
  const path = getPath(params.path);

  const nodeInfo = await getNodeInfo(path);

  if (!nodeInfo) return new ErrorResponse(404, "File ceased to exist while processing?");

  return {
    body: {
      nodeInfo,
      path: "/" + params.path,
      mime: "size" in nodeInfo ? await probeFile(path) : null,
    },
  };
};
