import fs from "node:fs";
import { ReadableStream, WritableStream } from "node:stream/web";
import type { Stats } from "node:fs";
import Path from "node:path";
import { fileTypeFromFile } from "file-type";
import { lookup as mimeLookup } from "mime-types";
import { error } from "@sveltejs/kit";
import type { File as FileRecord, PrismaPromise } from "@prisma/client";
import { prisma } from "$server/prisma";
import { serverConfig } from "./config";
import { FileSource } from "./FileSource";

const ROOT_PATH = Path.resolve(process.env.ZSTATIC_PATH || import.meta.env.ZSTATIC_PATH);
const FILTER = (filename: string) => !filename.startsWith(".");

type BaseNodeInfo = { name: string };
export type FileInfo = BaseNodeInfo & {
  size: number;
  mtime: number;
  mime: string | null;
  ext: string | null;
};
export type FolderInfo = BaseNodeInfo & {
  files: NodeInfo[];
};
export type NodeInfo = FileInfo | FolderInfo;

const cacheLock = new Set<string>();
const deferedCache: FileRecord[] = [];

export function getPath(paramPath: string) {
  const path = Path.join(ROOT_PATH, paramPath);
  if (!path.startsWith(ROOT_PATH)) throw error(400, "Invalid path");
  if (!fs.existsSync(path)) throw error(404, "File not found");
  return path;
}

export async function getNodeInfo(path: string): Promise<NodeInfo | undefined> {
  if (!fs.existsSync(path)) return;

  const stat = await fs.promises.stat(path);
  if (stat.isDirectory()) {
    const files: Promise<NodeInfo>[] = [];

    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
      if (!FILTER(dirent.name)) continue;

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
  return await getFile(path, stat);
}

export async function getFile(path: string, aStat?: Stats): Promise<FileInfo> {
  const stat = aStat ?? (await fs.promises.stat(path));

  const ext = Path.extname(path);
  const override: string | undefined = (serverConfig.mimeOverride as any)[ext];
  const type: { ext: string | null; mime: string | null } = { ext, mime: (override ?? mimeLookup(ext)) || null };

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
    mime: type.mime ?? null,
    ext: type.ext ?? null,
  };
}

export async function streamFileResponse(path: string, info?: FileInfo, start = 0, end?: number) {
  if (!info) {
    const stat = await fs.promises.stat(path);
    if (!stat.isFile()) return;

    info = await getFile(path, stat);
  }

  if (start >= info.size || (end && (start >= end || end >= info.size))) throw error(416);

  if (!end) end = info.size - 1;
  const length = end - start + 1;
  const partial = length !== info.size;

  const headers = new Headers();
  headers.append("Content-Type", info.mime ?? "application/octet-stream");
  headers.append("Content-Length", length + "");
  headers.append("Accept-Ranges", "bytes");
  if (partial) {
    headers.append("Content-Range", `bytes ${start}-${end}/${info.size}`);
  }

  const [stream, fallback] = new ReadableStream(new FileSource(path, { start, length })).tee();
  // Piping the clone of the stream nowhere to prevent the stream from getting garbage collected without closing the underlying file
  fallback.pipeTo(new WritableStream());
  return new Response(stream, {
    status: partial ? 206 : 200,
    headers,
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
