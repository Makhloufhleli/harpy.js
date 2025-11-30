import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { I18N_MODULE_OPTIONS } from "./i18n-module.options";
import type { I18nModuleOptions } from "./i18n-module.options";

/**
 * I18n Service - Request-scoped service for translations
 *
 * NOTE: This service uses a generic dictionary type. In your application,
 * you should import your specific Dictionary type from get-dictionary.ts
 *
 * @example
 * ```typescript
 * import { I18nService } from '@hepta-solutions/harpy-core';
 *
 * @Controller()
 * export class MyController {
 *   constructor(private i18n: I18nService) {}
 *
 *   @Get()
 *   async getPage() {
 *     const dict = await this.i18n.getDict();
 *     const locale = this.i18n.getLocale();
 *     return { dict, locale };
 *   }
 * }
 * ```
 */
@Injectable({ scope: Scope.REQUEST })
export class I18nService {
  private dict: Record<string, any> | null = null;
  private getDictionaryFn: ((locale: string) => Promise<any>) | null = null;

  constructor(
    @Inject(REQUEST) private request: any,
    @Inject(I18N_MODULE_OPTIONS) private options: I18nModuleOptions,
  ) {}

  /**
   * Register a custom dictionary loader function
   * This should be called in your application's getDictionary.ts
   */
  registerDictionaryLoader(fn: (locale: string) => Promise<any>): void {
    this.getDictionaryFn = fn;
  }

  /**
   * Get the current dictionary
   * Returns empty object if no dictionary loader is registered
   */
  async getDict(): Promise<Record<string, any>> {
    if (!this.dict) {
      const locale = this.request.locale || this.options.defaultLocale;

      if (this.getDictionaryFn) {
        this.dict = await this.getDictionaryFn(locale);
      } else {
        // Return empty object if no loader registered
        console.warn(
          "No dictionary loader registered. Call registerDictionaryLoader() in your app.",
        );
        this.dict = {};
      }
    }
    return this.dict ?? {};
  }

  /**
   * Get the current locale
   */
  getLocale(): string {
    return this.request.locale || this.options.defaultLocale;
  }

  /**
   * Translate a key with optional variables
   * This is a helper method - for type-safe translations, use the t() function directly
   */
  async translate(
    key: string,
    vars?: Record<string, string | number>,
  ): Promise<string> {
    const dict = await this.getDict();

    // Simple nested key resolution
    const value = key.split(".").reduce((acc, k) => acc?.[k], dict as any);

    if (typeof value !== "string") return "";

    // Variable interpolation
    return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
      String(vars?.[k.trim()] ?? ""),
    );
  }
}
