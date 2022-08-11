export const config = {
  darkmodeCookie: "zhinstatic-darkmode",
  darkmodeDefault: true,

  checkMagicFor: ["application/octet-stream"],

  thumbnails: {
    path: "cache/thumbnails",
    widths: [64, 128, 256, 1024],
    formats: ["avif", "webp", "jpg"] as const,
    animatedMimes: ["image/gif", "image/webp", "image/avif"],
  },
};
