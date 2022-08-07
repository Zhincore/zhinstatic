<script lang="ts">
  import { page } from "$app/stores";
  import { normalizePath } from "$lib/utils";
  import type { NodeInfo } from "$lib/files";

  export let file: NodeInfo;
</script>

<a href={normalizePath($page.params.path, file.name)} class="link inline-block break-all px-4 py-1">
  {#if "size" in file}{JSON.stringify(file.mime)}{/if}
  {file.name}
</a>
