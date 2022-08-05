<script lang="ts">
  import { page } from "$app/stores";
  import { normalizePath } from "$lib/utils";
  import type { FolderInfo } from "$lib/files";

  export let node: FolderInfo;

  $: sorted = [...node.files].sort((a, b) => a.name.localeCompare(b.name));
</script>

<ul>
  {#each sorted as file, i}
    <li>
      <a href={normalizePath($page.params.path, file.name)} class="link inline-block px-4 py-1 break-all">
        {#if "size" in file}{JSON.stringify(file.mime)}{/if}
        {file.name}
      </a>
    </li>
  {/each}
</ul>
