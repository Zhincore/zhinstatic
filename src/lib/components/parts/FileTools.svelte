<script lang="ts">
  import { createPopperActions } from "svelte-popperjs";
  import { fade, slide } from "svelte/transition";
  import { faCircleInfo } from "@fortawesome/free-solid-svg-icons/faCircleInfo";
  import { faCircleXmark } from "@fortawesome/free-solid-svg-icons/faCircleXmark";
  import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
  import { Icon } from "svelte-awesome";
  import bytes from "bytes";
  import { page } from "$app/stores";
  import type { FileInfo } from "$server/files";
  import { onClickOutside } from "$lib/onClickOutside";

  $: nodeInfo = $page.data.node as FileInfo;
  $: src = $page.data.path + "?file";

  let arrowEl: Element;

  const [popperRef, popperContent] = createPopperActions({
    placement: "bottom",
    strategy: "fixed",
  });

  let infoShown = false;
</script>

<a transition:fade class="link mx-2 p-2" href={src} download={nodeInfo.name} title="Download file">
  <Icon data={faDownload} scale={2} />
</a>

<div transition:fade use:onClickOutside={() => (infoShown = false)} class="relative">
  <button
    use:popperRef
    class="link mx-2 p-2"
    on:click={() => (infoShown = !infoShown)}
    title={infoShown ? "Hide file info" : "Show file info"}
  >
    <Icon data={infoShown ? faCircleXmark : faCircleInfo} scale={2} />
  </button>

  {#if infoShown}
    <div
      use:popperContent={{ modifiers: [{ name: "arrow", options: { element: arrowEl } }] }}
      class="z-50 max-w-full overflow-hidden"
    >
      <div
        bind:this={arrowEl}
        transition:slide
        class="absolute bottom-full border-x-8 border-b-8 border-x-transparent border-b-zinc-200 dark:border-b-zinc-700"
      />

      <dl
        transition:slide
        class="grid grid-cols-[max-content_auto] gap-1 gap-x-4 break-all rounded-xl bg-zinc-200 p-4 shadow-xl transition-colors dark:bg-zinc-700"
      >
        <dt class="font-medium">File name</dt>
        <dd>{nodeInfo.name}</dd>

        <dt class="font-medium">Type</dt>
        <dd>
          {#if nodeInfo.mime}{nodeInfo.mime}{:else}<span class="italic">unknown</span>{/if}
        </dd>

        <dt class="font-medium">Size</dt>
        <dd>
          {bytes(nodeInfo.size)}
        </dd>

        <dt class="font-medium">Last modified</dt>
        <dd>
          {new Date(nodeInfo.mtime).toLocaleString()}
        </dd>
      </dl>
    </div>
  {/if}
</div>
