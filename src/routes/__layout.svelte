<script lang="ts">
  import { Icon } from "svelte-awesome";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
  import { page } from "$app/stores";
  import DarkmodeToggle from "$comps/DarkmodeToggle.svelte";
  import "../app.css";

  $: isRoot = $page.params.path === "";
</script>

<div
  class="flex h-screen w-screen flex-col bg-zinc-100 text-zinc-900 transition-colors duration-300 dark:bg-zinc-900 dark:text-zinc-200"
>
  <div class="sticky flex items-center px-1 lg:px-4 xl:px-8">
    <a href="." class="link svg inline-block p-3" class:opacity-0={isRoot} class:pointer-events-none={isRoot}>
      <Icon data={faArrowUp} scale={2} />
    </a>

    <div
      class="before:overlay relative overflow-hidden pr-2 text-right before:w-4 before:bg-gradient-to-r before:from-zinc-100  before:to-transparent dark:before:from-zinc-900"
    >
      <div class="-ml-[100%] whitespace-nowrap pl-4">
        {"/" + $page.params.path}
      </div>
    </div>

    <div class="flex-1" />

    <DarkmodeToggle />
  </div>

  <div class="relative flex-1">
    <slot />
  </div>
</div>
