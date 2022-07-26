<script lang="ts">
  import { Icon } from "svelte-awesome";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
  import { page } from "$app/stores";
  import DarkmodeToggle from "$elements/DarkmodeToggle.svelte";
  import FileIcon from "$elements/FileIcon.svelte";
  import type { NodeInfo } from "$server/files";
  import { getTypeFromMime } from "$lib/filetype";
  import type { Type } from "$lib/filetype";
  import Breadcrumb from "./Breadcrumb.svelte";

  let backButton: HTMLElement;
  let nodeType: Type;

  const onkeydown = (ev: KeyboardEvent) => {
    if (ev.key === "Escape" && backButton) backButton.click();
  };

  $: nodeInfo = $page.data.node as NodeInfo | undefined;
  $: nodeType = nodeInfo && "mime" in nodeInfo ? getTypeFromMime(nodeInfo.mime) : "folder";

  $: isRoot = $page.params.path === "";
  $: fileToolsPromise = nodeType !== "folder" && import("./FileTools.svelte").then((m) => m.default);
</script>

<svelte:window on:keydown={onkeydown} />

<div class="relative flex items-center px-1 py-1 shadow-lg lg:px-4 xl:px-6">
  <a
    href="."
    class="link svg inline-block p-3"
    class:opacity-0={isRoot}
    class:pointer-events-none={isRoot}
    bind:this={backButton}
  >
    <Icon data={faArrowUp} scale={1.6} />
  </a>

  <FileIcon type={nodeType} scale={1} class="relative z-10 ml-2 -mr-1 w-4 flex-shrink-0" />

  <div
    class="before:overlay relative hidden overflow-hidden pr-2 text-right before:w-4 before:bg-gradient-to-r before:from-zinc-100 before:to-transparent dark:before:from-zinc-900 sm:block"
  >
    <Breadcrumb />
  </div>

  <div class="invisible w-0 flex-1">Spacer</div>

  {#if fileToolsPromise}
    {#await fileToolsPromise then FileTools}
      <FileTools node={nodeInfo} />
    {/await}
  {/if}

  <DarkmodeToggle />
</div>
