/**
 * I18n Service for Bun runtime
 * Provides translation and locale management functionality
 */

import { Injectable, Inject, Optional } from '@harpy-js/core/runtime';
import type { I18nOptions } from './i18n-options';
import { I18N_OPTIONS, normalizeI18nOptions } from './i18n-options';

export interface I18nContext {
  locale: string;
  dict: Record<string, any>;
}

@Injectable()
export class I18nService {
  private static dictionaryLoader: ((locale: string) => Promise<Record<string, any>>) | null = null;
  private static dictionaryCache: Map<string, Record<string, any>> = new Map();
  private options: Required<I18nOptions>;

  constructor(
    @Inject(I18N_OPTIONS) @Optional() options?: I18nOptions
  ) {
    this.options = normalizeI18nOptions(options || { defaultLocale: 'en', locales: ['en'] });
  }

  /**
   * Register a function to load dictionaries for locales
   */
  static registerDictionaryLoader(loader: (locale: string) => Promise<Record<string, any>>): void {
    I18nService.dictionaryLoader = loader;
  }

  /**
   * Instance method to register dictionary loader
   */
  registerDictionaryLoader(loader: (locale: string) => Promise<Record<string, any>>): void {
    I18nService.registerDictionaryLoader(loader);
  }

  /**
   * Get dictionary for a specific locale
   */
  async getDictionary(locale: string): Promise<Record<string, any>> {
    // Check cache first
    const cached = I18nService.dictionaryCache.get(locale);
    if (cached) {
      return cached;
    }

    // Load using registered loader
    if (I18nService.dictionaryLoader) {
      try {
        const dict = await I18nService.dictionaryLoader(locale);
        I18nService.dictionaryCache.set(locale, dict);
        return dict;
      } catch (error) {
        console.warn(`[I18n] Failed to load dictionary for locale "${locale}":`, error);
      }
    } else {
      console.warn('[I18n] No dictionary loader registered. Call I18nService.registerDictionaryLoader() in your app.');
    }

    return {};
  }

  /**
   * Clear dictionary cache (useful for development)
   */
  static clearCache(): void {
    I18nService.dictionaryCache.clear();
  }

  /**
   * Translate a key with optional variable interpolation
   */
  async translate(
    locale: string,
    key: string,
    vars?: Record<string, string | number>
  ): Promise<string> {
    const dict = await this.getDictionary(locale);
    return this.translateSync(dict, key, vars);
  }

  /**
   * Synchronous translation using a pre-loaded dictionary
   */
  translateSync(
    dict: Record<string, any>,
    key: string,
    vars?: Record<string, string | number>
  ): string {
    const value = key.split('.').reduce((acc, k) => acc?.[k], dict as any);

    if (typeof value !== 'string') return '';
    return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
      String(vars?.[k.trim()] ?? '')
    );
  }

  /**
   * Get the default locale
   */
  getDefaultLocale(): string {
    return this.options.defaultLocale;
  }

  /**
   * Get all supported locales
   */
  getLocales(): string[] {
    return this.options.locales;
  }

  /**
   * Check if a locale is supported
   */
  isValidLocale(locale: string): boolean {
    return this.options.locales.includes(locale);
  }

  /**
   * Get validated locale (returns default if invalid)
   */
  validateLocale(locale: string): string {
    return this.isValidLocale(locale) ? locale : this.options.defaultLocale;
  }

  /**
   * Get client-side configuration
   */
  getClientConfig() {
    return {
      locales: this.options.locales,
      defaultLocale: this.options.defaultLocale,
      urlPattern: this.options.urlPattern,
      queryParam: this.options.queryParam,
    };
  }
}
