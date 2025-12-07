import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { I18N_MODULE_OPTIONS } from "./i18n-module.options";
import type { I18nModuleOptions } from "./i18n-module.options";

@Injectable({ scope: Scope.REQUEST })
export class I18nService {
  private dict: Record<string, any> | null = null;
  private static getDictionaryFn: ((locale: string) => Promise<any>) | null = null;

  constructor(
    @Inject(REQUEST) private request: any,
    @Inject(I18N_MODULE_OPTIONS) private options: I18nModuleOptions,
  ) {}

  static registerDictionaryLoader(fn: (locale: string) => Promise<any>): void {
    I18nService.getDictionaryFn = fn;
  }

  registerDictionaryLoader(fn: (locale: string) => Promise<any>): void {
    I18nService.registerDictionaryLoader(fn);
  }

  async getDict(): Promise<Record<string, any>> {
    if (!this.dict) {
      const locale = this.request.locale || this.options.defaultLocale;

      if (I18nService.getDictionaryFn) {
        this.dict = await I18nService.getDictionaryFn(locale);
      } else {
        console.warn(
          "No dictionary loader registered. Call registerDictionaryLoader() in your app.",
        );
        this.dict = {};
      }
    }
    return this.dict ?? {};
  }

  getLocale(): string {
    return this.request.locale || this.options.defaultLocale;
  }

  async translate(
    key: string,
    vars?: Record<string, string | number>,
  ): Promise<string> {
    const dict = await this.getDict();
    const value = key.split(".").reduce((acc, k) => acc?.[k], dict as any);

    if (typeof value !== "string") return "";
    return value.replace(/\{\{(.*?)\}\}/g, (_match: string, k: string) =>
      String(vars?.[k.trim()] ?? ""),
    );
  }
}
