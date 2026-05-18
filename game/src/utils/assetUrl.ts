/** Resolve a public/ path (e.g. assets/ai.png) for the current deploy base. */
export function assetUrl(relativePath: string): string {
  const normalized = relativePath.replace(/^\//, '');
  const base = import.meta.env.BASE_URL;
  return new URL(`${base}${normalized}`, window.location.href).href;
}
