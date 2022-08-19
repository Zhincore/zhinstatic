import type { NodeInfo } from "$server/files";

export function sortFolder(list: NodeInfo[]) {
  return [...list].sort((a, b) => Number("size" in a) - Number("size" in b) || a.name.localeCompare(b.name));
}
