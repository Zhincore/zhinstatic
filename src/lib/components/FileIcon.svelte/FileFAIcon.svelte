<script lang="ts">
  import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
  import { Icon } from "svelte-awesome";

  export let data: IconDefinition;
  export let hide = false;
</script>

<Icon {data} scale={4} class="m-4 transition-opacity {hide ? 'opacity-0' : ''}" />
