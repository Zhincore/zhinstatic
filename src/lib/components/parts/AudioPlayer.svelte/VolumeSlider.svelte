<script lang="ts">
  import { createPopperActions } from "svelte-popperjs";
  import { faVolumeHigh } from "@fortawesome/free-solid-svg-icons/faVolumeHigh";
  import { Icon } from "svelte-awesome";
  import { onClickOutside } from "$lib/onClickOutside";

  export let volume = 1;
  let className = "";
  export { className as class };

  let slider: HTMLElement;
  let shown = false;
  let holding = false;

  const [popperRef, popperContent] = createPopperActions({
    placement: "top",
    strategy: "fixed",
  });

  const onClick = (ev: MouseEvent) => {
    const rect = slider.getBoundingClientRect();
    volume = 1 - (ev.pageY - (rect.y || rect.top)) / rect.height;
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    let newVolume = volume;

    if (ev.key === "ArrowUp") newVolume += 0.05;
    else if (ev.key === "ArrowDown") newVolume -= 0.05;
    else return;

    volume = Math.min(1, Math.max(0, newVolume));

    ev.stopPropagation();
  };
</script>

<svelte:window on:mouseup={() => (holding = false)} />

<div use:onClickOutside={() => (shown = false)} class="relative">
  <button use:popperRef class={className} on:click={() => (shown = !shown)}>
    <Icon data={faVolumeHigh} scale={1.5} />
  </button>

  {#if shown}
    <div use:popperContent class="rounded-lg bg-zinc-300 p-2 dark:bg-zinc-700">
      <div
        bind:this={slider}
        on:click={onClick}
        on:mousedown={() => (holding = true)}
        on:mousemove={(ev) => holding && onClick(ev)}
        on:keydown={onKeyDown}
        tabIndex="0"
        aria-valuetext="audio volume"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={volume * 100}
        role="slider"
        class="relative h-20 w-2 flex-1 cursor-pointer overflow-hidden rounded-lg bg-zinc-400 dark:bg-zinc-600"
      >
        <div class="absolute bottom-0 w-full rounded-lg bg-accent-400 " style:height={`${volume * 100}%`} />
      </div>
    </div>
  {/if}
</div>
