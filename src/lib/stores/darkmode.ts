import Cookies from "js-cookie";
import { page } from "$app/stores";
import { browser } from "$app/environment";
import { togglable } from "$lib/togglable";
import type { Togglable } from "$lib/togglable";
import { config } from "$lib/config";

function createDarkmodeStore() {
  let initial: boolean | undefined = config.darkmodeDefault;
  page.subscribe((ses) => (initial = ses.data.darkmode))();

  if (!browser) return togglable(initial);

  const mediaq = window.matchMedia("(prefers-color-scheme: dark)");
  const store = togglable(initial === undefined ? mediaq.matches : initial);

  store.subscribe((state) => {
    Cookies.set(config.darkmodeCookie, state + "", { expires: 900, sameSite: "lax", secure: !import.meta.env.DEV });
    document.documentElement.classList.toggle("dark", state);
  });

  return store;
}

let store: Togglable;

export const getDarkmode = () => store ?? (store = createDarkmodeStore());
