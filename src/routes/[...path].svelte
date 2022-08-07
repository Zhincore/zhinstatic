<script lang="ts">
  import { fade } from "svelte/transition";
  import type { NodeInfo } from "$lib/files";
  import Loader from "$comps/Loader.svelte";
  import { page, navigating } from "$app/stores";
  import FileViewer from "./_file.svelte";
  import FolderViewer from "./_folder.svelte";

  export let nodeInfo: NodeInfo;

  // name for reliable key change and path for reliable uniqueness (path updates too late)
  $: key = $page.params.path + nodeInfo.name;
</script>

<svelte:head>
  <title>{"/" + $page.params.path}</title>
</svelte:head>

{#if $navigating}
  <div class="absolute inset-0 flex items-center justify-center" in:fade={{ delay: 250 }} out:fade><Loader /></div>
{/if}

{#key key}
  <div class="absolute inset-0" class:pointer-events-none={$navigating}>
    {#if "files" in nodeInfo}
      <FolderViewer node={nodeInfo} />
    {:else}
      <FileViewer node={nodeInfo} />
    {/if}
  </div>
{/key}
