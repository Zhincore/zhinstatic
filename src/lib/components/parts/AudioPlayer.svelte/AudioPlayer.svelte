<script lang="ts" context="module">
  import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
  import { faPause } from "@fortawesome/free-solid-svg-icons/faPause";
  import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
  import { faWaveSquare } from "@fortawesome/free-solid-svg-icons/faWaveSquare";
  import { faChartSimple } from "@fortawesome/free-solid-svg-icons/faChartSimple";
  import { faRepeat } from "@fortawesome/free-solid-svg-icons/faRepeat";
  import { Icon } from "svelte-awesome";
  import formatDuration from "format-duration";
  import { PersistentStore } from "$lib/PersistentStore";
  import RadioSelect from "$elements/RadioSelect.svelte";
  import Visualizer from "./Visualizer.svelte";
  import type { VisualizerMode } from "./Visualizer.svelte";
  import VolumeSlider from "./VolumeSlider.svelte";

  const vismode = PersistentStore<VisualizerMode>("zhinaudio-vismode", "none");
  const volume = PersistentStore("zhinaudio-volume", 1);
</script>

<script lang="ts">
  export let src: string;
  export let autoplay = false;
  let className = "";
  export { className as class };

  export let isLoaded = false;
  export let isError = false;

  let audio: HTMLAudioElement;
  let seeker: HTMLElement;
  let loop = false;
  let playing = false;
  let currentTime = 0;
  let duration = 0.1;
  let range = [0, 0];

  const onSeekerClick = (ev: MouseEvent) => {
    const rect = seeker.getBoundingClientRect();
    const pos = (ev.pageX - (rect.x || rect.left)) / rect.width;
    audio.currentTime = audio.duration * pos;
  };

  const onSeekerKeyDown = (ev: KeyboardEvent) => {
    ev.stopPropagation();
    let percentage = audio.currentTime / audio.duration;
    switch (ev.key) {
      case "ArrowLeft":
        percentage -= 0.01;
        break;
      case "ArrowRight":
        percentage += 0.01;
        break;
      case "ArrowUp":
        percentage += 0.1;
        break;
      case "ArrowDown":
        percentage -= 0.1;
        break;
      case "Home":
        percentage = 0;
        break;
      case "End":
        percentage = 99.9; // 100 would trigger onEnd, so only 99.9
        break;
      default:
        break;
    }

    audio.currentTime = audio.duration * Math.max(0, Math.min(1, percentage));
  };

  const onTimeUpdate = () => {
    currentTime = audio.currentTime;
    onProgress();
  };

  const onProgress = () => {
    const { buffered } = audio;
    for (let i = buffered.length - 1; i >= 0; i--) {
      const start = buffered.start(i);
      if (start < audio.currentTime) {
        range = [start / audio.duration, (buffered.end(i) - start) / audio.duration];
        return;
      }
    }
  };

  $: if (audio) audio.loop = loop;
  // $: if (audio) audio.volume = Math.max(0, Math.min(1, $volume)); // Visualizer sets volume
  $: if (autoplay && isLoaded && audio) audio.play().catch(console.warn);
  $: if (audio && !isLoaded && audio.readyState >= audio.HAVE_CURRENT_DATA) {
    // Loaded too fast
    isLoaded = true;
    currentTime = audio.currentTime;
    duration = audio.duration;
    onProgress();
  }
</script>

<div class={className}>
  <RadioSelect class="m-2" options={["none", "waveform", "bars"]} let:value bind:chosen={$vismode}>
    <Icon data={{ none: faXmark, waveform: faWaveSquare, bars: faChartSimple }[value]} />
  </RadioSelect>

  <Visualizer class="my-4 h-32 w-full text-accent-400" {audio} mode={$vismode} volume={$volume} />

  <div class="flex min-w-[256px] items-center" role="region" aria-label="Audio Player">
    <button
      class="mr-2 inline-block w-10 p-2 opacity-80 transition-opacity hover:opacity-100"
      aria-controls="audio1"
      aria-label={playing ? "Pause" : "Play"}
      title={playing ? "Pause" : "Play"}
      on:click={() => (playing ? audio?.pause() : audio?.play())}
    >
      <Icon data={playing ? faPause : faPlay} scale={1.5} />
    </button>

    <div class="mx-2">{formatDuration(currentTime * 1000)}</div>

    <div
      bind:this={seeker}
      on:click={onSeekerClick}
      on:keydown={onSeekerKeyDown}
      tabIndex="0"
      aria-valuetext="audio seek bar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={Math.round((currentTime / duration) * 100)}
      role="slider"
      class="relative mx-2 h-2 flex-1 cursor-pointer overflow-hidden rounded-lg bg-zinc-300 dark:bg-zinc-700"
    >
      <div
        class="absolute inset-y-0 h-full rounded-lg bg-zinc-500 transition-dimensions ease-linear"
        style:left={`${range[0] * 100 - 1}%`}
        style:width={`${range[1] * 100}%`}
      />
      <div
        class="relative h-full rounded-lg bg-accent-400 transition-dimensions ease-linear"
        style:width={`${(currentTime / duration) * 100}%`}
      />
    </div>

    <div class="mx-2">{formatDuration(duration * 1000)}</div>

    <button class="ml-2 inline-block w-10 p-2 transition" class:text-accent-600={loop} on:click={() => (loop = !loop)}>
      <Icon data={faRepeat} scale={1.25} />
    </button>

    <VolumeSlider
      bind:volume={$volume}
      class="ml-2 inline-block w-10 p-2 opacity-80 transition-opacity hover:opacity-100"
    />

    <audio
      {src}
      id="audio1"
      on:canplay={() => (isLoaded = true)}
      on:error={() => (isError = true)}
      on:play={() => (playing = true)}
      on:pause={() => (playing = false)}
      on:timeupdate={onTimeUpdate}
      on:durationchange={() => (duration = audio.duration)}
      on:progress={onProgress}
      on:suspend={onProgress}
      bind:this={audio}
    />
  </div>
</div>
