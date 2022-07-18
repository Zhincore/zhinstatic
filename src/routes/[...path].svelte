<script lang="ts">
  import type { NodeInfo } from "$lib/files";

  export let path: string;
  export let nodeInfo: NodeInfo;
</script>

<h1 class="text-2xl">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{path}<br />

{#if "files" in nodeInfo}
  <ul>
    {#each nodeInfo.files as file}
      <li>{file.path}</li>
    {/each}
  </ul>
{/if}
