import { describe, it, expect } from "bun:test";
import type { I18nModuleOptions } from "../i18n-module.options";

describe("I18n Locale Detection Logic", () => {
  const mockOptions: I18nModuleOptions = {
    defaultLocale: "en",
    locales: ["en", "fr", "es"],
    urlPattern: "query",
    translationsPath: "./dictionaries",
    cookieName: "locale",
    queryParam: "lang",
  };

  const detectLocale = (
    options: I18nModuleOptions,
    request: {
      query?: Record<string, string>;
      headers?: Record<string, string>;
    },
  ): string => {
    // 1. Check query parameter
    if (request.query && request.query[options.queryParam!]) {
      const queryLocale = request.query[options.queryParam!];
      if (options.locales.includes(queryLocale)) {
        return queryLocale;
      }
    }

    // 2. Check cookie
    if (request.headers?.cookie) {
      const cookieMatch = request.headers.cookie.match(
        new RegExp(`${options.cookieName}=([^;]+)`),
      );
      if (cookieMatch) {
        const cookieLocale = cookieMatch[1];
        if (options.locales.includes(cookieLocale)) {
          return cookieLocale;
        }
      }
    }

    // 3. Check Accept-Language header
    if (request.headers?.["accept-language"]) {
      const acceptLanguage = request.headers["accept-language"];
      const languages = acceptLanguage.split(",").map((l) => l.split(";")[0].trim().split("-")[0]);
      for (const lang of languages) {
        if (options.locales.includes(lang)) {
          return lang;
        }
      }
    }

    return options.defaultLocale;
  };

  describe("Query parameter locale detection", () => {
    it("should extract locale from query parameter", () => {
      const request = {
        query: { lang: "fr" },
        headers: {},
      };
      expect(detectLocale(mockOptions, request)).toBe("fr");
    });

    it("should ignore invalid query locale", () => {
      const request = {
        query: { lang: "invalid" },
        headers: {},
      };
      expect(detectLocale(mockOptions, request)).toBe("en");
    });
  });

  describe("Cookie locale detection", () => {
    it("should extract locale from cookie", () => {
      const request = {
        query: {},
        headers: {
          cookie: "locale=fr; other=value",
        },
      };
      expect(detectLocale(mockOptions, request)).toBe("fr");
    });

    it("should ignore invalid cookie locale", () => {
      const request = {
        query: {},
        headers: {
          cookie: "locale=invalid",
        },
      };
      expect(detectLocale(mockOptions, request)).toBe("en");
    });
  });

  describe("Accept-Language header detection", () => {
    it("should extract locale from accept-language header", () => {
      const request = {
        query: {},
        headers: {
          "accept-language": "fr-FR,fr;q=0.9,en;q=0.8",
        },
      };
      expect(detectLocale(mockOptions, request)).toBe("fr");
    });
  });

  describe("Locale priority", () => {
    it("should prioritize query over cookie", () => {
      const request = {
        query: { lang: "es" },
        headers: {
          cookie: "locale=fr",
        },
      };
      expect(detectLocale(mockOptions, request)).toBe("es");
    });

    it("should prioritize cookie over accept-language header", () => {
      const request = {
        query: {},
        headers: {
          cookie: "locale=fr",
          "accept-language": "es-ES,es;q=0.9,en;q=0.8",
        },
      };
      expect(detectLocale(mockOptions, request)).toBe("fr");
    });

    it("should fall back to default locale when nothing matches", () => {
      const request = {
        query: {},
        headers: {},
      };
      expect(detectLocale(mockOptions, request)).toBe("en");
    });
  });
});
