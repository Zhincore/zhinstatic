<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { fade, slide } from "svelte/transition";
  import type { TransitionConfig } from "svelte/transition";
  import { faFile } from "@fortawesome/free-solid-svg-icons/faFile";
  import { Icon } from "svelte-awesome";
  import { browser } from "$app/env";
  import { page, navigating } from "$app/stores";
  import type { FolderInfo, NodeInfo } from "$lib/files";
  import { normalizePath } from "$lib/utils";
  import { ListWindowing } from "$lib/ListWindowing";

  export let node: FolderInfo;

  let sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));

  let windowEl: HTMLElement;
  let itemEl: HTMLElement;
  let listEl: HTMLElement;
  $: listStyle = browser && listEl ? window.getComputedStyle(listEl) : undefined;

  const windowing = new ListWindowing<NodeInfo>(false, sorted);
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
    $navigating ? fade(node, { delay: i * 8 }) : fade(node);

  $: sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
  $: windowing.list = sorted;
  $: windowing.windowEl = windowEl;
  $: windowing.item = itemEl;

  $: itemClass = "link flex flex-col items-center h-32 break-all px-4 py-1";
</script>

<div class="relative h-full overflow-auto" bind:this={windowEl} out:slide={{ duration: 200 }}>
  <div style="height: {$windowing.scrollHeight}px" />

  <ul class="absolute grid grid-cols-6" bind:this={listEl} style="top: {$windowing.offset}px">
    <li class="invisible absolute" bind:this={itemEl}>
      <div class={itemClass}>hello</div>
    </li>

    {#each $windowing.listWindow as file, i (file.name + browser)}
      {@const url = normalizePath($page.params.path, file.name)}
      <li in:navFade={i}>
        <a href={url} class={itemClass}>
          <Icon data={faFile} scale={4} />
          {file.name}
        </a>
      </li>
    {/each}
  </ul>
</div>
