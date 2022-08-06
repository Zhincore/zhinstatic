<script lang="ts">
  import { Icon } from "svelte-awesome";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
  import { page } from "$app/stores";
  import { darkmode } from "$lib/darkmode";
  import "../app.css";
</script>

<div class="flex flex-col h-screen dark:bg-zinc-900 dark:text-zinc-200">
  <div>
    <a
      href="."
      class="link inline-block p-3 transition"
      class:opacity-0={!$page.params.path}
      class:pointer-events-none={!$page.params.path}
    >
      <Icon data={faArrowUp} scale={2} />
    </a>

    {"/" + $page.params.path}
  </div>

  <div class="flex-1 overflow-hidden relative">
    <slot />
  </div>
</div>
