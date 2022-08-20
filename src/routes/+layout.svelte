<script lang="ts">
  import Header from "$lib/components/parts/Header.svelte";
  import "../app.css";
</script>

<div
  class="flex h-screen w-screen flex-col bg-zinc-100 text-zinc-900 transition-colors duration-300 dark:bg-zinc-900 dark:text-zinc-200"
>
  <Header />

  <div class="relative flex-1">
    <slot />
  </div>
</div>
