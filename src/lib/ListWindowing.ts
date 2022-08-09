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

interface ListWindowingOptions<T> extends Partial<ListWindowingInput<T>> {
  autoStart?: boolean;
}

interface ListWindowingItem<T> {
  offsetTop: number;
  offsetLeft: number;
  width: number;
  data: T;
}

interface ListWindowingOutput<T> {
  /** The calulated total height of the list. */
  scrollHeight: number;
  /** Whether or not the output can be trusted */
  ready: boolean;
  /** Part of the list that should be visible */
  listWindow: ListWindowingItem<T>[];
}

export class ListWindowing<T>
  extends EventEmitter<ListWindowingEvents>
  implements Readable<ListWindowing<T>>, ListWindowingInput<T>, ListWindowingOutput<T>
{
  private lastPageSize = 0;
  private lastScroll = 0;
  private lastList: T[] = [];

  private frame?: number;
  private _list: T[] = [];
  public columns = 1;
  public windowEl?: HTMLElement;
  public item?: HTMLElement | number;

  scrollHeight = 0;
  ready = false;
  listWindow: ListWindowingItem<T>[] = [];

  get list() {
    return this._list;
  }

  set list(val: T[]) {
    this.ready = false;
    // Reset the window to prevent stale entries
    this.listWindow = (this._list = val).map((data) => ({ data, offsetLeft: 0, offsetTop: 0, width: 0 }));
  }

  constructor(options?: ListWindowingOptions<T>) {
    super();
    if (options) {
      const { autoStart = true, ...inputs } = options;

      Object.assign(this, inputs);

      if (autoStart) this.start();
    }
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

    // Input calcs
    const windHeight = this.windowEl.getBoundingClientRect().height;
    const rowHeight = typeof this.item === "number" ? this.item : this.item.getBoundingClientRect().height;
    const scroll = this.windowEl.scrollTop;

    const pageSize = Math.ceil(windHeight / rowHeight) * this.columns;

    // Skip update if nothing changed
    if (this.lastList === this.list && this.lastPageSize === pageSize && this.lastScroll === scroll) return; // Unchanged
    this.lastList = this.list;
    this.lastPageSize = pageSize;
    this.lastScroll = scroll;

    // Output calcs
    const offset = Math.floor(scroll / rowHeight);
    const itemOffset = offset * this.columns;

    const topOffset = rowHeight * offset;
    const colWidth = 100 / this.columns;

    this.scrollHeight = rowHeight * (this.list.length / this.columns);
    this.listWindow = this.list.slice(itemOffset, Math.ceil(itemOffset + pageSize + this.columns)).map((data, i) => ({
      data,
      offsetTop: topOffset + Math.floor(i / this.columns) * rowHeight,
      offsetLeft: colWidth * (i % this.columns),
      width: colWidth,
    }));

    this.ready = true;
    this.emit("update");
  }

  stop() {
    if (!this.frame) return;
    window.cancelAnimationFrame(this.frame);
    this.frame = undefined;
  }
}
