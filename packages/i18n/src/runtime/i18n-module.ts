/**
 * I18n Module for Bun runtime
 * Configures the i18n system with the DI container
 */

import { Module, Global } from '@harpy-js/core/runtime';
import { I18nService } from './i18n-service';
import { I18N_OPTIONS, normalizeI18nOptions } from './i18n-options';
import type { I18nOptions } from './i18n-options';

/**
 * I18n Module configuration
 */
export interface I18nModuleConfig {
  options: I18nOptions;
  /** Optional dictionary loader function */
  dictionaryLoader?: (locale: string) => Promise<Record<string, any>>;
}

/**
 * Create I18n module with configuration
 */
export function createI18nModule(config: I18nModuleConfig) {
  const normalizedOptions = normalizeI18nOptions(config.options);

  // Register dictionary loader if provided
  if (config.dictionaryLoader) {
    I18nService.registerDictionaryLoader(config.dictionaryLoader);
  }

  @Global()
  @Module({
    providers: [
      {
        provide: I18N_OPTIONS,
        useValue: normalizedOptions,
      },
      I18nService,
    ],
    exports: [I18nService, I18N_OPTIONS],
  })
  class I18nModule {}

  return I18nModule;
}

/**
 * I18n Module class for direct usage
 */
@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class I18nModule {
  /**
   * Register I18n module with configuration
   */
  static forRoot(config: I18nModuleConfig) {
    return createI18nModule(config);
  }
}
