import fs from "node:fs";
import type { Stats } from "node:fs";
import Path from "node:path";
import { fileTypeFromFile } from "file-type";
import { lookup as mimeLookup } from "mime-types";
import { error } from "@sveltejs/kit";
import {database, type FileRecord} from "./database";
import { serverConfig } from "./config";

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

    saveDeferedCache();
    return { name: Path.basename(path), files: await Promise.all(files) };
  }

  saveDeferedCache();
  return await getFile(path, stat);
}

export async function getFile(path: string, aStat?: Stats): Promise<FileInfo> {
  const stat = aStat ?? (await fs.promises.stat(path));

  const ext = Path.extname(path);
  const override: string | undefined = serverConfig.mimeOverride[ext];
  const type: { ext: string | null; mime: string | null } = { ext, mime: (override ?? mimeLookup(ext)) || null };

  if (stat.size > 0 && (!type.mime || serverConfig.checkMagicFor.includes(type.mime) || serverConfig.checkMagicFor.includes(ext))) {
    const fileRecord: FileRecord | null = await database.file.get(path);

    if (!fileRecord) {
      try {
        const magic = (await fileTypeFromFile(path)) ?? null;
        if (magic) deferedCache.push({ ...magic, path });
      } catch(err) {
        console.error(err);
      }
    }
    if (fileRecord) Object.assign(type, fileRecord);
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

  return new Response(Bun.file(path).slice(start, end + 1), {
    status: partial ? 206 : 200,
    headers,
  });
}

function saveDeferedCache() {
  if (!deferedCache.length) return;

  database.insertFiles(deferedCache);
  deferedCache.length = 0;
}
