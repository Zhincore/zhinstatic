<script lang="ts">
  import { fade } from "svelte/transition";
  import { navigating } from "$app/stores";
  import type { NodeInfo } from "$server/files";
  import Loader from "$comps/Loader.svelte";
  import FileViewer from "./_file.svelte";
  import FolderViewer from "./_folder.svelte";

  export let node: NodeInfo;
  export let path: string;
</script>

<svelte:head>
  <title>{path}</title>
</svelte:head>

{#key path}
  <div class="absolute inset-0">
    {#if "files" in node}
      <FolderViewer {node} {path} />
    {:else}
      <FileViewer {node} {path} />
    {/if}
  </div>
{/key}

{#if $navigating}
  <div class="absolute inset-0 z-10 flex items-center justify-center overflow-hidden" in:fade={{ delay: 250 }} out:fade>
    <div class="bg-radialShadow p-24"><Loader /></div>
  </div>
{/if}
