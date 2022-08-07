<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade, slide } from "svelte/transition";
  import type { TransitionConfig } from "svelte/transition";
  import { browser } from "$app/env";
  import type { FolderInfo, NodeInfo } from "$lib/files";
  import { navigating } from "$app/stores";
  import { ScrollWindow } from "$lib/windowing";
  import FileItem from "$comps/FileItem.svelte";

  export let node: FolderInfo;

  const COLUMNS = 1;

  let sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

  const listWindow = new ScrollWindow<NodeInfo>(false, sorted);

  let windowEl: HTMLElement;
  let itemEl: HTMLElement;

  onMount(() => {
    listWindow.start();
  });

  onDestroy(() => {
    listWindow.stop();
  });

  const navFade = (node: Element, i: number): TransitionConfig =>
    $navigating ? fade(node, { delay: i * 8 }) : fade(node);

  $: sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  $: listWindow.list = sorted;
  $: listWindow.windowEl = windowEl;
  $: listWindow.item = itemEl;
</script>

<div class="h-full overflow-auto relative" bind:this={windowEl} out:slide={{ duration: 200 }}>
  <div style="height: {$listWindow.scrollHeight}px" />

  <ul class="absolute" style="top: {$listWindow.offset}px">
    <li class="absolute invisible" bind:this={itemEl}>
      <div class="link inline-block break-all px-4 py-1">hello</div>
    </li>

    {#each $listWindow.listPage as file, i (file.name + browser)}
      <li in:navFade={i}><FileItem {file} /></li>
    {/each}
  </ul>
</div>
