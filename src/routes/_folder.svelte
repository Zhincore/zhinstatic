<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import type { TransitionConfig } from "svelte/transition";
  import { browser } from "$app/env";
  import { navigating } from "$app/stores";
  import type { FolderInfo, NodeInfo } from "$server/files";
  import { normalizePath } from "$lib/utils";
  import { ListWindowing } from "$lib/ListWindowing";
  import FileIcon from "$lib/components/FileIcon.svelte/FileIcon.svelte";

  export let node: FolderInfo;
  export let path: string;

  let sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

  let windowEl: HTMLElement;
  let itemEl: HTMLElement;
  let listEl: HTMLElement;
  let itemClass: string;
  $: listStyle = browser && listEl ? window.getComputedStyle(listEl) : undefined;

  const windowing = new ListWindowing<NodeInfo>({ autoStart: false, list: sorted });
  windowing.on("preupdate", () => {
    windowing.columns = listStyle?.gridTemplateColumns.split(" ").length ?? 1;
  });

  onMount(() => {
    windowing.start();
  });

  onDestroy(() => {
    windowing.stop();
  });

  const navFade = (node: Element, i: number): TransitionConfig =>
    $navigating ? fade(node, { delay: i * 8, duration: 100 }) : fade(node);

  $: sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  $: windowing.list = sorted;
  $: windowing.windowEl = windowEl;
  $: windowing.item = itemEl;

  $: itemClass = "link group flex h-40 flex-col items-center break-all px-4 py-1";
</script>

<div class="relative h-full overflow-auto" bind:this={windowEl}>
  <div style:height="{$windowing.scrollHeight}px" />

  <ul class="grid w-full grid-cols-8" bind:this={listEl}>
    <li class="invisible absolute" bind:this={itemEl}>
      <div class={itemClass}>Sizer</div>
    </li>

    {#if !browser || $windowing.ready}
      {#each $windowing.listWindow as { data: file, ...pos }, i (file.name)}
        {@const url = normalizePath(path, file.name)}
        <li
          class:absolute={$windowing.ready}
          style={$windowing.ready ? `top: ${pos.offsetTop}px; left: ${pos.offsetLeft}%; width: ${pos.width}%` : ""}
        >
          <a href={url} class={itemClass} transition:navFade={i}>
            <FileIcon {file} {url} class="" />
            <div class="mt-2 overflow-hidden text-center">{file.name}</div>
          </a>
        </li>
      {/each}
    {/if}
  </ul>
</div>
