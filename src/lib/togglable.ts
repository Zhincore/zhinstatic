import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export interface Togglable extends Writable<boolean> {
  toggle(state?: boolean): void;
}

export function togglable(value?: boolean): Togglable {
  const store = writable(value);
  return {
    ...store,
    toggle: (state?: boolean) => store.update((value) => state ?? !value),
  };
}
