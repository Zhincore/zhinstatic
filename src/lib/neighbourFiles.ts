import type { FolderInfo } from "$server/files";
import { sortFolder } from "./folderSorting";
import { fetchData } from "./utils";

let folderCache: FolderInfo;
let folderCached = "";

export async function getNeighbourFiles(path: string): Promise<undefined | [string | undefined, string | undefined]> {
  const folder = await fetchFolder(path);
  if (!folder) return;

  const filename = path.split("/").slice(-1)[0];
  let prevFile;
  let nextFile;
  let lastFile = "";

  for (const file of sortFolder(folder.files)) {
    if ("files" in file) continue;
    if (file.name === filename) prevFile = lastFile;
    if (lastFile === filename) nextFile = file.name;
    lastFile = file.name;
  }

  return [prevFile, nextFile];
}

export async function fetchFolder(path: string) {
  const dirpath = path.split("/").slice(0, -1).join("/");

  if (folderCached !== dirpath) {
    const data = await fetchData(dirpath);
    if (!data) return;
    folderCached = dirpath;
    folderCache = data.node;
  }

  return folderCache;
}
