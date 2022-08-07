<script lang="ts">
  import { fade } from "svelte/transition";
  import { normalizePath } from "$lib/utils";
  import type { FileInfo } from "$lib/files";
  import Loader from "$comps/Loader.svelte";
  import { page } from "$app/stores";

  export let node: FileInfo;
  const type = node.mime?.split("/")[0];
  const url = normalizePath($page.params.path);

  let isLoaded = false;
  let isError = false;
  let image: HTMLImageElement;

  const loaded = () => (isLoaded = true);
  const error = () => (isError = true);

  $: isComplete = isLoaded || isError;
  $: !isComplete && image && image.complete && loaded();
</script>

<div class="flex h-full items-center justify-center pb-2" transition:fade={{ duration: 200 }}>
  <div class="absolute -z-10 transition-opacity" class:opacity-0={isComplete}><Loader /></div>

  {#if isError}
    <div class="text-4xl text-zinc-600">:(</div>
  {/if}

  {#if type === "image"}
    <img
      src={url}
      alt=""
      class="min-h-8 max-h-full object-contain transition-opacity"
      class:opacity-0={!isLoaded}
      bind:this={image}
      on:load={loaded}
      on:error={error}
    />
  {:else if type === "video"}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={url} autoplay controls loop class="min-h-8 max-h-full object-contain" />
  {:else}
    <embed src={url} />
  {/if}
</div>
