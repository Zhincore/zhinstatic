<script lang="ts">
  import { browser } from "$app/env";
  import type { FileInfo } from "$server/files";
  import { config } from "$lib/config";

  export let src: string;
  export let file: FileInfo;
  export let fade = true;
  export let loading: "lazy" | "eager" = "lazy";
  export let decoding: "sync" | "async" | "auto" = "async";
  let classes = "";
  export { classes as class };
  export let alt = "";

  export let isLoaded = false;
  export let isError = false;
  let image: HTMLImageElement;

  const keep = !file.mime || config.thumbnails.keepMimes.includes(file.mime);
  const animated = file.mime && config.thumbnails.animatedMimes.includes(file.mime);

  const loaded = () => (isLoaded = true);
  const error = () => (isError = true);
  const getSrc = (width: number, format: string) => `${src}?width=${width}&format=${format}`;
  const getSrcSet = (format: string) =>
    config.thumbnails.widths.map((width) => `${getSrc(width, format)} ${width}w`).join(", ");

  // prefer webp for animated formats
  const formats = animated ? Array.from(new Set(["webp", ...config.thumbnails.formats])) : config.thumbnails.formats;

  $: isComplete = isLoaded || isError;
  $: !isComplete && image && image.complete && loaded();

  $: props = {
    src,
    loading,
    decoding,
    class: `min-h-8 max-h-full object-contain transition-opacity ${classes}`,
  };
</script>

{#if keep}
  <img {alt} {...props} class:opacity-0={fade && !isLoaded} bind:this={image} on:load={loaded} on:error={error} />
{:else}
  <picture>
    {#each formats as format}
      <source type="image/{format}" srcset={getSrcSet(format)} />
    {/each}
    <img {alt} {...props} class:opacity-0={fade && !isLoaded} bind:this={image} on:load={loaded} on:error={error} />
  </picture>
{/if}

{#if !browser}
  <noscript>
    {#if keep}
      <img {alt} {...props} />
    {/if}
  </noscript>
{/if}
