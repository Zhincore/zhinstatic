<script lang="ts">
  import { page } from "$app/stores";
  import { normalizePath } from "$lib/utils";
  import type { FileInfo } from "$lib/files";

  export let node: FileInfo;
  let isLoaded = false;

  $: url = normalizePath($page.params.path);
  $: type = node.mime?.split("/")[0];

  const loaded = () => (isLoaded = true);
</script>

<time>{new Date(node.mtime).toLocaleString()}</time>

<div class="flex-1 flex justify-center items-center overflow-hidden">
  <svg
    viewBox="0 0 900 900"
    width="256"
    xmlns="http://www.w3.org/2000/svg"
    class="stroke-accent transition absolute"
    class:opacity-0={isLoaded}
  >
    <defs>
      <polygon
        id="hexagon"
        points="300,150 225,280 75,280 0,150 75,20 225,20"
        fill="none"
        stroke-width="1%"
        pathLength="6"
        stroke-dasharray="4 2"
      >
        <animate
          attributeName="stroke-dashoffset"
          by="-6"
          dur="2s"
          calcMode="spline"
          keySplines="0.5 0.1 0.7 0.9"
          repeatCount="indefinite"
        />
      </polygon>
    </defs>

    <use href="#hexagon" x="375" y="170" stroke-dashoffset="-3" />
    <use href="#hexagon" x="150" y="300" stroke-dashoffset="-1" />
    <use href="#hexagon" x="375" y="430" stroke-dashoffset="1" />
  </svg>

  {#if type === "image"}
    <img
      src={url}
      alt=""
      class="max-h-full min-h-8 object-contain transition"
      class:opacity-0={!isLoaded}
      on:load={loaded}
    />
  {:else if type === "video"}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video src={url} autoplay controls loop class="max-h-full min-h-8 object-contain" />
  {:else}
    <embed src={url} />
  {/if}
</div>
