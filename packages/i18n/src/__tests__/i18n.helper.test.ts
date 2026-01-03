import { describe, it, expect } from "bun:test";
import type { I18nModuleOptions } from "../i18n-module.options";

describe("I18nHelper logic", () => {
  const mockOptions: I18nModuleOptions = {
    defaultLocale: "en",
    locales: ["en", "fr", "es"],
    urlPattern: "query",
    translationsPath: "./dictionaries",
    cookieName: "locale",
    queryParam: "lang",
  };

  describe("validateLocale", () => {
    const validateLocale = (options: I18nModuleOptions, locale: string): string => {
      if (options.locales.includes(locale)) {
        return locale;
      }
      return options.defaultLocale;
    };

    it("should return valid locale", () => {
      expect(validateLocale(mockOptions, "fr")).toBe("fr");
      expect(validateLocale(mockOptions, "es")).toBe("es");
    });

    it("should return default locale for invalid locale", () => {
      expect(validateLocale(mockOptions, "de")).toBe("en");
      expect(validateLocale(mockOptions, "invalid")).toBe("en");
    });

    it("should return default locale for empty string", () => {
      expect(validateLocale(mockOptions, "")).toBe("en");
    });
  });

  describe("buildLocaleUrl", () => {
    const buildLocaleUrl = (
      options: I18nModuleOptions,
      locale: string,
      path: string,
      existingQuery?: Record<string, string>,
    ): string => {
      if (options.urlPattern === "header") {
        if (existingQuery && Object.keys(existingQuery).length > 0) {
          const params = new URLSearchParams(existingQuery);
          return `${path}?${params.toString()}`;
        }
        return path;
      }

      const params = new URLSearchParams({
        ...existingQuery,
        [options.queryParam!]: locale,
      });
      return `${path}?${params.toString()}`;
    };

    it("should build URL with query parameter", () => {
      const url = buildLocaleUrl(mockOptions, "fr", "/home");
      expect(url).toBe("/home?lang=fr");
    });

    it("should preserve existing query parameters", () => {
      const url = buildLocaleUrl(mockOptions, "fr", "/home", { page: "2" });
      expect(url).toContain("lang=fr");
      expect(url).toContain("page=2");
    });
  });
});
