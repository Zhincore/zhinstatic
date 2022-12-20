import { sortFolder } from "$lib/folderSorting";
import type { FolderInfo } from "$server/files";
import type { PageLoadEvent } from "./$types";

export async function load({ fetch, params: { path }, data }: PageLoadEvent) {
  const folder = await fetchFolder(fetch);
  if (!folder || !("files" in folder)) return data;

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

  return { ...data, neighbours: [prevFile, nextFile] as [string | undefined, string | undefined] };
}

async function fetchFolder(fetch: PageLoadEvent["fetch"]): Promise<FolderInfo | undefined> {
  const response = await fetch(".");
  if (response.ok) return await response.json().then((folder) => folder.node);
}
