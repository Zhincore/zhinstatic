<script lang="ts">
  import Debounce from "debounce";

  export let search = "";

  const updateSearch = Debounce((value: string) => (search = value), 200);
  //on:keyup={({ currentTarget: { value } }) => updateSearch(value)} 
</script>

<input type="search" bind:value={search} />
