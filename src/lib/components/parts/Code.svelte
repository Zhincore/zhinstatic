<script lang="ts">
  import { onMount } from "svelte";
  import { Highlight } from "svelte-highlight";
  import type { LanguageType } from "svelte-highlight/languages";
  import "svelte-highlight/styles/atom-one-dark.css";

  export let src: string;

  export let isLoaded = false;
  export let isError = false;

  let type: string;
  let code = "";
  let language: LanguageType<string> | undefined;

  onMount(async () => {
    const response = await fetch(src);
    if (response.ok) {
      type = response.headers.get("Content-Type") ?? "text/plain";
      [code, language] = await Promise.all([
        response.text(),
        (
          {
            "application/json": () => import("svelte-highlight/languages/json"),
            "text/css": () => import("svelte-highlight/languages/css"),
            "text/javascript": () => import("svelte-highlight/languages/javascript"),
            "application/javascript": () => import("svelte-highlight/languages/javascript"),
            "application/node": () => import("svelte-highlight/languages/javascript"),
            "text/x.typescript": () => import("svelte-highlight/languages/typescript"),
            "text/x.svelte+xml": () => import("svelte-highlight/languages/xml"),
            "text/markdown": () => import("svelte-highlight/languages/markdown"),
            "text/yaml": () => import("svelte-highlight/languages/yaml"),
          }[type] ?? (() => import("svelte-highlight/languages/plaintext"))
        )().then((m) => m.default),
      ]);
      isLoaded = true;
    } else {
      isError = true;
    }
  });
</script>

{#if code && language}
  <Highlight {code} {language} langtag />
{/if}
