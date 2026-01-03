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

  describe("buildLocaleUrl logic", () => {
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

    describe("query pattern", () => {
      it("should build URL with query parameter", () => {
        const url = buildLocaleUrl(mockOptions, "fr", "/home");
        expect(url).toBe("/home?lang=fr");
      });

      it("should preserve existing query parameters", () => {
        const url = buildLocaleUrl(mockOptions, "fr", "/home", { page: "2" });
        expect(url).toContain("lang=fr");
        expect(url).toContain("page=2");
      });

      it("should replace existing lang parameter", () => {
        const url = buildLocaleUrl(mockOptions, "fr", "/home", { lang: "en" });
        expect(url).toBe("/home?lang=fr");
      });
    });

    describe("header pattern", () => {
      const headerOptions = { ...mockOptions, urlPattern: "header" as const };

      it("should return path without query for header pattern", () => {
        const url = buildLocaleUrl(headerOptions, "fr", "/home");
        expect(url).toBe("/home");
      });

      it("should preserve existing query parameters", () => {
        const url = buildLocaleUrl(headerOptions, "fr", "/home", { page: "2" });
        expect(url).toBe("/home?page=2");
      });
    });
  });

  describe("validateLocale logic", () => {
    const validateLocale = (
      options: I18nModuleOptions,
      locale: string,
    ): string => {
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

  describe("getClientConfig logic", () => {
    const getClientConfig = (options: I18nModuleOptions) => ({
      locales: options.locales,
      defaultLocale: options.defaultLocale,
      urlPattern: options.urlPattern,
      queryParam: options.queryParam,
    });

    it("should return client configuration", () => {
      const config = getClientConfig(mockOptions);

      expect(config).toEqual({
        locales: ["en", "fr", "es"],
        defaultLocale: "en",
        urlPattern: "query",
        queryParam: "lang",
      });
    });
  });
});
