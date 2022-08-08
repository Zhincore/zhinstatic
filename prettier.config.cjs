module.exports = {
  trailingComma: "all",
  printWidth: 120,
  plugins: [require("prettier-plugin-tailwindcss")],
  overrides: [
    {
      files: ["*.svelte"],
      options: {
        parser: "svelte",
      },
    },
  ],
};
