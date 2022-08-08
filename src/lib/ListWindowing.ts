import EventEmitter from "eventemitter3";
import type { Readable, Subscriber, Unsubscriber } from "svelte/store";

interface ListWindowingEvents {
  update: () => void;
  preupdate: () => void;
}

interface ListWindowingInput<T> {
  /** How many columns does the view window have. Default is `1`. */
  columns: number;
  /** The list to calculate windowing for. */
  list: T[];
  /** The list to calculate windowing for. */
  windowEl?: HTMLElement;
  /** Height of an item inside the window or reference to an element to take the height of */
  item?: HTMLElement | number;
}

interface ListWindowingOutput<T> {
  /** The calulated total height of the list. */
  scrollHeight: number;
  /** The current scroll offset from the top of the list. */
  offset: number;
  /** Part of the list that should be visible */
  listWindow: T[];
}

export class ListWindowing<T>
  extends EventEmitter<ListWindowingEvents>
  implements Readable<ListWindowing<T>>, ListWindowingInput<T>, ListWindowingOutput<T>
{
  private frame?: number;
  public columns = 1;
  public list: T[] = [];
  public windowEl?: HTMLElement;
  public item?: HTMLElement | number;

  scrollHeight = 0;
  offset = 0;
  listWindow: T[] = [];

  constructor(autoStart = true, list?: T[]) {
    super();
    if (list) this.listWindow = list;
    if (autoStart) this.start();
  }

  subscribe = (run: Subscriber<ListWindowing<T>>): Unsubscriber => {
    const fn = () => run(this);
    this.on("update", fn);
    fn();

    return () => this.off("update", fn);
  };

  start() {
    if (!this.frame) this.update();
  }

  update() {
    this.frame = window.requestAnimationFrame(this.update.bind(this));

    if (!this.windowEl || !this.item || !this.list) return;

    this.emit("preupdate");

    const windHeight = this.windowEl.getBoundingClientRect().height;
    const rowHeight = typeof this.item === "number" ? this.item : this.item.getBoundingClientRect().height;

    const scroll = this.windowEl.scrollTop;
    const pageSize = Math.ceil(windHeight / rowHeight) * this.columns;
    const offset = Math.floor(scroll / rowHeight);
    const itemOffset = offset * this.columns;

    this.scrollHeight = rowHeight * (this.list.length / this.columns);
    this.offset = rowHeight * Math.max(0, offset);
    this.listWindow = this.list.slice(itemOffset, Math.ceil(itemOffset + pageSize));

    this.emit("update");
  }

  stop() {
    if (!this.frame) return;
    window.cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }
}
