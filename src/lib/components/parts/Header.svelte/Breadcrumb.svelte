<script lang="ts">
  import { fade } from "svelte/transition";
  import { page } from "$app/stores";

  let segmentEls: HTMLElement[] = [];
  let hovered = -1;

  const setHoveredEv = (i: number) => () => (hovered = i);

  $: pathSegments = $page.params.path.replace(/\/$/, "").split("/");
</script>

<div
  class="-ml-[100%] whitespace-nowrap pl-4"
  aria-label={"/" + $page.params.path}
  on:mouseout={setHoveredEv(-1)}
  on:blur={setHoveredEv(-1)}
>
  {#each pathSegments as segment, i}
    <a
      class="link"
      class:hover={hovered >= i}
      bind:this={segmentEls[i]}
      href={"/" + pathSegments.slice(0, i + 1).join("/")}
      aria-hidden="true"
      on:mouseover={setHoveredEv(i)}
      on:focus={setHoveredEv(i)}
      transition:fade>/{segment}</a
    >
  {/each}
</div>
