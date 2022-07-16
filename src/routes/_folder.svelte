<script lang="ts">
  export let folder: boolean;

  import { page } from "$app/stores";
</script>

<h1 class="text-2xl">Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{$page.url}
{folder}
