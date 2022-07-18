import EventEmitter from "events";

export class ResourceLock<T = void> {
  private readonly locks = new Set<string>();
  private readonly releases = new EventEmitter();

  isLocked(resource: string) {
    return this.locks.has(resource);
  }

  async await(resource: string): Promise<T> {
    return new Promise((r) => this.releases.on(resource, r));
  }

  async acquire(resource: string) {
    if (this.isLocked(resource)) {
      await new Promise((r) => this.releases.on(resource, r));
    }
    this.locks.add(resource);

    return (data: T) => this.release(resource, data);
  }

  private async release(resource: string, data?: T) {
    this.locks.delete(resource);
    this.releases.emit(resource, data);
  }
}
