<script lang="ts">
  import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
  import { faFile } from "@fortawesome/free-solid-svg-icons/faFile";
  import { Icon } from "svelte-awesome";
  import type { Type } from "$lib/filetype";

  export let type: Type;
  export let scale = 4;
  export let hide = false;
  let clazz = "";
  export { clazz as class };

  const iconsForTypes: Record<Exclude<Type, undefined>, () => Promise<IconDefinition>> = {
    folder: () => import("@fortawesome/free-solid-svg-icons/faFolder").then((m) => m.faFolder),
    video: () => import("@fortawesome/free-solid-svg-icons/faFileVideo").then((m) => m.faFileVideo),
    image: () => import("@fortawesome/free-solid-svg-icons/faFileImage").then((m) => m.faFileImage),
    audio: () => import("@fortawesome/free-solid-svg-icons/faFileAudio").then((m) => m.faFileAudio),
    archive: () => import("@fortawesome/free-solid-svg-icons/faFileArchive").then((m) => m.faFileArchive),
    pdf: () => import("@fortawesome/free-solid-svg-icons/faFilePdf").then((m) => m.faFilePdf),
    text: () => import("@fortawesome/free-solid-svg-icons/faFileText").then((m) => m.faFileText),
    code: () => import("@fortawesome/free-solid-svg-icons/faFileCode").then((m) => m.faFileCode),
    csv: () => import("@fortawesome/free-solid-svg-icons/faFileCsv").then((m) => m.faFileCsv),
    data: () => import("@fortawesome/free-solid-svg-icons/faDatabase").then((m) => m.faDatabase),
  };

  $: iconData = type ? (iconsForTypes[type] ?? (() => undefined))() : Promise.resolve(faFile);
</script>

{#await iconData}
  <Icon data={faFile} {scale} class="m-4 transition {hide ? 'opacity-0' : ''} {clazz}" />
{:then icon}
  <Icon data={icon} {scale} class="m-4 transition {hide ? 'opacity-0' : ''} {clazz}" />
{/await}
