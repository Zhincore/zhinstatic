const NORMALIZE_PATH_RE = /\/+/g;

export function normalizePath(...pathComps: string[]) {
  return (
    "/" +
    pathComps
      .join("/")
      .split(NORMALIZE_PATH_RE)
      .filter((v) => v)
      .map(encodeURIComponent)
      .join("/")
  );
}
