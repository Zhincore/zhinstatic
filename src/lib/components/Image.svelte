<script lang="ts">
  import { browser } from "$app/env";

  export let src: string;
  export let fade = true;
  export let loading: "lazy" | "eager" = "lazy";
  export let decoding: "sync" | "async" | "auto" = "async";
  let classes = "";
  export { classes as class };
  export let alt = "";

  export let isLoaded = false;
  export let isError = false;
  let image: HTMLImageElement;

  const loaded = () => (isLoaded = true);
  const error = () => (isError = true);
  $: isComplete = isLoaded || isError;
  $: !isComplete && image && image.complete && loaded();
</script>

<img
  {src}
  {alt}
  {loading}
  {decoding}
  class="min-h-8 max-h-full object-contain transition-opacity {classes}"
  class:opacity-0={fade && !isLoaded}
  bind:this={image}
  on:load={loaded}
  on:error={error}
/>

{#if !browser}
  <noscript>
    <img {src} {alt} {loading} {decoding} class="min-h-8 max-h-full object-contain {classes}" />
  </noscript>
{/if}
