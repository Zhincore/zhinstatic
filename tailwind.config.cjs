const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          50: "#ffd86a",
          100: "#ffcf55",
          150: "#ffc541",
          200: "#ffb92c",
          300: "#ffa105",
          400: "#ff9300",
          500: "#ff8800",
          600: "#ea7c00",
          700: "#cd6d00",
          800: "#a85900",
          900: "#7b4200",
        },
      },
      backgroundImage: {
        radialShadow: "radial-gradient(closest-side, #0009, #0000)",
      },
      transitionProperty: {
        DEFAULT:
          "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, text-shadow",
      },
    },
  },
  plugins: [],
};
