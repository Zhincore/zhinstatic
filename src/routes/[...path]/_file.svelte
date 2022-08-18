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

  const loadable = ["image", "video", "audio", "code"].includes(type as string);

  let isLoaded = !loadable;
  let isError = false;

  $: isDone = isLoaded || isError;
  $: src = path + "?file";
  $: promiseCode =
    (type === "code" || type === "text") && import("$lib/components/parts/Code.svelte").then((m) => m.default);
</script>

<div class="flex h-full items-center justify-center pb-2" transition:fade={{ duration: 200 }}>
  {#if !isDone}
    <div class="absolute-centered z-10 transition-opacity" transition:fade><Loader /></div>
  {/if}

  {#if isError || ["archive", "data", undefined].includes(type)}
    <!-- Download -->
    <a href={src} download={node.name} class="link flex flex-col items-center">
      <div class="relative">
        <FileIcon {type} scale={8} class="opacity-75" />
        <div class="absolute bottom-0 right-0 rounded-full bg-zinc-100 dark:bg-zinc-900">
          <Icon data={faCircleDown} scale={3} class="scale-105 transform drop-shadow-lg" />
        </div>
      </div>

      <div class="mt-4 text-xl">{node.name}</div>
    </a>
  {:else if type === "image"}
    <Image
      keep
      file={node}
      {src}
      alt=""
      class="max-h-full min-w-1/2 max-w-full transition-opacity"
      bind:isError
      bind:isLoaded
    />
  {:else if type === "video"}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      {src}
      autoplay
      controls
      loop
      class="max-h-full min-w-1/2 max-w-full"
      on:canplay={() => (isLoaded = true)}
      on:error={() => (isError = true)}
    />
  {:else if type === "audio"}
    <audio
      {src}
      autoplay
      controls
      class="min-w-1/2 max-w-full"
      on:canplay={() => (isLoaded = true)}
      on:error={() => (isError = true)}
    />
  {:else if node.mime === "text/html"}
    <iframe loading="async" {src} title={node.name} class="h-full w-full" on:load={() => (isLoaded = true)} />
  {:else if type === "code" || type === "text"}
    {#if promiseCode}
      {#await promiseCode then Code}
        <Code {src} bind:isLoaded bind:isError />
      {/await}
    {/if}
  {:else}
    <object
      type={node.mime}
      data={src}
      title={node.name}
      class="h-full w-full"
      on:load={() => (isLoaded = true)}
      on:error={() => (isError = true)}
    />
  {/if}
</div>
