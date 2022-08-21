<script lang="ts" context="module">
  export type VisualizerMode = "none" | "waveform" | "bars";
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  export let canStart: boolean;
  export let volume = 1;
  export let audio: HTMLAudioElement | undefined = undefined;
  export let mode: VisualizerMode = "none";
  let className = "";
  export { className as class };

  const MIN_BAR_H = 0.04;
  const BAR_GAP = 0.002;

  $: binCount = mode === "waveform" ? 4096 : 128;
  $: data = new Uint8Array(binCount);

  let analyser: AnalyserNode;
  let gain: GainNode;
  let canvas: HTMLCanvasElement;
  let ready = true;
  $: ctx = canvas?.getContext("2d");
  $: styles = canvas && window && window.getComputedStyle(canvas);

  onMount(() => {
    let frame: number;

    const update = () => {
      frame = window.requestAnimationFrame(update);
      if (!analyser || !audio || !ctx || !ready || mode === "none") return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === "waveform") {
        analyser.getByteTimeDomainData(data);
        const width = canvas.width / binCount;

        ctx.beginPath();
        for (let i = binCount - 1; i >= 0; i--) {
          const x = width * i;
          const y = (data[i] / 256) * canvas.height;

          if (!i) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = styles.color;
        ctx.stroke();
      } else {
        analyser.getByteFrequencyData(data);
        const gap = BAR_GAP * canvas.width;
        const width = canvas.width / binCount - gap;

        ctx.fillStyle = styles.color;
        for (let i = 0; i < binCount; i++) {
          const height = ((data[i] / 256) ** 4 + MIN_BAR_H) * canvas.height;
          const x = (width + gap) * i;

          ctx.beginPath();
          ctx.fillRect(x, canvas.height, width, -height);
        }
      }
    };
    resize();
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      if (analyser) analyser.disconnect();
    };
  });

  const resize = () => {
    if (!canvas || !ready) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (mode === "bars") binCount = 2 ** Math.max(5, Math.min(14, Math.floor(Math.sqrt(canvas.width / 16))));
  };

  $: mode && resize();
  // $: if (ctx) ctx.imageSmoothingEnabled = false;

  $: if (audio && canStart && !analyser) {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    gain = ctx.createGain();

    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
  }

  $: if (gain) gain.gain.value = volume;
  $: if (analyser) analyser.fftSize = binCount * 2;
  $: if (analyser) analyser.smoothingTimeConstant = 0.6;

  $: ready && resize();
</script>

<svelte:window on:resize={resize} />

{#if mode !== "none"}
  <canvas
    style="image-rendering: crisp-edges;"
    bind:this={canvas}
    class={className}
    transition:slide
    on:introstart={() => (ready = false)}
    on:introend={() => (ready = true)}
    on:outrostart={() => (ready = false)}
  />
{/if}
