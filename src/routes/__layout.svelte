<script lang="ts">
  import { Icon } from "svelte-awesome";
  import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
  import { page } from "$app/stores";
  import "../app.css";
</script>

<div>
  <a href="." class="link inline-block p-3 transition" class:opacity-0={!$page.params.path}>
    <Icon data={faArrowUp} scale={1.5} />
  </a>

  {"/" + $page.params.path}
</div>

<slot />
