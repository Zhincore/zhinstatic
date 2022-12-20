<script lang="ts">
  import { fade } from "svelte/transition";
  import { navigating } from "$app/stores";
  import Loader from "$elements/Loader.svelte";
  import FileViewer from "./_file.svelte";
  import FolderViewer from "./_folder.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ path, node } = data);
</script>

<svelte:head>
  <title>{path}</title>
</svelte:head>

{#key path}
  <div class="absolute inset-0 flex flex-col">
    {#if "files" in node}
      <FolderViewer {node} {path} />
    {:else}
      <FileViewer {node} {path} neighbours={data.neighbours} />
    {/if}
  </div>
{/key}

{#if $navigating}
  <div class="absolute inset-0 z-10 flex items-center justify-center overflow-hidden" in:fade={{ delay: 250 }} out:fade>
    <div class="bg-radialShadow p-24"><Loader /></div>
  </div>
{/if}
