# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.3.4 (2025-11-26)

### Bug Fixes

* **cli-version**: Read version dynamically from package.json
  * Fixed `harpy --version` displaying incorrect hardcoded version (0.0.1)
  * Now reads version from package.json at runtime
  * Ensures version displayed matches published package version

# 0.3.3 (2025-11-26)

### Performance

* **i18n-template**: Add dictionary caching to eliminate repeated imports
  * In-memory caching for loaded dictionaries prevents re-importing on every request
  * ~7x speedup: First request 7ms → subsequent requests 1ms
  * Cache hit logging in development mode for debugging
  * Eliminates promise overhead from repeated dynamic imports
  * Generated projects include optimized `getDictionary()` function

### Dependencies

* Updated peer dependency to `@hepta-solutions/harpy-core@^0.4.3`

# 0.2.0 (2025-11-25)

### Features

* **i18n**: add i18n support to project templates ([HASH](URL))
  * Templates now include pre-configured i18n setup
  * Added `@fastify/cookie` dependency for locale persistence
  * Includes English and French dictionaries by default
  * Language switcher component example
  * Integration with `@hepta-solutions/harpy-core@0.3.0` i18n module
  * Updated `create` command to install i18n dependencies

### Dependencies

* Updated peer dependency to `@hepta-solutions/harpy-core@^0.3.0`

# 0.1.5 (2025-11-24)

### Bug Fixes

* Add React imports to template files ([084aaec](https://github.com/Makhloufhleli/harpy.js/commit/084aaec74457cb7bee67fb0991c45586c31d9ce5))
* **cli:** Fix linting errors and add dist to .gitignore (v0.0.9) ([4c465fa](https://github.com/Makhloufhleli/harpy.js/commit/4c465fa5a7c055ce2f799275ec163f6c0f6f30a5))
* **cli:** Move static file registration to main.ts and add fastify types ([d449099](https://github.com/Makhloufhleli/harpy.js/commit/d449099cdaf50fcd493e87c99c1f21fa0c5200f6))


### Features

* add comprehensive testing infrastructure with Jest, Husky, and CI/CD ([d03d3f3](https://github.com/Makhloufhleli/harpy.js/commit/d03d3f37179010bc6525e2506b4b640727783f75))
* add multi-layout support with features-based architecture ([a9af7dd](https://github.com/Makhloufhleli/harpy.js/commit/a9af7dd415d91d88da67555be38354a979aa33dc))
* **cli:** Add React imports to templates and 'start' script (v0.0.8) ([6ab4456](https://github.com/Makhloufhleli/harpy.js/commit/6ab44569ac499bd54fbaaaacf4db669962f1e023))





# 0.1.0 (2025-11-24)


### Bug Fixes

* Add React imports to template files ([084aaec](https://github.com/Makhloufhleli/harpy.js/commit/084aaec74457cb7bee67fb0991c45586c31d9ce5))
* **cli:** Fix linting errors and add dist to .gitignore (v0.0.9) ([4c465fa](https://github.com/Makhloufhleli/harpy.js/commit/4c465fa5a7c055ce2f799275ec163f6c0f6f30a5))
* **cli:** Move static file registration to main.ts and add fastify types ([d449099](https://github.com/Makhloufhleli/harpy.js/commit/d449099cdaf50fcd493e87c99c1f21fa0c5200f6))


### Features

* add comprehensive testing infrastructure with Jest, Husky, and CI/CD ([d03d3f3](https://github.com/Makhloufhleli/harpy.js/commit/d03d3f37179010bc6525e2506b4b640727783f75))
* add multi-layout support with features-based architecture ([a9af7dd](https://github.com/Makhloufhleli/harpy.js/commit/a9af7dd415d91d88da67555be38354a979aa33dc))
* **cli:** Add React imports to templates and 'start' script (v0.0.8) ([6ab4456](https://github.com/Makhloufhleli/harpy.js/commit/6ab44569ac499bd54fbaaaacf4db669962f1e023))
