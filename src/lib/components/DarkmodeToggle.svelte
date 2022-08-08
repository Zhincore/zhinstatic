<script lang="ts">
  import { getDarkmode } from "$lib/darkmode";
  const darkmode = getDarkmode();

  const SUN =
    "M 168.5771,87.422898 C 179.78216,98.627956 185.38468,113.31398 185.38468,128 c 0,14.68602 -5.60252,29.37205 -16.80758,40.5771 -22.41011,22.41012 -58.74409,22.41012 -81.154202,0 -22.410114,-22.41011 -22.410114,-58.74409 0,-81.154202 C 98.627956,76.217841 113.31398,70.615313 128,70.615313 c 14.68602,0 29.37205,5.602528 40.5771,16.807585 z";
  const MOON =
    "m 96.968091,159.79894 c 38.499779,35.92584 102.863389,8.65257 127.812539,-25.03966 0,26.49817 -10.1087,52.99636 -30.32613,73.21377 -40.43484,40.43486 -105.992702,40.43486 -146.427549,0 -40.4348511,-40.43484 -40.4348511,-105.9927 0,-146.427549 C 68.244378,41.328076 94.742556,31.219364 121.24073,31.219364 78.315169,70.270211 58.468312,123.8731 96.968091,159.79894 Z";
</script>

<button class="link svg inline-block p-2" on:click={() => darkmode.toggle()}>
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
