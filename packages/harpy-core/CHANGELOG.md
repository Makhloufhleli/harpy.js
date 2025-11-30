# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.4.6 (2025-11-30)

### Fixes

- **app-setup**: Guard optional Fastify plugins (`@fastify/static`, `@fastify/cookie`) behind try/catch so a missing optional dependency no longer crashes the application at startup. The app now logs a warning when those plugins are not installed instead of throwing.

### Features

- **navigation**: add support for explicit ordering and top-level items
  - `NavSection.order?: number` and `NavItem.order?: number` allow deterministic ordering of sections and items.
  - `registerItem(item)` lets consumers register navigation items that don't belong to a section; these are surfaced as an implicit top-level section.
  - `getSectionsForRoute(currentPath?)` returns sections with an `active` hint computed from the provided path without mutating the registry.
  - `getActiveItemId(currentPath?)` provides a fast lookup for the active item id.
  - Internal caching and an `hrefIndex` were added to make active-item resolution and section retrieval efficient.

- **client**: add a tiny client helper to mirror server normalization and matching
  - `packages/harpy-core/client/getActiveItemId.ts` (exported) — helpers: `buildHrefIndex`, `getActiveItemIdFromIndex`, `getActiveItemIdFromManifest`.
  - Exported `client/Link` for cleaner client imports.

### Tests

- Add unit tests for the client active-id helpers to ensure parity between server and client matching logic.

# 0.4.3 (2025-11-26)

### Performance

- **jsx-engine**: Critical performance optimizations to eliminate request stalling
  - **Single-pass rendering**: Eliminated duplicate `renderToString()` calls (~50% faster)
  - **Chunk path caching**: Preload hydration manifest at startup for O(1) component-to-chunk lookups
  - **Performance monitoring**: Added timing logs in development mode for render time visibility
  - Resolves intermittent 51+ second page stalls
  - Consistent 1-7ms render times under load
  - No blocking I/O operations in hot request paths

# 0.3.0 (2025-11-25)

### Features

- **i18n**: add complete internationalization module ([HASH](URL))
  - Type-safe translations with full TypeScript inference
  - Support for query and header-based URL patterns
  - Cookie persistence for locale preferences
  - API endpoints for locale switching (`/api/i18n/switch-locale`, `/api/i18n/config`)
  - React hook `useI18n()` for client-side locale switching
  - Decorator `@CurrentLocale()` for accessing current locale in controllers
  - Automatic locale detection from URLs, cookies, and headers
  - Nested key support with dot notation (e.g., `hero.title`)
  - Variable interpolation with type checking (e.g., `{{name}}`)
  - Built-in integration with Fastify via `@fastify/cookie`

# 0.2.0 (2025-11-24)

### Features

- add comprehensive testing infrastructure with Jest, Husky, and CI/CD ([d03d3f3](https://github.com/Makhloufhleli/harpy.js/commit/d03d3f37179010bc6525e2506b4b640727783f75))
- add multi-layout support with features-based architecture ([a9af7dd](https://github.com/Makhloufhleli/harpy.js/commit/a9af7dd415d91d88da67555be38354a979aa33dc))

# 0.1.0 (2025-11-24)

### Features

- add comprehensive testing infrastructure with Jest, Husky, and CI/CD ([d03d3f3](https://github.com/Makhloufhleli/harpy.js/commit/d03d3f37179010bc6525e2506b4b640727783f75))
- add multi-layout support with features-based architecture ([a9af7dd](https://github.com/Makhloufhleli/harpy.js/commit/a9af7dd415d91d88da67555be38354a979aa33dc))
