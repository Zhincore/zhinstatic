import EventEmitter from "eventemitter3";
import type { Readable, Subscriber, Unsubscriber } from "svelte/store";

interface ScrollWindowEvents<T> {
  update: () => void;
}

export class ScrollWindow<T> extends EventEmitter<ScrollWindowEvents<T>> implements Readable<ScrollWindow<T>> {
  private frame?: number;
  private lastTime = 0;
  private lastScroll = 0;
  public list: T[] = [];
  public windowEl?: HTMLElement;
  public item?: HTMLElement | number;

  scrollHeight = 0;
  offset = 0;
  listPage: T[] = [];

  constructor(autoStart = true, list?: T[]) {
    super();
    if (list) this.listPage = list;
    if (autoStart) this.start();
  }

  subscribe = (run: Subscriber<ScrollWindow<T>>): Unsubscriber => {
    const fn = () => run(this);
    this.on("update", fn);
    fn();

    return () => this.off("update", fn);
  };

  start() {
    if (!this.frame) this.render();
  }

  render() {
    this.frame = window.requestAnimationFrame(this.render.bind(this));

    if (!this.windowEl || !this.item || !this.list) return;

    const windHeight = this.windowEl.getBoundingClientRect().height;
    const itemHeight = typeof this.item === "number" ? this.item : this.item.getBoundingClientRect().height;

    const scroll = this.windowEl.scrollTop;
    const pageSize = windHeight / itemHeight;
    const offset = scroll / itemHeight;
    const intOffset = Math.floor(offset);
    const microOffset = offset - intOffset;

    this.scrollHeight = itemHeight * this.list.length;
    this.offset = itemHeight * Math.max(0, offset - microOffset);
    this.listPage = this.list.slice(intOffset, Math.ceil(pageSize + offset));

    this.emit("update");
  }

  stop() {
    if (!this.frame) return;
    window.cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }
}
