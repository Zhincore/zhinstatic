import { writable } from "svelte/store";
import Cookies from "js-cookie";
import { browser } from "$app/env";

const COOKEY = "zhinstatic-darkmode";

function createDarkmodeStore() {
  if (!browser) return writable(true);

  const mediaq = window.matchMedia("(prefers-color-scheme: dark)");
  const cookie = Cookies.get(COOKEY);
  const store = writable(cookie === undefined ? mediaq.matches : cookie === "true");

  store.subscribe((state) => {
    Cookies.set(COOKEY, state + "", { expires: 900, sameSite: "lax", secure: !import.meta.env.DEV });
    document.documentElement.classList.toggle("dark", state);
  });

  return store;
}

export const darkmode = createDarkmodeStore();
