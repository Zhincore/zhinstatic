export function getTypeFromMime(mime?: string | null) {
  if (!mime) return;
  const [discreteType, subtype] = mime.split("/");

  switch (discreteType) {
    case "text":
      if (subtype === "csv") return "csv";
      if (sourceCodeTypes.includes(mime)) return "code";
    // fallthrough

    case "video":
    case "image":
    case "audio":
      return discreteType;

    case "inode":
      if (subtype === "directory") return "folder";
    // fallthrough

    case "application":
      if (subtype === "x-directory") return "folder";
      if (subtype === "pdf") return "pdf";
      if (readableDataTypes.includes(mime)) return "code";
      if (archiveTypes.includes(mime)) return "archive";
      return "data";
  }
}

export type Type = ReturnType<typeof getTypeFromMime>;

// https://en.wikipedia.org/wiki/List_of_archive_formats
//   `[...new Set(document.body.innerHTML.match(/application\/[|d\w.-]+/g))]`
const archiveTypes = [
  "application/x-archive",
  "application/x-cpio",
  "application/x-shar",
  "application/x-iso9660-image",
  "application/x-sbx",
  "application/x-tar",
  "application/x-brotli",
  "application/x-bzip2",
  "application/gzip",
  "application/x-lzip",
  "application/x-lzma",
  "application/x-lzop",
  "application/x-snappy-framed",
  "application/x-xz",
  "application/x-compress",
  "application/zstd",
  "application/x-7z-compressed",
  "application/x-ace-compressed",
  "application/x-astrotite-afa",
  "application/x-alz-compressed",
  "application/vnd.android.package-archive",
  // "application/octet-stream",
  "application/x-freearc",
  "application/x-arj",
  "application/x-b1",
  "application/vnd.ms-cab-compressed",
  "application/x-cfs-compressed",
  "application/x-dar",
  "application/x-dgc-compressed",
  "application/x-apple-diskimage",
  "application/x-gca-compressed",
  "application/java-archive",
  "application/x-lzh",
  "application/x-lzx",
  "application/x-rar-compressed",
  "application/x-stuffit",
  "application/x-stuffitx",
  "application/x-gtar",
  "application/x-ms-wim",
  "application/x-xar",
  "application/zip",
  "application/x-zoo",
  "application/x-par2",
  "application/zlib",
  "application/ld",

  // Custom additions:
  "application/x-debian-package",
];

const sourceCodeTypes = ["text/html", "text/css", "text/javascript"];

const readableDataTypes = [
  "application/json",
  "application/xml",
  "application/javascript", // legacy
];
