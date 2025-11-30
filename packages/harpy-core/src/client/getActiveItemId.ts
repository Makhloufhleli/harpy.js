export type NavItemLite = { id: string; href?: string };

function normalizePath(p?: string): string {
  if (!p) return "";
  const withoutQuery = p.split(/[?#]/)[0];
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/"))
    return withoutQuery.slice(0, -1);
  return withoutQuery;
}

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

export function getActiveItemIdFromManifest(
  items: NavItemLite[],
  currentPath?: string,
): string | undefined {
  const idx = buildHrefIndex(items);
  return getActiveItemIdFromIndex(idx, currentPath);
}
