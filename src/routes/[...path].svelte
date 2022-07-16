<script lang="ts">
  export let path: string;

  import { page } from "$app/stores";
  import Folder from "./_folder.svelte";
</script>

<h1 class="text-2xl">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<Folder />
