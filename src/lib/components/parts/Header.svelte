<script lang="ts">
  import { fade } from "svelte/transition";
  import { Icon } from "svelte-awesome";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
  import { page } from "$app/stores";
  import DarkmodeToggle from "$elements/DarkmodeToggle.svelte";
  import FileIcon from "$elements/FileIcon.svelte";
  import type { NodeInfo } from "$server/files";
  import { getTypeFromMime } from "$lib/filetype";
  import type { Type } from "$lib/filetype";

  $: nodeInfo = $page.data.node as NodeInfo | undefined;
  let nodeType: Type;
  $: nodeType = nodeInfo && "mime" in nodeInfo ? getTypeFromMime(nodeInfo.mime) : "folder";

  $: isRoot = $page.params.path === "";
  $: fileToolsPromise = nodeType !== "folder" && import("./FileTools.svelte").then((m) => m.default);
</script>

<div class="relative flex items-center px-1 shadow-lg lg:px-4 xl:px-8">
  <a href="." class="link svg inline-block p-3" class:opacity-0={isRoot} class:pointer-events-none={isRoot}>
    <Icon data={faArrowUp} scale={2} />
  </a>

  <FileIcon type={nodeType} scale={1.5} class="w-8 flex-shrink-0" />

  <div
    class="before:overlay relative hidden overflow-hidden pr-2 text-right before:w-4 before:bg-gradient-to-r before:from-zinc-100 before:to-transparent dark:before:from-zinc-900 sm:block"
  >
    <div class="-ml-[100%] whitespace-nowrap pl-4" aria-label={"/" + $page.params.path}>
      {#each $page.params.path.replace(/\/$/, "").split("/") as segment}
        <span aria-hidden="true" transition:fade>/{segment}</span>
      {/each}
    </div>
  </div>

  <div class="invisible w-0 flex-1">Spacer</div>

  {#if fileToolsPromise}
    {#await fileToolsPromise then FileTools}
      <FileTools node={nodeInfo} />
    {/await}
  {/if}

  <DarkmodeToggle />
</div>
