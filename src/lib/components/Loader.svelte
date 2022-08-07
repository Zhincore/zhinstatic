<script lang="ts">
  export let width = 256;
</script>

<svg viewBox="0 0 900 900" {width} xmlns="http://www.w3.org/2000/svg">
  <defs>
    <polygon
      id="hexagon"
      points="300,150 225,280 75,280 0,150 75,20 225,20"
      fill="none"
      stroke="orange"
      stroke-width="1%"
      pathLength="6"
      stroke-dasharray="2 4"
      filter="drop-shadow(0 0 8pt orange)"
    >
      <animate attributeName="stroke-dashoffset" by="-6" dur="1s" repeatCount="indefinite" />
    </polygon>
  </defs>

  <use href="#hexagon" x="375" y="170" stroke-dashoffset="-4" />
  <use href="#hexagon" x="150" y="300" stroke-dashoffset="0" />
  <use href="#hexagon" x="375" y="430" stroke-dashoffset="4" />
</svg>
