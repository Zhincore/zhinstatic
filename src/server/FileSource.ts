import type { ReadableByteStreamController, ReadableStreamBYOBRequest, UnderlyingByteSource } from "node:stream/web";
import { open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";

export interface FileSourceOpts {
  start?: number;
  length?: number;
}

export class FileSource implements UnderlyingByteSource {
  type = "bytes" as const;
  autoAllocateChunkSize = 1024;
  closed = false;

  private file?: FileHandle;
  private controller?: ReadableByteStreamController;
  private position = 0;
  private length = Infinity;

  constructor(readonly path: string, opts: FileSourceOpts = {}) {
    if (opts.start) this.position = opts.start;
    if (opts.length) this.length = opts.length + 1;
  }

  async start(controller: ReadableByteStreamController) {
    this.file = await open(this.path);

    this.controller = controller;
  }

  async pull(controller: ReadableByteStreamController) {
    const req = controller.byobRequest as unknown as ReadableStreamBYOBRequest | null;
    if (!req || !this.file || !this.controller) return;

    const view = req.view;
    const { bytesRead } = await this.file.read({
      buffer: view,
      offset: view.byteOffset,
      length: Math.min(view.byteLength, this.length),
      position: this.position,
    });
    this.length -= bytesRead;
    this.position += bytesRead;

    if (bytesRead === 0 || this.length <= 0) {
      await this.cancel();
      this.controller.close();
    }

    req.respond(bytesRead);
  }

  async cancel() {
    this.closed = true;
    await this.file?.close();
  }
}
