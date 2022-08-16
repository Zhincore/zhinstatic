import { error } from "@sveltejs/kit";
import { getPath, getNodeInfo } from "$server/files";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const path = getPath(params.path);
  const node = await getNodeInfo(path);

  if (!node) throw error(404, "File ceased to exist while processing?");

  return { node, path: "/" + params.path };
};
