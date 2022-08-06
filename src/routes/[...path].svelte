<script lang="ts">
  import { fade } from "svelte/transition";
  import { page } from "$app/stores";
  import type { NodeInfo } from "$lib/files";
  import FileViewer from "./_file.svelte";
  import FolderViewer from "./_folder.svelte";

  export let nodeInfo: NodeInfo;
  export let path: string;
</script>

<svelte:head>
  <title>{"/" + path}</title>
</svelte:head>

{#key path}
  <div class="absolute inset-0" transition:fade={{ duration: 200 }}>
    {#if "files" in nodeInfo}
      <FolderViewer node={nodeInfo} />
    {:else}
      <FileViewer node={nodeInfo} />
    {/if}
  </div>
{/key}
