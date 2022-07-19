<script lang="ts">
  import type { NodeInfo } from "$lib/files";

  export let path: string;
  export let nodeInfo: NodeInfo;
  export let mime: string | null;

  const normalizePathRE = /\/{2,}/g;
  const normalizePath = (path: string) => path.replace(normalizePathRE, "/");

  $: type = mime ? mime.split("/")[0] : "folder";
</script>

{#if "files" in nodeInfo}
  <ul>
    {#each nodeInfo.files as file}
      <li><a href={normalizePath(path + "/" + file.name)}>{file.name}</a></li>
    {/each}
  </ul>
{:else}
  <pre>{JSON.stringify(nodeInfo)}</pre>
  <time>{new Date(nodeInfo.mtime).toLocaleString()}</time>

  {#if type === "image"}
    <img src={path} alt="" />
  {:else if type === "video"}{/if}
{/if}
