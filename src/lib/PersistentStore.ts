import { writable } from "svelte/store";
import Debounce from "debounce";
import { browser } from "$app/env";

export function PersistentStore<T>(key: string, defValue?: T) {
  const stored = browser && localStorage.getItem(key);
  const store = writable<T>(stored ? JSON.parse(stored) : defValue);

  store.subscribe(
    Debounce((value) => browser && value !== undefined && localStorage.setItem(key, JSON.stringify(value)), 200),
  );

  return store;
}
