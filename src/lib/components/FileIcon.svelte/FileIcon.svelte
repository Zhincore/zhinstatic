<script lang="ts">
  import { faFile } from "@fortawesome/free-solid-svg-icons/faFile";
  import { faFolder } from "@fortawesome/free-solid-svg-icons/faFolder";
  import { faFileImage } from "@fortawesome/free-solid-svg-icons/faFileImage";
  import { faFileVideo } from "@fortawesome/free-solid-svg-icons/faFileVideo";
  import type { NodeInfo } from "$server/files";
  import Image from "$comps/Image.svelte";
  import FileFAIcon from "./FileFAIcon.svelte";

  export let file: NodeInfo;
  export let url: string;
  let classes = "";
  export { classes as class };

  let thumbnailLoaded = false;

  const type = "size" in file ? file.mime?.split("/")[0] : "folder";
</script>

<div class="relative h-24 w-full text-center {classes}">
  {#if type === "image" || type === "video"}
    <FileFAIcon data={type === "video" ? faFileVideo : faFileImage} hide={thumbnailLoaded} />

    <Image
      src={url}
      class="absolute top-1/2 left-1/2 block h-24 -translate-y-1/2 -translate-x-1/2 transform rounded outline-accent-400 transition group-hover:outline"
      bind:isLoaded={thumbnailLoaded}
    />
  {:else}
    <FileFAIcon data={type === "folder" ? faFolder : faFile} hide={thumbnailLoaded} />
  {/if}
</div>
