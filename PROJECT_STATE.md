# Harpy Monorepo - Project State

**Last Updated:** November 23, 2025

## Overview

Harpy is a Next.js 15-style React framework for NestJS that enables automatic client component hydration. Developers simply add `'use client'` directive to React components and the framework handles everything automatically - no manual wrapping required.

## Monorepo Structure

```
harpy-monorepo/
├── packages/
│   ├── harpy-core/          # Core rendering engine and build tools
│   └── harpy-cli/           # CLI tool for project generation
├── package.json               # Monorepo root config
├── lerna.json                 # Lerna configuration
├── pnpm-workspace.yaml        # pnpm workspace config
└── README.md
```

## Package: harpy-core

**Version:** 1.0.0  
**Purpose:** Core engine with JSX rendering, hydration system, and build automation

### Key Features

1. **JSX Rendering Engine** (`src/core/jsx.engine.ts`)
   - Integrates with NestJS using Fastify adapter
   - Server-side rendering of React components
   - Automatic hydration script injection
   - `withJsxEngine()` function to configure NestJS app

2. **Automatic Client Component Wrapping** (`src/core/client-component-wrapper.ts`)
   - `autoWrapClientComponent()` wrapper function
   - Tracks component instances during SSR
   - Registers components for hydration

3. **Hydration System** (`src/core/hydration.ts`, `src/core/client-hydration.tsx`)
   - Context-based hydration tracking during SSR
   - Client-side hydration via React 19 `hydrateRoot()`
   - Manifest-based chunk resolution with cache busting

4. **Build Scripts** (`scripts/`)
   - `build-hydration.ts` - Detects 'use client', generates hydration entries, bundles with esbuild
   - `auto-wrap-exports.ts` - Post-processes compiled JS to inject wrapper calls
   - `build-page-styles.ts` - Compiles Tailwind CSS from components
   - `dev.ts` - Development server with auto-rebuild on file changes

5. **Decorators** (`src/decorators/jsx.decorator.ts`)
   - `@JsxRender()` decorator for controller methods
   - Simplifies JSX rendering in route handlers

### Dependencies

**Peer Dependencies:**
- `@nestjs/common` ^11.0.0
- `@nestjs/core` ^11.0.0
- `@nestjs/platform-fastify` ^11.0.0
- `react` ^19.0.0
- `react-dom` ^19.0.0

**Direct Dependencies:**
- `esbuild` ^0.24.2 (client component bundling)
- `chokidar` ^3.6.0 (file watching in dev mode)

### Build Configuration

- **TypeScript:** ES2022 target, CommonJS modules
- **Output:** `dist/` directory with type declarations
- **Entry Point:** `dist/index.js`
- **CLI Binary:** `dist/cli.js` (harpy command)

### Public API Exports

```typescript
// Engine
export { withJsxEngine } from './core/jsx.engine';
export { HydrationProvider } from './core/hydration';

// Decorator
export { JsxRender } from './decorators/jsx.decorator';

// Client wrapper
export { autoWrapClientComponent } from './core/client-component-wrapper';

// Manifest utilities
export { getChunkPath } from './core/hydration-manifest';
```

## Package: harpy-cli

**Version:** 1.0.0  
**Purpose:** CLI tool to bootstrap NestJS projects with React/JSX support

### Commands

**`harpy create <project-name> [--package-manager <pm>]`**

Creates a new NestJS project with full React/JSX setup:

1. Scaffolds NestJS project using `@nestjs/cli`
2. Installs React 19 and dependencies
3. Installs `harpy-core` package
4. Installs Tailwind CSS 4
5. Copies project templates (features, layouts, configs)
6. Updates package.json scripts
7. Initializes git repository

### Template Structure

The CLI includes complete project templates in `templates/app/`:

```
templates/app/
├── src/
│   ├── features/
│   │   ├── home/           # Example home module
│   │   │   ├── home.controller.ts
│   │   │   ├── home.module.ts
│   │   │   ├── home.service.ts
│   │   │   └── views/
│   │   │       ├── counter.tsx        # 'use client' example
│   │   │       └── homepage.tsx
│   │   └── about/          # Example about module
│   │       ├── about.controller.ts
│   │       ├── about.module.ts
│   │       ├── about.service.ts
│   │       └── views/
│   │           ├── about-counter.tsx  # 'use client' example
│   │           ├── aboutpage.tsx
│   │           └── color-change.tsx   # 'use client' example
│   ├── core/
│   │   └── views/
│   │       └── layout.tsx             # Default HTML layout
│   ├── assets/
│   │   └── styles.css                 # Tailwind CSS entry
│   ├── app.module.ts
│   └── main.ts
├── tailwind.config.js
├── postcss.config.js
└── swc-client-component-plugin.js
```

### Dependencies

- `commander` ^11.1.0 (CLI framework)
- `chalk` ^4.1.2 (colored output)
- `ora` ^5.4.1 (spinners)
- `prompts` ^2.4.2 (interactive prompts)
- `fs-extra` ^11.2.0 (file operations)
- `execa` ^5.1.1 (process execution)

### Build Configuration

- **TypeScript:** ES2022 target, CommonJS modules
- **Output:** `dist/` directory with type declarations
- **Entry Point:** `dist/index.js`
- **Binary:** `bin/harpy.js` (executable entry point)

## How It Works

### Build Pipeline

