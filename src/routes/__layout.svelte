<script lang="ts">
  import { Icon } from "svelte-awesome";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
  import { darkmode } from "$lib/darkmode";
  import { page } from "$app/stores";
  import "../app.css";
</script>

<div class="flex h-screen flex-col dark:bg-zinc-900 dark:text-zinc-200">
  <div>
    <a
      href="."
      class="link inline-block p-3 transition"
      class:opacity-0={!$page.params.path}
      class:pointer-events-none={!$page.params.path}
    >
      <Icon data={faArrowUp} scale={2} />
    </a>

    <span class="break-words">{"/" + $page.params.path}</span>
  </div>

  <div class="relative flex-1 overflow-hidden">
    <slot />
  </div>
</div>
