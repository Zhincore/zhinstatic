import type { ReadableByteStreamController, ReadableStreamBYOBRequest, UnderlyingByteSource } from "node:stream/web";
import { open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";

export class FileSource implements UnderlyingByteSource {
  type = "bytes" as const;
  autoAllocateChunkSize = 1024;

  private file?: FileHandle;
  private controller?: ReadableByteStreamController;

  constructor(readonly path: string) {}

  async start(controller: ReadableByteStreamController) {
    this.file = await open(this.path);
    this.controller = controller;
  }

  async pull(controller: ReadableByteStreamController) {
    const req = controller.byobRequest as typeof ReadableStreamBYOBRequest;
    if (!this.file || !this.controller) return;
    const view = req?.view;
    const { bytesRead } = await this.file.read({
      buffer: view,
      offset: view.byteOffset,
      length: view.byteLength,
    });

    if (bytesRead === 0) await this.cancel();

    req.respond(bytesRead);
  }

  async cancel() {
    await this.file?.close();
    this.controller?.close();
  }
}
