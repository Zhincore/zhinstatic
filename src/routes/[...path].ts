import fs from "fs";
import Path from "path";
import type { ResponseBody } from "@sveltejs/kit";
import { ErrorResponse } from "$lib/ErrorResponse";
import { getNodeInfo } from "$lib/files";
import type { RequestHandler } from "./__types/[...path]";

const ROOT_PATH = Path.resolve(process.env.ZSTATIC_PATH || import.meta.env.ZSTATIC_PATH);

export const get: RequestHandler<ResponseBody> = async ({ params }) => {
  const path = Path.join(ROOT_PATH, params.path);
  if (!path.startsWith(ROOT_PATH)) return new ErrorResponse(400, "Invalid path");
  if (!fs.existsSync(path)) return new ErrorResponse(404, "File not found");

  const nodeInfo = await getNodeInfo(path);

  if (!nodeInfo) return new ErrorResponse(404, "File ceased to exist while processing?");

  return { body: { nodeInfo, path: params.path } };
};
