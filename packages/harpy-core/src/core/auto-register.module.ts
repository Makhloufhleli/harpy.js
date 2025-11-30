import { OnModuleInit } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import type { NavigationRegistry } from './types/nav.types';

/**
 * Base module that automatically registers navigation on module init.
 *
 * Feature modules can extend this class and implement `registerNavigation`
 * to avoid implementing `OnModuleInit` themselves.
 */
export abstract class AutoRegisterModule implements OnModuleInit {
  constructor(protected readonly navigationService: NavigationService) {}

  /**
   * Implement this in the concrete module to register navigation items/sections.
   */
  protected abstract registerNavigation(navigation: NavigationRegistry): void;

  onModuleInit(): void {
    // Call the concrete module's registration method with the core NavigationService
    try {
      this.registerNavigation(this.navigationService);
    } catch (err) {
      // Don't let registration errors break app startup; surface via console for now.
      // Consumers can still throw if they want startup to fail.
      // eslint-disable-next-line no-console
      console.warn('[AutoRegisterModule] registerNavigation failed:', err);
    }
  }
}
