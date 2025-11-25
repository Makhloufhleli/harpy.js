# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.3.0 (2025-11-25)

### Features

* **i18n**: add complete internationalization module ([HASH](URL))
  * Type-safe translations with full TypeScript inference
  * Support for query and header-based URL patterns
  * Cookie persistence for locale preferences
  * API endpoints for locale switching (`/api/i18n/switch-locale`, `/api/i18n/config`)
  * React hook `useI18n()` for client-side locale switching
  * Decorator `@CurrentLocale()` for accessing current locale in controllers
  * Automatic locale detection from URLs, cookies, and headers
  * Nested key support with dot notation (e.g., `hero.title`)
  * Variable interpolation with type checking (e.g., `{{name}}`)
  * Built-in integration with Fastify via `@fastify/cookie`

# 0.2.0 (2025-11-24)

### Features

* add comprehensive testing infrastructure with Jest, Husky, and CI/CD ([d03d3f3](https://github.com/Makhloufhleli/harpy.js/commit/d03d3f37179010bc6525e2506b4b640727783f75))
* add multi-layout support with features-based architecture ([a9af7dd](https://github.com/Makhloufhleli/harpy.js/commit/a9af7dd415d91d88da67555be38354a979aa33dc))





# 0.1.0 (2025-11-24)


### Features

* add comprehensive testing infrastructure with Jest, Husky, and CI/CD ([d03d3f3](https://github.com/Makhloufhleli/harpy.js/commit/d03d3f37179010bc6525e2506b4b640727783f75))
* add multi-layout support with features-based architecture ([a9af7dd](https://github.com/Makhloufhleli/harpy.js/commit/a9af7dd415d91d88da67555be38354a979aa33dc))
