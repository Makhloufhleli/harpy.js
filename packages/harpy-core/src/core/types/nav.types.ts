export interface NavItem {
  id: string;
  title: string;
  href?: string;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

// Minimal interface describing the navigation service surface used by feature modules.
export interface NavigationRegistry {
  registerSection(section: NavSection): void;
  addItemToSection(sectionId: string, item: NavItem): void;
  getAllSections(): NavSection[];
  getSection(sectionId: string): NavSection | undefined;
}
