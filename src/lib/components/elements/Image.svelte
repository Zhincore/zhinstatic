<script context="module" lang="ts">
  import { config, breakpoints } from "$lib/config";

  type Breakpoint = keyof typeof breakpoints;
  export type Sizes = { [Key in Breakpoint | ""]?: string };
</script>

<script lang="ts">
  import { browser } from "$app/env";
  import type { FileInfo } from "$server/files";

  export let src: string;
  export let file: FileInfo;
  export let fade = true;
  export let loading: "lazy" | "eager" = "lazy";
  export let decoding: "sync" | "async" | "auto" = "async";
  export let keep = !file.mime || config.thumbnails.keepMimes.includes(file.mime);
  export let sizes: Sizes = { "": "100vw" };
  export let size: number | undefined = undefined;
  export let alt = "";
  let className = "";
  export { className as class };

  export let isLoaded = false;
  export let isError = false;
  let image: HTMLImageElement;

  const animated = file.mime && config.thumbnails.animatedMimes.includes(file.mime);
  // prefer webp for animated formats
  const formats = animated ? Array.from(new Set(["webp", ...config.thumbnails.formats])) : config.thumbnails.formats;

  const loaded = () => (isLoaded = true);
  const error = () => (isError = true);
  const getSrc = (size: number, format: string) => `${src}?file&size=${size}&format=${format}`;
  const getSrcSet = (format: string) =>
    config.thumbnails.widths.map((width) => `${getSrc(width, format)} ${width}w`).join(", ");
  const htmlSizes = Object.entries(sizes)
    .map(([breakpoint, width]) => (breakpoint ? `(min-width: ${breakpoints[breakpoint as Breakpoint]}) ` : "") + width)
    .join(", ");

  $: isComplete = isLoaded || isError;
  $: !isComplete && image && image.complete && loaded();

  $: props = {
    src,
    loading,
    decoding,
    class: `min-h-8 max-h-full object-contain transition-opacity ${className}`,
  };
</script>

{#if keep}
  <img {alt} {...props} class:opacity-0={fade && !isLoaded} bind:this={image} on:load={loaded} on:error={error} />
{:else}
  <picture>
    {#each formats as format}
      <source type="image/{format}" sizes={htmlSizes} srcset={getSrcSet(format)} />
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
