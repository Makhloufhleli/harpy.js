import { Injectable } from "@nestjs/common";
import type {
  NavItem,
  NavSection,
  NavigationRegistry,
} from "./types/nav.types";

/**
 * Shared navigation service for registering documentation sections and items.
 * This service is intended to be provided by the core RouterModule so feature
 * modules can register their routes during module initialization.
 */
@Injectable()
export class NavigationService implements NavigationRegistry {
  private sections: Map<string, NavSection> = new Map();
  // Items registered without a section are kept here and surfaced as an
  // implicit, top-level section by `getAllSections()`.
  private topLevelItems: NavItem[] = [];
  // Cached, sorted snapshot of sections (shallow copies). Rebuilt when
  // registrations change. Use `dirty` to mark the cache stale.
  private cachedSections: NavSection[] | null = null;
  private dirty = true;
  // Map of normalized href -> array of { sectionId?, itemId }
  private hrefIndex: Map<
    string,
    Array<{ sectionId?: string; itemId: string }>
  > = new Map();

  constructor() {}

  registerSection(section: NavSection): void {
    this.sections.set(section.id, section);
  }

  addItemToSection(sectionId: string, item: NavItem): void {
    let section = this.sections.get(sectionId);
    if (!section) {
      // Lazily create the section if it doesn't exist. This keeps the core
      // package minimal by default while allowing feature modules to add
      // routes without needing to pre-register sections.
      const humanize = (id: string) =>
        id.replace(/[-_/]+/g, " ").replace(/(^|\s)\S/g, (s) => s.toUpperCase());

      section = {
        id: sectionId,
        title: humanize(sectionId),
        items: [],
        // preserve undefined order by default
      };
      this.registerSection(section);
    }

    section.items.push(item);
    // preserve raw insertion order in the array; sorting is applied when
    // callers request `getAllSections()` so we can compute ordering on demand.
  }

  registerItem(item: NavItem): void {
    this.topLevelItems.push(item);
    this.dirty = true;
  }

