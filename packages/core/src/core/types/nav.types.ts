export interface NavItem {
  id: string;
  title: string;
  href?: string;
  /**
   * Runtime-only hint indicating whether this item is currently active.
   * Consumers may inspect this flag when rendering navigation UI. The
   * navigation service exposes helpers to compute active state from the
   * current route instead of mutating the registered items directly.
   */
  active?: boolean;
  /**
   * Optional numeric priority within a section. Lower numbers appear earlier.
   * If omitted, registration order is used as a tiebreaker.
   */
  order?: number;
  /**
   * Optional badge to display next to the item (e.g., 'NEW', 'BETA', 'UPDATED').
   * Used to highlight newly added or updated navigation items.
   */
  badge?: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  /**
   * Optional numeric order. Lower numbers appear earlier in navigation.
   * If omitted, insertion order is used as a tiebreaker.
   */
  order?: number;
}

// Minimal interface describing the navigation service surface used by feature modules.
export interface NavigationRegistry {
  registerSection(section: NavSection): void;
  addItemToSection(sectionId: string, item: NavItem): void;
  /**
   * Register a navigation item that does not belong to any section.
   * These items will be surfaced in a top-level, implicit section in
   * the results returned by `getAllSections()`.
   */
  registerItem(item: NavItem): void;
  /**
   * Get all sections with items marked according to the provided route.
   * If `currentPath` is omitted, this behaves the same as `getAllSections()`.
   */
  getSectionsForRoute(currentPath?: string): NavSection[];
  /**
   * Fast lookup for the active item's id for a given route. This is intended
   * to be an inexpensive alternative to returning full sections with active
   * flags when clients prefer to compute or sync active state themselves.
   */
  getActiveItemId(currentPath?: string): string | undefined;
  getAllSections(): NavSection[];
  getSection(sectionId: string): NavSection | undefined;
}
