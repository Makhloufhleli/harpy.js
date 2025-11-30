/**
 * Client-side helper that mirrors the server's `getActiveItemId` normalization
 * and ancestor-matching behavior. The client can use this to compute an active
 * item id from a static navigation manifest (array of items with `id` and
 * `href`) that was shipped from the server.
 *
 * This helper is intentionally tiny and has no runtime dependencies so it can
 * be imported in browser bundles.
 */

export type NavItemLite = { id: string; href?: string };

function normalizePath(p?: string): string {
  if (!p) return "";
  const withoutQuery = p.split(/[?#]/)[0];
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/"))
    return withoutQuery.slice(0, -1);
  return withoutQuery;
}

/**
 * Build a lookup map from normalized href -> array of item ids (preserves
 * registration order). The manifest should be a flat array of items; if you
 * have sections, flatten them to items before calling this.
 */
export function buildHrefIndex(items: NavItemLite[]) {
  const map = new Map<string, string[]>();
  for (const it of items) {
    if (!it.href) continue;
    const key = normalizePath(it.href);
    const arr = map.get(key) ?? [];
    arr.push(it.id);
    map.set(key, arr);
  }
  return map;
}

/**
 * Given a prebuilt href index and a current path, return the first matching
 * item id using the same ancestor-trim logic as the server. Returns
 * `undefined` when nothing matches. This function performs longest-prefix
 * matching by progressively trimming path segments.
 */
export function getActiveItemIdFromIndex(
  hrefIndex: Map<string, string[]>,
  currentPath?: string,
): string | undefined {
  if (!currentPath) return undefined;
  let cur = normalizePath(currentPath);
  while (cur !== "") {
    const entry = hrefIndex.get(cur);
    if (entry && entry.length > 0) return entry[0];
    const lastSlash = cur.lastIndexOf("/");
    if (lastSlash === -1) break;
    if (lastSlash === 0) {
      cur = "/";
    } else {
      cur = cur.slice(0, lastSlash);
    }
    if (cur === "/") {
      const entryRoot = hrefIndex.get("/");
      if (entryRoot && entryRoot.length > 0) return entryRoot[0];
      break;
    }
  }
  return undefined;
}

/**
 * Convenience: compute active id from a flat nav manifest directly.
 */
export function getActiveItemIdFromManifest(
  items: NavItemLite[],
  currentPath?: string,
): string | undefined {
  const idx = buildHrefIndex(items);
  return getActiveItemIdFromIndex(idx, currentPath);
}
