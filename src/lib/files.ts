import fs from "fs";
import type { Stats } from "node:fs";
import Path from "node:path";
import { fileTypeFromFile } from "file-type";
import type { File as FileRecord, PrismaPromise } from "@prisma/client";
import { prisma } from "$lib/prisma";
import { ErrorResponse } from "$lib/ErrorResponse";

const ROOT_PATH = Path.resolve(process.env.ZSTATIC_PATH || import.meta.env.ZSTATIC_PATH);

type BaseNodeInfo = { name: string };
export type FileInfo = BaseNodeInfo & {
  size: number;
  mtime: number;
  mime: string | undefined;
  ext: string | undefined;
};
export type FolderInfo = BaseNodeInfo & {
  files: NodeInfo[];
};
export type NodeInfo = FileInfo | FolderInfo;

const cacheLock = new Set<string>();
const deferedCache: FileRecord[] = [];

export function getPath(paramPath: string) {
  const path = Path.join(ROOT_PATH, paramPath);
  if (!path.startsWith(ROOT_PATH)) throw new ErrorResponse(400, "Invalid path");
  if (!fs.existsSync(path)) throw new ErrorResponse(404, "File not found");
  return path;
}

export async function getNodeInfo(path: string): Promise<NodeInfo | undefined> {
  if (!fs.existsSync(path)) return;

  const stat = await fs.promises.stat(path);
  if (stat.isDirectory()) {
    const files: Promise<NodeInfo>[] = [];

    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      const _path = Path.join(path, dirent.name);
      if (dirent.isDirectory()) {
        files.push(Promise.resolve({ name: Path.basename(_path), files: [] }));
      } else {
        files.push(getFile(_path));
      }
    }

    await saveDeferedCache();
    return { name: Path.basename(path), files: await Promise.all(files) };
  }

  await saveDeferedCache();
  return await getFile(path);
}

export async function getFile(path: string, aStat?: Stats): Promise<FileInfo> {
  const [stat, db] = await Promise.all([
    aStat ?? (await fs.promises.stat(path)),
    prisma.file.findUnique({ where: { path } }),
  ]);
  let _db = db ?? undefined;

  if (!db) {
    const type = await fileTypeFromFile(path);
    if (type) {
      _db = { path, ...type };
      deferedCache.push(_db);
    }
  }

  return {
    name: Path.basename(path),
    size: stat.size,
    mtime: stat.mtimeMs,
    mime: _db?.mime ?? undefined,
    ext: _db?.ext ?? undefined,
  };
}

async function saveDeferedCache() {
  if (!deferedCache.length) return;

  const transaction: PrismaPromise<unknown>[] = [];
  for (const data of deferedCache) {
    if (cacheLock.has(data.path)) continue;
    cacheLock.add(data.path);
    transaction.push(prisma.file.create({ data }));
  }
  deferedCache.length = 0;
  await prisma.$transaction(transaction);
}
