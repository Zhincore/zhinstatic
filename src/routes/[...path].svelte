<script lang="ts">
  import { fade } from "svelte/transition";
  import type { NodeInfo } from "$lib/files";

  export let path: string;
  export let nodeInfo: NodeInfo;
  export let mime: string | null;

  const normalizePathRE = /\/+/g;
  const normalizePath = (...pathComps: string[]) =>
    "/" +
    pathComps
      .join("/")
      .split(normalizePathRE)
      .filter((v) => v)
      .map(encodeURIComponent)
      .join("/");

  $: type = mime ? mime.split("/")[0] : "folder";
  $: url = normalizePath(path);
</script>

{#if "files" in nodeInfo}
  <ul>
    {#each nodeInfo.files as file, i}
      <li>
        <a href={normalizePath(path, file.name)} class="link inline-block px-4 py-1">{file.name}</a>
      </li>
    {/each}
  </ul>
{:else}
  <pre>{JSON.stringify(nodeInfo)}</pre>
  <time>{new Date(nodeInfo.mtime).toLocaleString()}</time>

  {#if type === "image"}
    <img src={url} alt="" />
  {:else if type === "video"}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={url} autoplay controls loop />
  {:else}
    <embed src={url} />
  {/if}
{/if}
