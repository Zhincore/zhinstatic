import { error } from "@sveltejs/kit";
import { getPath, getNodeInfo } from "$server/files";

export async function getNode(paramPath: string) {
  const path = getPath(paramPath);
  const node = await getNodeInfo(path);

  if (!node) throw error(404, "File ceased to exist while processing?");

  return { node, path: "/" + paramPath };
}
