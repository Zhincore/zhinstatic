<script lang="ts">
  import { faFile } from "@fortawesome/free-solid-svg-icons/faFile";
  import { faFolder } from "@fortawesome/free-solid-svg-icons/faFolder";
  import { faFileImage } from "@fortawesome/free-solid-svg-icons/faFileImage";
  import { faFileVideo } from "@fortawesome/free-solid-svg-icons/faFileVideo";
  import type { NodeInfo, FileInfo } from "$server/files";
  import Image from "$comps/Image.svelte";
  import FileFAIcon from "./FileFAIcon.svelte";

  export let node: NodeInfo;
  export let url: string;
  let classes = "";
  export { classes as class };

  const file = node as FileInfo;

  let thumbnailLoaded = false;

  const type = "size" in node ? node.mime?.split("/")[0] : "folder";
</script>

<div class="relative h-24 w-full text-center {classes}">
  {#if type === "image" || type === "video"}
    <FileFAIcon data={type === "video" ? faFileVideo : faFileImage} hide={thumbnailLoaded} />

    <Image
      src={url}
      {file}
      class="absolute top-1/2 left-1/2 block h-24 -translate-y-1/2 -translate-x-1/2 transform rounded outline outline-0 outline-accent-400 transition-outline group-hover:outline-2"
      bind:isLoaded={thumbnailLoaded}
    />
  {:else}
    <FileFAIcon data={type === "folder" ? faFolder : faFile} hide={thumbnailLoaded} />
  {/if}
</div>
