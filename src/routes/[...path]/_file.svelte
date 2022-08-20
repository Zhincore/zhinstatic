<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { faCircleDown } from "@fortawesome/free-solid-svg-icons/faCircleDown";
  import { faAngleLeft } from "@fortawesome/free-solid-svg-icons/faAngleLeft";
  import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
  import { Icon } from "svelte-awesome";
  import { getNeighbourFiles } from "$lib/neighbourFiles";
  import { getTypeFromMime } from "$lib/filetype";
  import type { FileInfo } from "$server/files";
  import Loader from "$elements/Loader.svelte";
  import FileIcon from "$elements/FileIcon.svelte";
  import Image from "$elements/Image.svelte";

  export let node: FileInfo;
  export let path: string;
  const type = getTypeFromMime(node.mime);
  const loadable = ["image", "video", "audio", "code"].includes(type as string);
  const dirpath = path.split("/").slice(0, -1).join("/");

  const neighbourButtons: [HTMLElement | undefined, HTMLElement | undefined] = [undefined, undefined];
  let neighbours: [string | undefined, string | undefined] = [undefined, undefined];
  let isLoaded = !loadable;
  let isError = false;

  onMount(async () => {
    const _neighbours = await getNeighbourFiles(path);
    if (_neighbours) neighbours = _neighbours;
  });

  const onkeydown = (ev: KeyboardEvent) => {
    if (ev.key === "ArrowLeft") neighbourButtons[0]?.click();
    else if (ev.key === "ArrowRight") neighbourButtons[1]?.click();
  };

  $: isDone = isLoaded || isError;
  $: src = path + "?file";
</script>

<svelte:window on:keydown={onkeydown} />

<div class="flex h-full items-center justify-center" transition:fade={{ duration: 200 }}>
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
      class="max-h-full min-w-full max-w-full transition-opacity md:min-w-1/2"
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
      class="max-h-full min-w-full max-w-full md:min-w-1/2"
      on:canplay={() => (isLoaded = true)}
      on:error={() => (isError = true)}
    />
  {:else if type === "audio"}
    {#await import("$lib/components/parts/AudioPlayer.svelte") then { default: AudioPlayer }}
      <AudioPlayer {src} autoplay class="min-w-full md:min-w-1/2" bind:isLoaded bind:isError />
    {/await}
  {:else if node.mime === "text/html"}
    <iframe loading="async" {src} title={node.name} class="h-full w-full" on:load={() => (isLoaded = true)} />
  {:else if type === "code" || type === "text"}
    {#await import("$lib/components/parts/Code.svelte") then { default: Code }}
      <Code {src} bind:isLoaded bind:isError />
    {/await}
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

  {#each neighbours as neighbour, i}
    {#if neighbour}
      <a
        href={`${dirpath}/${neighbour}`}
        title={i ? "Next file" : "Previous file"}
        class="absolute bottom-0 p-4 opacity-50 transition hover:opacity-90"
        class:left-0={!i}
        class:right-0={i}
        bind:this={neighbourButtons[i]}
      >
        <Icon data={i ? faAngleRight : faAngleLeft} scale={2} />
      </a>
    {/if}
  {/each}
</div>