  getAllSections(): NavSection[] {
    // Return cached snapshot when available to avoid repeated sorting and
    // object allocations. Rebuild only when registrations changed.
    if (!this.dirty && this.cachedSections) {
      return this.cachedSections.map((s) => ({ ...s, items: s.items.slice() }));
    }

    // Build an ordered list of sections. If there are any top-level items
    // (items registered without a section) surface them as an implicit
    // top-level section. That implicit section is placed before other
    // sections by using a very low ordering value so unsectioned items
    // appear first by default.
    const sectionsList: NavSection[] = Array.from(this.sections.values());
    if (this.topLevelItems.length > 0) {
      sectionsList.unshift({
        id: "__top__",
        title: "",
        items: this.topLevelItems.slice(),
      });
    }

    const arr = sectionsList.map((s, idx) => ({
      section: s,
      idx,
      order:
        s.id === "__top__"
          ? Number.NEGATIVE_INFINITY
          : typeof s.order === "number"
            ? s.order
            : Number.POSITIVE_INFINITY,
    }));

    arr.sort((a, b) => {
      if (a.order === b.order) return a.idx - b.idx;
      return a.order - b.order;
    });

    // For each section, return a copy where the items are sorted by their
    // optional `order` (lowest first) and then by insertion index.
    const built = arr.map((x) => {
      const s = x.section;

      const itemsWithMeta = s.items.map((it, i) => ({
        item: it,
        idx: i,
        order:
          typeof it.order === "number" ? it.order : Number.POSITIVE_INFINITY,
      }));

      itemsWithMeta.sort((u, v) => {
        if (u.order === v.order) return u.idx - v.idx;
        return u.order - v.order;
      });

      return {
        id: s.id,
        title: s.title,
        order: s.order,
        items: itemsWithMeta.map((m) => m.item),
      } as NavSection;
    });

    // Rebuild href index for fast active lookup.
    this.hrefIndex.clear();
    const normalize = (p?: string) => {
      if (!p) return "";
      const withoutQuery = p.split(/[?#]/)[0];
      if (withoutQuery.length > 1 && withoutQuery.endsWith("/"))
        return withoutQuery.slice(0, -1);
      return withoutQuery;
    };

    for (const s of built) {
      for (const it of s.items) {
        if (!it.href) continue;
        const key = normalize(it.href);
        if (!this.hrefIndex.has(key)) this.hrefIndex.set(key, []);
        this.hrefIndex
          .get(key)!
          .push({
            sectionId: s.id === "__top__" ? undefined : s.id,
            itemId: it.id,
          });
      }
    }

    this.cachedSections = built;
    this.dirty = false;
    // Return shallow clones so callers cannot mutate the internal cache.
    return built.map((s) => ({ ...s, items: s.items.slice() }));
  }

  private ensureCache(): void {
    if (this.dirty) this.getAllSections();
  }

  /**
   * Fast active-item resolution using the prebuilt `hrefIndex`. This
   * performs ancestor matching by trimming path segments and checking the
   * index for the longest matching prefix. Returns the first registered
   * item for a matched href.
   */
  getActiveItemId(currentPath?: string): string | undefined {
    if (!currentPath) return undefined;
    this.ensureCache();
    const normalize = (p?: string) => {
      if (!p) return "";
      const withoutQuery = p.split(/[?#]/)[0];
      if (withoutQuery.length > 1 && withoutQuery.endsWith("/"))
        return withoutQuery.slice(0, -1);
      return withoutQuery;
    };

    let cur = normalize(currentPath);
    while (cur !== "") {
      const entry = this.hrefIndex.get(cur);
      if (entry && entry.length > 0) return entry[0].itemId;
      const lastSlash = cur.lastIndexOf("/");
      if (lastSlash === -1) break;
      if (lastSlash === 0) {
        cur = "/";
      } else {
        cur = cur.slice(0, lastSlash);
      }
      if (cur === "/") {
        const entryRoot = this.hrefIndex.get("/");
        if (entryRoot && entryRoot.length > 0) return entryRoot[0].itemId;
        break;
      }
    }

    return undefined;
  }

  /**
   * Return sections where each item's `active` flag is computed against
   * `currentPath`. This does not mutate the registered items — it returns
   * shallow copies suitable for rendering.
   */
  getSectionsForRoute(currentPath?: string): NavSection[] {
    const normalize = (p?: string) => {
      if (!p) return "";
      const withoutQuery = p.split(/[?#]/)[0];
      // strip trailing slash except for root
      if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
        return withoutQuery.slice(0, -1);
      }
      return withoutQuery;
    };

    const matches = (itemHref: string | undefined, cur: string | undefined) => {
      if (!itemHref || !cur) return false;
      const a = normalize(itemHref);
      const b = normalize(cur);
      if (!a) return false;
      if (a === b) return true;
      // treat an item as active when the current path is a descendant of the
      // item's href (e.g. `/docs` matches `/docs/getting-started`).
      return b.startsWith(a + "/");
    };

    const base = this.getAllSections();
    if (!currentPath) return base;

    // Fast path: find the single active item id and mark only that item.
    const activeId = this.getActiveItemId(currentPath);
    if (!activeId) return base;

    return base.map((s) => ({
      ...s,
      items: s.items.map((it) => ({ ...it, active: it.id === activeId })),
    }));
  }

  getSection(sectionId: string): NavSection | undefined {
    return this.sections.get(sectionId);
  }

  /**
   * Move an already-registered section to the front of the navigation.
   * Useful when ordering must be adjusted after other modules have registered.
   */
  moveSectionToFront(sectionId: string): void {
    const sec = this.sections.get(sectionId);
    if (!sec) return;

    const newMap = new Map<string, NavSection>();
    newMap.set(sectionId, sec);
    for (const [k, v] of this.sections.entries()) {
      if (k === sectionId) continue;
      newMap.set(k, v);
    }
    this.sections = newMap;
  }
}
