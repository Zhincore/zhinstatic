<script lang="ts" context="module">
  export type VisualizerMode = "none" | "waveform" | "bars";
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  export let audio: HTMLAudioElement | undefined = undefined;
  export let mode: VisualizerMode = "none";
  let className = "";
  export { className as class };

  $: binCount = mode === "waveform" ? 4096 : 128;
  $: data = new Uint8Array(binCount);

  let analyser: AnalyserNode;
  let canvas: HTMLCanvasElement;
  let ready = true;
  $: ctx = canvas?.getContext("2d");

  onMount(() => {
    let frame: number;

    const update = () => {
      frame = window.requestAnimationFrame(update);
      if (!analyser || !ctx || !ready || mode === "none") return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mode === "waveform") {
        analyser.getByteTimeDomainData(data);
        const width = canvas.width / binCount;

        ctx.beginPath();
        for (let i = 0; i < binCount; i++) {
          const x = width * i;
          const y = (data[i] / 256) * canvas.height;

          if (!i) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = "currentColor";
        ctx.stroke();
      } else {
        analyser.getByteFrequencyData(data);
        const width = canvas.width / binCount;

        for (let i = 0; i < binCount; i++) {
          const x = width * i;
          const height = (data[i] / 256) ** 2 * canvas.height;

          ctx.beginPath();
          ctx.rect(x, canvas.height, width, -height);
          ctx.fillStyle = "currentColor";
          ctx.fill();
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
  };

  $: if (audio && !analyser) {
    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
  }

  $: if (analyser) analyser.fftSize = binCount * 2;
  $: if (analyser) analyser.smoothingTimeConstant = mode === "waveform" ? 0.95 : 0.6;

  $: ready && resize();
</script>

<svelte:window on:resize={resize} />

{#if mode !== "none"}
  <canvas
    bind:this={canvas}
    class={className}
    transition:slide
    on:introstart={() => (ready = false)}
    on:introend={() => (ready = true)}
    on:outrostart={() => (ready = false)}
  />
{/if}
