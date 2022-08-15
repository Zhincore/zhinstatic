export { default as breakpoints } from "../tailwind.breakpoints.config.json";

export const config = {
  darkmodeCookie: "zhinstatic-darkmode",
  darkmodeDefault: true,

  thumbnails: {
    widths: [64, 128, 256, 1024],
    formats: ["avif", "webp", "jpg"] as const,
    keepMimes: ["image/svg+xml"],
    animatedMimes: ["image/gif", "image/webp", "image/avif"],
  },
};
