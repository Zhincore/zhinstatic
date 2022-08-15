import type { ReadableByteStreamController, ReadableStreamBYOBRequest, UnderlyingByteSource } from "node:stream/web";
import { open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";

export class FileSource implements UnderlyingByteSource {
  type = "bytes" as const;
  autoAllocateChunkSize = 1024;

  private timeout?: NodeJS.Timeout;
  private file?: FileHandle;
  private controller?: ReadableByteStreamController;

  constructor(readonly path: string) {}

  private clearTimeout() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  private resetTimeout() {
    this.clearTimeout();
    this.timeout = setTimeout(async () => {
      await this.cancel();
    }, 15000).unref();
  }

  async start(controller: ReadableByteStreamController) {
    this.file = await open(this.path);
    this.controller = controller;
    this.resetTimeout();
  }

  async pull(controller: ReadableByteStreamController) {
    const req = controller.byobRequest as typeof ReadableStreamBYOBRequest;
    if (!this.file || !this.controller) return;
    this.resetTimeout();
    const view = req?.view;
    const { bytesRead } = await this.file.read({
      buffer: view,
      offset: view.byteOffset,
      length: view.byteLength,
    });

    if (bytesRead === 0) {
      await this.cancel();
      this.controller?.close();
    }

    req.respond(bytesRead);
  }

  async cancel() {
    this.clearTimeout();
    await this.file?.close();
  }
}
