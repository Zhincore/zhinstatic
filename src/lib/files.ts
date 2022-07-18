import fs from "fs";
import Path from "path";
import { prisma } from "$lib/prisma";
import type { FileInfo as PrismaFileInfo } from "@prisma/client";
import { probeFile } from "./filesSubprocess";
import { ResourceLock } from "./ResourceLock";

const fileinfoLock = new ResourceLock<PrismaFileInfo>();

export type FileInfo = Omit<PrismaFileInfo, "size" | "atime" | "ctime" | "mtime"> & {
  size: number;
  atime: number;
  ctime: number;
  mtime: number;
};
export type FolderInfo = {
  files: NodeInfo[];
};
export type NodeInfo = FileInfo | FolderInfo;

export async function getNodeInfo(path: string): Promise<NodeInfo | undefined> {
  if (!fs.existsSync(path)) return;

  const stat = await fs.promises.stat(path);
  if (stat.isDirectory()) {
    const files: Promise<NodeInfo>[] = [];

    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      const _path = Path.join(path, dirent.name);
      if (dirent.isDirectory()) {
        files.push(Promise.resolve({ path: Path.basename(_path), files: [] }));
      } else {
        files.push(getFileInfo(_path));
      }
    }

    return { files: await Promise.all(files) };
  }

  return await getFileInfo(path);
}

async function getFileInfo(path: string): Promise<FileInfo> {
  let info = await prisma.fileInfo.findUnique({ where: { path } });
  const stat = await fs.promises.stat(path, { bigint: true });

  if (!info || hasFileChanged(info, stat)) {
    if (fileinfoLock.isLocked(path)) info = await fileinfoLock.await(path);
    else {
      const releaseLock = await fileinfoLock.acquire(path);

      // Create and cache info about the file
      const probeData = await probeFile(path);
      const data = {
        path,
        size: stat.size,
        atime: stat.atimeMs,
        ctime: stat.ctimeMs,
        mtime: stat.mtimeMs,
        ...probeData,
      };

      info = await prisma.fileInfo.upsert({
        where: { path },
        create: data,
        update: data,
      });

      releaseLock(info);
    }
  }

  return {
    ...info,
    path: Path.basename(info.path),
    size: Number(info.size),
    atime: Number(info.atime),
    ctime: Number(info.ctime),
    mtime: Number(info.mtime),
  };
}

function hasFileChanged(dbInfo: PrismaFileInfo, stat: fs.BigIntStats) {
  // console.log(
  //   stat.atimeMs,
  //   dbInfo.atime,
  //   "|",
  //   stat.mtimeMs,
  //   dbInfo.mtime,
  //   "|",
  //   stat.ctimeMs,
  //   dbInfo.ctime,
  //   "|",
  //   stat.size,
  //   dbInfo.size,
  //   "|",
  // );
  return (
    stat.atimeMs !== dbInfo.atime ||
    stat.mtimeMs !== dbInfo.mtime ||
    stat.ctimeMs !== dbInfo.ctime ||
    stat.size !== dbInfo.size
  );
}