**Production Build:**
```bash
nest build                    # Compile TypeScript with SWC
→ harpy build-hydration    # Detect 'use client', bundle components
→ harpy auto-wrap          # Inject autoWrapClientComponent calls
→ harpy build-styles       # Compile Tailwind CSS
```

**Development Mode:**
```bash
harpy dev                  # Start NestJS in watch mode
                            # Auto-rebuild assets on file changes
                            # Uses stdout detection for fast rebuilds (~3-4s)
```

### Auto-Wrapping System

1. Developer adds `'use client'` to React component
2. TypeScript/SWC compiles to: `const _default = ComponentName;`
3. `auto-wrap-exports.ts` transforms to:
   ```javascript
   var { autoWrapClientComponent: _autoWrapClientComponent } = require("../../core/client-component-wrapper");
   const _default = _autoWrapClientComponent(ComponentName, 'ComponentName');
   ```
4. During SSR, wrapper tracks component usage
5. Hydration scripts injected into HTML
6. Client-side hydration happens automatically

### Hydration Flow

**Server-Side (SSR):**
1. Request comes in, controller calls `@JsxRender()` decorated method
2. `HydrationProvider` context tracks component registrations
3. Components call `registerComponent()` during render
4. After render, collect registered components
5. Inject hydration scripts into HTML via `getHydrationScripts()`

**Client-Side:**
1. Page loads with hydration scripts
2. Each script loads and hydrates its component
3. Uses `hydrateRoot()` from React 19
4. Component becomes interactive

### Cache Busting

Chunk filenames include timestamps: `Counter-1732123456789.js`  
Manifest maps component names to current chunk paths.

## Current Status

### ✅ Completed

- [x] Lerna monorepo initialized in `/Users/user/Workspaces/HEPTA/harpy-monorepo`
- [x] Both packages (`harpy-core`, `harpy-cli`) copied to monorepo
- [x] Dependencies installed via pnpm workspaces
- [x] Package configurations set up (package.json, tsconfig.json)
- [x] Template files included in CLI package
- [x] Fixed TypeScript compilation errors in both packages
  - [x] Replaced `@/` path aliases with relative imports
  - [x] Added DOM lib to tsconfig for client-side code
  - [x] Installed fastify types as dev dependency
  - [x] Fixed cli.ts type annotations (added Record<string, string> type)
  - [x] Fixed hydration-manifest export (changed `loadManifest` to `getHydrationManifest`)
  - [x] Removed unused static-assets.controller.ts (static files handled by @fastify/static plugin)
- [x] Build packages successfully (`pnpm run build`) ✨

### ⚠️ In Progress

- [ ] Test CLI locally with `npm link`
- [ ] Create test project to verify end-to-end functionality

### 🔧 Known Issues

None - All compilation errors resolved!

### 📋 Next Steps

1. **Fix TypeScript Errors:**
   - Remove `@/` path aliases, use relative imports
   - Add DOM lib to tsconfig for client code
   - Install missing type packages
   - Fix `cli.ts` type annotations

2. **Build Packages:**
   ```bash
   cd /Users/user/Workspaces/HEPTA/harpy-monorepo
   pnpm run build
   ```

3. **Test Locally:**
   ```bash
   # Link packages
   cd packages/harpy-core && npm link
   cd ../harpy-cli && npm link
   
   # Create test project
   mkdir -p /tmp/harpy-test
   cd /tmp/harpy-test
   harpy create my-test-app
   cd my-test-app
   pnpm dev
   ```

4. **Verify Features:**
   - Dev server starts (~3-4s)
   - Client components hydrate correctly
   - Styles apply (Tailwind CSS)
   - Auto-rebuild works on file changes
   - Production build works

5. **Prepare for Publishing:**
   ```bash
   # Version packages
   pnpm run version
   
   # Publish to npm
   pnpm run publish
   ```

## Development Workflow

**Add new feature to core:**
```bash
cd packages/harpy-core
# Edit files in src/
pnpm build
```

**Update CLI templates:**
```bash
cd packages/harpy-cli
# Edit files in templates/app/
pnpm build
```

**Test changes:**
```bash
# From monorepo root
pnpm run build
# Then test with npm link as described above
```

## Architecture Decisions

1. **Lerna + pnpm Workspaces:** Independent versioning, efficient dependency management
2. **CommonJS Modules:** Better compatibility with NestJS ecosystem
3. **esbuild for Bundling:** Fast client component bundling (10-20ms per component)
4. **React 19:** Latest features including `hydrateRoot()` improvements
5. **Fastify Adapter:** Better performance than Express for SSR
6. **SWC Compiler:** Fast TypeScript compilation in NestJS projects
7. **Tailwind CSS 4:** Modern styling with PostCSS integration

## Reference Implementation

Original working prototype: `/Users/user/Workspaces/HEPTA/nestjs-jsx/`

This contains the fully functional implementation that the packages are based on. Use it as reference when fixing issues or adding features.

## Resources

- **Lerna Documentation:** https://lerna.js.org/
- **pnpm Workspaces:** https://pnpm.io/workspaces
- **NestJS:** https://nestjs.com/
- **React 19:** https://react.dev/
- **esbuild:** https://esbuild.github.io/

---

**For questions or contributions:** Makhlouf Hleli
**Repository:** https://github.com/Makhloufhleli/harpy
