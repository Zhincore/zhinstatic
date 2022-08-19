<script lang="ts">
  import { fade } from "svelte/transition";
  import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
  import { Icon } from "svelte-awesome";
  import type { NodeInfo, FileInfo } from "$server/files";
  import Image from "$elements/Image.svelte";
  import type { Sizes } from "$elements/Image.svelte";
  import { getTypeFromMime } from "$lib/filetype";
  import FileIcon from "$elements/FileIcon.svelte";

  export let node: NodeInfo;
  export let url: string;
  export let sizes: Sizes | undefined = undefined;
  let className = "";
  export { className as class };

  let thumbnailLoaded = false;

  const file = node as FileInfo;
  const type = "mime" in node ? getTypeFromMime(node.mime) : "folder";
</script>

<div class="relative h-24 w-full text-center {className}">
  <FileIcon {type} hide={thumbnailLoaded} class="m-4" />

  {#if type === "image" || type === "video"}
    {#if type === "video" && thumbnailLoaded}
      <div transition:fade class="absolute-centered z-10 opacity-80 drop-shadow transition">
        <Icon data={faPlay} scale={3} />
      </div>
    {/if}

    <Image
      src={url}
      {file}
      {sizes}
      class="absolute-centered block h-24 rounded outline outline-0 outline-accent-400 transition-outline group-hover:outline-2"
      bind:isLoaded={thumbnailLoaded}
    />
  {/if}
</div>
