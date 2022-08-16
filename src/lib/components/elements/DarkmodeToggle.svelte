<script lang="ts">
  import { getDarkmode } from "$stores/darkmode";
  const darkmode = getDarkmode();

  const SUN =
    "M 168.5771,87.422898 C 179.78216,98.627956 185.38468,113.31398 185.38468,128 c 0,14.68602 -5.60252,29.37205 -16.80758,40.5771 -22.41011,22.41012 -58.74409,22.41012 -81.154202,0 -22.410114,-22.41011 -22.410114,-58.74409 0,-81.154202 C 98.627956,76.217841 113.31398,70.615313 128,70.615313 c 14.68602,0 29.37205,5.602528 40.5771,16.807585 z";
  const MOON =
    "m 96.261702,163.78041 c 39.584528,36.4682 90.196748,32.96666 123.405108,3.28771 -4.33898,14.56597 -14.7576,30.45023 -25.21231,40.90493 -40.43487,40.43483 -105.992702,40.43486 -146.427549,0 -40.4348511,-40.43484 -40.434852,-105.9927 0,-146.427549 C 62.00709,47.565364 75.229767,39.51107 94.677093,34.629714 60.758502,68.473508 56.677179,127.3122 96.261702,163.78041 Z";
</script>

<button class="link svg mx-2 inline-block p-2" on:click={() => darkmode.toggle()}>
  <svg viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg" class="fill-current transition-colors">
    <def>
      <g id="rays">
        <rect y="120" x="8" width="48" height="16" rx="8" ry="8" />
        <rect y="120" x="200" width="48" height="16" rx="8" ry="8" />
      </g>
    </def>

    <g>
      <path d={$darkmode ? SUN : MOON} class="transition-all duration-500" />

      <g
        class="origin-center transform transition duration-500"
        class:opacity-0={!$darkmode}
        class:scale-0={!$darkmode}
      >
        <use href="#rays" />
        <use href="#rays" class="origin-center rotate-90" />
        <use href="#rays" class="origin-center rotate-45" />
        <use href="#rays" class="origin-center -rotate-45" />
      </g>
    </g>
  </svg>
</button>
