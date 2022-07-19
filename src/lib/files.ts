import fs from "node:fs";
import Path from "node:path";
import { cpus } from "node:os";
import Limiter from "p-limit";
import { ErrorResponse } from "$lib/ErrorResponse";

const ROOT_PATH = Path.resolve(process.env.ZSTATIC_PATH || import.meta.env.ZSTATIC_PATH);

const limit = Limiter(cpus().length);

type BaseNodeInfo = { name: string };
export type FileInfo = BaseNodeInfo & {
  size: number;
  mtime: number;
};
export type FolderInfo = BaseNodeInfo & {
  files: NodeInfo[];
};
export type NodeInfo = FileInfo | FolderInfo;

export function getPath(paramPath: string) {
  const path = Path.join(ROOT_PATH, paramPath);
  if (!path.startsWith(ROOT_PATH)) throw new ErrorResponse(400, "Invalid path");
  if (!fs.existsSync(path)) throw new ErrorResponse(404, "File not found");
  return path;
}

export async function getNodeInfo(path: string): Promise<NodeInfo | undefined> {
  if (!fs.existsSync(path)) return;

  const file = await getFile(path);
  if (file.stat.isDirectory()) {
    const files: Promise<NodeInfo>[] = [];

    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      const _path = Path.join(path, dirent.name);
      if (dirent.isDirectory()) {
        files.push(Promise.resolve({ name: Path.basename(_path), files: [] }));
      } else {
        files.push(limit(() => getFile(_path)).then((d) => d.info));
      }
    }

    return { name: Path.basename(path), files: await Promise.all(files) };
  }

  return file.info;
}

export async function getFile(path: string) {
  const stat = await fs.promises.stat(path);

  return {
    stat,
    info: {
      name: Path.basename(path),
      size: stat.size,
      mtime: stat.mtimeMs,
    },
  };
}
