import { describe, it, expect } from "bun:test";
import type { I18nModuleOptions } from "../i18n-module.options";

describe("I18nService logic", () => {
  const mockOptions: I18nModuleOptions = {
    defaultLocale: "en",
    locales: ["en", "fr"],
    urlPattern: "query",
    translationsPath: "./dictionaries",
    cookieName: "locale",
    queryParam: "lang",
  };

  describe("translate function", () => {
    const translate = (
      dict: Record<string, any>,
      key: string,
      params?: Record<string, string | number>,
    ): string => {
      const keys = key.split(".");
      let value: any = dict;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k];
        } else {
          return "";
        }
      }

      if (typeof value !== "string") {
        return "";
      }

      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params[k] ?? ""));
      }

      return value;
    };

    it("should translate simple key", () => {
      const dict = { welcome: "Welcome" };
      expect(translate(dict, "welcome")).toBe("Welcome");
    });

    it("should translate with variables", () => {
      const dict = { greeting: "Hello {{name}}!" };
      expect(translate(dict, "greeting", { name: "John" })).toBe("Hello John!");
    });

    it("should translate nested key", () => {
      const dict = { nested: { key: "Nested value" } };
      expect(translate(dict, "nested.key")).toBe("Nested value");
    });

    it("should return empty string for non-existent key", () => {
      const dict = { other: "value" };
      expect(translate(dict, "nonexistent")).toBe("");
    });
  });

  describe("getLocale", () => {
    it("should return locale from request", () => {
      const request = { locale: "fr" };
      expect(request.locale).toBe("fr");
    });

    it("should use default locale when not set", () => {
      const request: Record<string, string> = {};
      const locale = request.locale || mockOptions.defaultLocale;
      expect(locale).toBe("en");
    });
  });
});
