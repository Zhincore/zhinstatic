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

export async function fetchData(url: string) {
  const response = await fetch(`${url}/__data.json`, { headers: { Accept: "application/json" } });
  if (!response.ok) return;

  const data = await response.json();
  const output: Record<string, any> = {};

  for (const obj of data.nodes) {
    Object.assign(output, obj.data);
  }
  return output;
}
