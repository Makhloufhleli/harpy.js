import { Injectable } from '@nestjs/common';
import type { NavItem, NavSection, NavigationRegistry } from './types/nav.types';

/**
 * Shared navigation service for registering documentation sections and items.
 * This service is intended to be provided by the core RouterModule so feature
 * modules can register their routes during module initialization.
 */
@Injectable()
export class NavigationService implements NavigationRegistry {
  private sections: Map<string, NavSection> = new Map();

  constructor() {
  }

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
        id
          .replace(/[-_/]+/g, ' ')
          .replace(/(^|\s)\S/g, (s) => s.toUpperCase());

      section = {
        id: sectionId,
        title: humanize(sectionId),
        items: [],
      };
      this.registerSection(section);
    }

    section.items.push(item);
  }

  getAllSections(): NavSection[] {
    return Array.from(this.sections.values());
  }

  getSection(sectionId: string): NavSection | undefined {
    return this.sections.get(sectionId);
  }
}
