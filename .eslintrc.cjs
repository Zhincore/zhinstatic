/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["svelte3", "@typescript-eslint", "import"],
  ignorePatterns: ["*.cjs"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],
  settings: {
    "svelte3/typescript": () => require("typescript"),
    "import/internal-regex": "^(~|\\$)",
    "import/resolver": {
      typescript: {},
    },
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    "import/order": ["warn", { groups: ["builtin", "external", "internal", "parent", "sibling"] }],
    "import/no-named-as-default": "off",
    "import/no-unresolved": "off",
  },
};
