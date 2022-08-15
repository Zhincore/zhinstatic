import type { NodeInfo } from "$server/files";

export type SortFileNodesOpts = {
  //
};

export function sortFileNodes(list: NodeInfo[], opts?: SortFileNodesOpts) {
  return [...list].sort((a, b) => Number("size" in a) - Number("size" in b) || a.name.localeCompare(b.name));
}
