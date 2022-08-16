<script lang="ts">
  import { fade } from "svelte/transition";
  import { faCircleDown } from "@fortawesome/free-solid-svg-icons/faCircleDown";
  import { Icon } from "svelte-awesome";
  import type { FileInfo } from "$server/files";
  import Loader from "$elements/Loader.svelte";
  import FileIcon from "$elements/FileIcon.svelte";
  import Image from "$elements/Image.svelte";
  import { getTypeFromMime } from "$lib/filetype";

  export let node: FileInfo;
  export let path: string;
  const type = getTypeFromMime(node.mime);

  let isLoaded = false;
  let isError = false;

  $: isComplete = isLoaded || isError;
  $: src = path + "?file";
</script>

<div class="flex h-full items-center justify-center pb-2" transition:fade={{ duration: 200 }}>
  <div class="absolute -z-10 transition-opacity" class:opacity-0={isComplete}><Loader /></div>

  {#if isError}
    <div class="absolute-centered text-4xl text-zinc-600">:(</div>
  {/if}

  {#if type === "image"}
    <Image
      keep
      file={node}
      {src}
      alt=""
      class="max-h-full min-w-1/2 max-w-full object-contain transition-opacity"
      bind:isError
      bind:isLoaded
    />
  {:else if type === "video"}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video {src} autoplay controls loop class="max-h-full min-w-1/2 max-w-full object-contain" />
  {:else if type === "audio"}
    <audio {src} controls class="min-w-1/2 max-w-full" />
  {:else if node.mime === "text/html"}
    <iframe {src} title={node.name} class="h-full w-full" />
  {:else if ["archive", "data", undefined].includes(type)}
    <a href={src} download={node.name} class="link flex flex-col items-center">
      <div class="relative">
        <FileIcon {type} scale={8} class="opacity-75" />
        <div class="absolute bottom-0 right-0 rounded-full bg-zinc-100 dark:bg-zinc-900">
          <Icon data={faCircleDown} scale={3} class="scale-105 transform drop-shadow-lg" />
        </div>
      </div>

      <div class="mt-4 text-xl">{node.name}</div>
    </a>
  {:else}
    <object type={node.mime} data={src} title={node.name} class="h-full w-full" />
  {/if}
</div>
