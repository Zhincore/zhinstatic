<script lang="ts">
  export let label = "";
  export let options: string[];
  export let chosen: string | undefined = undefined;
  let className = "";
  export { className as class };

  const random = Math.random() * 100 + "";
</script>

<fieldset {label} class="inline-block overflow-hidden rounded-xl bg-zinc-700 {className}">
  {#each options as value, i (value)}
    <label
      class="inline-block cursor-pointer px-3 py-1 transition {value === chosen ? 'bg-zinc-600' : ''}"
      for={`radio${random}_${i}`}
    >
      <slot {value}>{value}</slot>
      <input id={`radio${random}_${i}`} type="radio" {value} bind:group={chosen} class="hidden" />
    </label>
  {/each}
</fieldset>
