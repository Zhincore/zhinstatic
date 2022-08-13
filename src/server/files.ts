import fs from "node:fs";
import { ReadableStream } from "node:stream/web";
import type { Stats } from "node:fs";
import Path from "node:path";
import { fileTypeFromFile } from "file-type";
import { lookup as mimeLookup } from "mime-types";
import type { File as FileRecord, PrismaPromise } from "@prisma/client";
import { prisma } from "$server/prisma";
import { HTTPError } from "$server/HTTPError";
import { serverConfig } from "./config";
import { FileSource } from "./FileSource";

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
  if (!path.startsWith(ROOT_PATH)) throw new HTTPError(400, "Invalid path");
  if (!fs.existsSync(path)) throw new HTTPError(404, "File not found");
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
  const stat = aStat ?? (await fs.promises.stat(path));

  const ext = Path.extname(path);
  const type: { ext: string | null; mime: string | null } = { ext, mime: mimeLookup(ext) || null };

  if (!type.mime || serverConfig.checkMagicFor.includes(type.mime) || serverConfig.checkMagicFor.includes(ext)) {
    let magic: { ext: string | null; mime: string | null } | null = await prisma.file.findUnique({ where: { path } });

    if (!magic) {
      magic = (await fileTypeFromFile(path)) ?? null;
      if (magic) deferedCache.push({ path, ...magic });
    }
    if (magic) Object.assign(type, magic);
  }

  return {
    name: Path.basename(path),
    size: stat.size,
    mtime: stat.mtimeMs,
    mime: type.mime ?? undefined,
    ext: type.ext ?? undefined,
  };
}

export async function streamFileResponse(path: string, info?: FileInfo) {
  if (!info) {
    const stat = await fs.promises.stat(path);
    if (!stat.isFile()) throw new HTTPError(400, "Cannot stream a folder");

    info = await getFile(path, stat);
  }

  const webstream = new ReadableStream(new FileSource(path));

  // finished(stream, (error) => {
  //   // Ignore dumb errors from client disconnecting
  //   if (
  //     !error ||
  //     ["EPIPE", "AbortError", "ECONNRESET", "ERR_STREAM_DESTROYED", "ERR_STREAM_PREMATURE_CLOSE"].includes(error.name)
  //   )
  //     return;
  //   throw error;
  // });

  return new Response(webstream, {
    headers: {
      "Content-Type": info.mime ?? "application/octet-stream",
      "Content-Length": info.size + "",
    },
  });
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
