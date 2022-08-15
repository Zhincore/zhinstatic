<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import { fade } from "svelte/transition";
  import type { TransitionConfig } from "svelte/transition";
  import type Fuse from "fuse.js";
  import { browser } from "$app/env";
  import { navigating } from "$app/stores";
  import type { FolderInfo, NodeInfo } from "$server/files";
  import { normalizePath } from "$lib/utils";
  import { sortFileNodes } from "$lib/sorting";
  import { ListWindowing } from "$lib/ListWindowing";
  import scrollRestore from "$lib/scrollRestore";
  import FileIcon from "$lib/components/FileIcon.svelte/FileIcon.svelte";
  import type { Sizes } from "$comps/Image.svelte";
  import FolderTools from "$comps/FolderTools.svelte";

  export let node: FolderInfo;
  export let path: string;

  let sorted = sortFileNodes(node.files);

  let windowEl: HTMLElement;
  let itemEl: HTMLElement;
  let listEl: HTMLElement;
  let itemClass: string;
  let fuse: Fuse<NodeInfo>;
  let search = "";
  $: listStyle = browser && listEl ? window.getComputedStyle(listEl) : undefined;

  const windowing = new ListWindowing<NodeInfo>({ autoStart: false, list: sorted });
  windowing.on("preupdate", () => {
    windowing.columns = listStyle?.gridTemplateColumns.split(" ").length ?? 1;
  });

  onMount(() => {
    windowing.start();

    windowing.once("update", () => tick().then(() => windowEl.scrollTo({ top: scrollRestore.getPathScroll(path) })));
  });

  onDestroy(() => {
    windowing.stop();
  });

  const navFade = (node: Element, i: number): TransitionConfig =>
    $navigating ? fade(node, { delay: i * 8, duration: 100 }) : fade(node);

  $: if (search && !fuse)
    import("fuse.js").then(({ default: Fuse }) => (fuse = new Fuse(sorted, { keys: ["name", "mime"] })));

  $: if (fuse) fuse.setCollection(node.files);
  $: sortedList = search && fuse ? fuse.search(search).map((item) => item.item) : sortFileNodes(node.files);

  $: windowing.list = sortedList;
  $: windowing.windowEl = windowEl;
  $: windowing.item = itemEl;
  $: if ($navigating?.from.pathname === path && windowEl) scrollRestore.setPathScroll(path, windowEl.scrollTop);

  $: itemClass = "link group flex h-40 flex-col items-center break-all";

  const sizes: Sizes = { "": "192px" };
</script>

<FolderTools bind:search />

<div class="relative h-full w-full overflow-y-auto" bind:this={windowEl}>
  <ul
    class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-8"
    bind:this={listEl}
  >
    <li class="invisible absolute" bind:this={itemEl}>
      <div class={itemClass}>Sizer</div>
    </li>

    {#if !browser || $windowing.ready}
      {#each $windowing.listWindow as { data: file, ...pos }, i (file.name)}
        {@const url = normalizePath(path, file.name)}
        <li
          class="p-4"
          class:absolute={$windowing.ready}
          style={$windowing.ready ? `top: ${pos.offsetTop}px; left: ${pos.offsetLeft}px; width: ${pos.width}px` : ""}
        >
          <a href={url} class={itemClass} transition:navFade={i}>
            <FileIcon node={file} {url} {sizes} class="" />
            <div class="mt-2 max-h-12 max-w-full overflow-hidden text-ellipsis text-center">{file.name}</div>
          </a>
        </li>
      {/each}
    {/if}
  </ul>

  <div style:height="{$windowing.scrollHeight}px" />
</div>
