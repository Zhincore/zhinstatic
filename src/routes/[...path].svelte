<script lang="ts">
  import { fade } from "svelte/transition";
  import { page, navigating } from "$app/stores";
  import type { NodeInfo } from "$server/files";
  import Loader from "$comps/Loader.svelte";
  import FileViewer from "./_file.svelte";
  import FolderViewer from "./_folder.svelte";

  export let node: NodeInfo;
  export let path: string;

  let cachedPath = path;
  let cachedNode = node;

  $: $navigating || (cachedPath = path);
  $: $navigating || (cachedNode = node);
  $: ready = "/" + $page.params.path === path;
</script>

<svelte:head>
  <title>{path}</title>
</svelte:head>

{#key path}
  <div class="absolute inset-0" class:pointer-events-none={$navigating}>
    {#if "files" in node}
      <FolderViewer {node} {path} />
    {:else}
      <FileViewer {node} {path} />
    {/if}
  </div>
{/key}

{#if $navigating}
  <div class="absolute inset-0 flex items-center justify-center" in:fade={{ delay: 250 }} out:fade><Loader /></div>
{/if}
