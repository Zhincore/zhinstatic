<script lang="ts">
  import { page } from "$app/stores";
  import { normalizePath } from "$lib/utils";
  import type { FileInfo } from "$lib/files";

  export let node: FileInfo;
  let isLoaded = false;
  let isError = false;

  $: url = normalizePath($page.params.path);
  $: type = node.mime?.split("/")[0];

  const loaded = () => (isLoaded = true);
  const error = () => (isError = true);
</script>

<div class="h-full flex justify-center items-center pb-2">
  <svg
    viewBox="0 0 900 900"
    width="256"
    xmlns="http://www.w3.org/2000/svg"
    class="absolute -z-10 transition-opacity"
    class:opacity-0={isLoaded || isError}
  >
    <defs>
      <polygon
        id="hexagon"
        points="300,150 225,280 75,280 0,150 75,20 225,20"
        fill="none"
        stroke="orange"
        stroke-width="1%"
        pathLength="6"
        stroke-dasharray="2 4"
        filter="drop-shadow(0 0 8pt orange)"
      >
        <animate attributeName="stroke-dashoffset" by="-6" dur="1s" repeatCount="indefinite" />
      </polygon>
    </defs>

    <use href="#hexagon" x="375" y="170" stroke-dashoffset="-4" />
    <use href="#hexagon" x="150" y="300" stroke-dashoffset="0" />
    <use href="#hexagon" x="375" y="430" stroke-dashoffset="4" />
  </svg>

  {#if isError}
    <div class="text-4xl text-zinc-600">:(</div>
  {/if}

  {#if type === "image"}
    <img
      src={url}
      alt=""
      class="max-h-full min-h-8 object-contain transition-opacity"
      class:opacity-0={!isLoaded}
      on:load={loaded}
      on:error={error}
    />
  {:else if type === "video"}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={url} autoplay controls loop class="max-h-full min-h-8 object-contain" />
  {:else}
    <embed src={url} />
  {/if}
</div>
