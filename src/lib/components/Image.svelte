<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let url: string;
  export let fade = true;
  export let classes = "";
  export let alt = "";

  const dispatch = createEventDispatcher();

  let isLoaded = false;
  let isError = false;
  let image: HTMLImageElement;

  const loaded = () => {
    isLoaded = true;
    dispatch("load");
  };
  const error = (ev: Event) => {
    dispatch("error", ev);
    isError = true;
  };

  $: isComplete = isLoaded || isError;
  $: !isComplete && image && image.complete && loaded();
</script>

<img
  src={url}
  {alt}
  class="min-h-8 max-h-full object-contain transition-opacity {classes}"
  class:opacity-0={fade && !isLoaded}
  bind:this={image}
  on:load={loaded}
  on:error={error}
/>
