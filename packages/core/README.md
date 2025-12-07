# @harpy-js/core

Core package for NestJS + React/JSX with server-side rendering and automatic client-side hydration.

## Features

- 🎯 **JSX Engine** - Render React components in NestJS controllers
- 🔄 **Auto Hydration** - Client components marked with `'use client'` automatically hydrate
- ⚡ **Fast Builds** - Optimized build pipeline with esbuild
- 🚀 **Performance Optimized** - Shared vendor bundle (188KB) + tiny component chunks (1-3KB)
- 📦 **Zero Config** - Works out of the box with NestJS
- 🌐 **I18n Support** - Built-in internationalization with type-safe translations
- 🍪 **Cookie Management** - Integrated with Fastify for session management
- 🎨 **CSS Optimization** - Automatic minification with cssnano in production

## Installation

```bash
npm install @harpy-js/core react react-dom
# or
yarn add @harpy-js/core react react-dom
# or
pnpm add @harpy-js/core react react-dom
```

**Required peer dependencies:**

- `@nestjs/common` ^11.0.0
- `@nestjs/core` ^11.0.0
- `@nestjs/platform-fastify` ^11.0.0
- `react` ^19.0.0
- `react-dom` ^19.0.0

## Quick Start

### 1. Set up the JSX engine in your main.ts

```typescript
import "reflect-metadata"; // Required for NestJS
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { withJsxEngine } from "@harpy-js/core";
import { AppModule } from "./app.module";
import DefaultLayout from "./views/layout";
import * as path from "path";
import fastifyStatic from "@fastify/static";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Enable JSX rendering
  withJsxEngine(app, DefaultLayout);

  // Register static file serving
  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), "dist"),
    prefix: "/",
  });

  await app.listen({
    port: 3000,
    host: "0.0.0.0",
  });
}

bootstrap();
```

### 2. Create a layout component

```tsx
// src/views/layout.tsx
import React from "react";
import { JsxLayoutProps } from "@ harpy-js/core";

export default function Layout({
  children,
  meta,
  hydrationScripts,
}: JsxLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{meta?.title || "My App"}</title>
        {meta?.description && (
          <meta name="description" content={meta.description} />
        )}
        <link rel="stylesheet" href="/styles/styles.css" />
      </head>
      <body>
        <main id="body">{children}</main>
        {/* Vendor bundle loads React/ReactDOM once */}
        {hydrationScripts?.vendorScript && (
          <script src={hydrationScripts.vendorScript} />
        )}
        {/* Component-specific hydration scripts */}
        {hydrationScripts?.componentScripts?.map((script) => (
          <script key={script.componentName} src={script.path} />
        ))}
      </body>
    </html>
  );
}
```

### 3. Create a controller with JSX rendering

```typescript
import { Controller, Get } from "@nestjs/common";
import { JsxRender } from "@ harpy-js/core";
import Homepage from "./views/homepage";

@Controller()
export class HomeController {
  @Get()
  @JsxRender(Homepage, {
    meta: {
      title: "Welcome",
      description: "My homepage",
    },
  })
  home() {
    return {
      message: "Hello World",
    };
  }
}
```

### 4. Create your page component

```tsx
// src/features/home/views/homepage.tsx
import React from "react";
import Counter from "./counter";

export default function Homepage({ message }) {
  return (
    <div>
      <h1>{message}</h1>
      <Counter />
    </div>
  );
}
```

### 5. Create a client component

```tsx
// src/features/home/views/counter.tsx
"use client";

import React from "react";

export default function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

## API Reference

### `withJsxEngine(app, defaultLayout)`

Sets up the JSX rendering engine on a NestJS Fastify application.

**Parameters:**

- `app` - NestFastifyApplication instance
- `defaultLayout` - React component to use as the default layout

### `@JsxRender(component, options?)`

Decorator to render a React component from a controller method.

**Parameters:**

- `component` - React component to render
- `options` - Rendering options
  - `meta` - Meta tags for the page (title, description, og tags, etc.)
  - `layout` - Custom layout component (optional)

### `autoWrapClientComponent(Component, componentName)`

Wraps a component for automatic hydration. Used internally by the build process.

## Build Scripts

The package includes CLI commands for building:

```bash
# Build hydration bundles
harpy build-hydration

# Auto-wrap client components
harpy auto-wrap

# Build styles
harpy build-styles

# Development mode
harpy dev
```

## How It Works

1. **Server-Side Rendering**: Components are rendered to HTML on the server
2. **Component Registration**: Client components (marked with `'use client'`) register themselves during SSR
3. **Auto-Wrapping**: Build scripts automatically wrap client components for hydration
4. **Vendor Bundle Optimization**: React and ReactDOM are bundled once (188KB) and shared across all components
5. **Client Bundling**: Client components are bundled separately with esbuild (1-3KB each)
6. **Hydration**: Client bundles load React from the shared vendor and hydrate the SSR'd HTML

## Performance Optimizations

The framework implements several performance optimizations:

- **Shared Vendor Bundle**: React (19.x) and ReactDOM are bundled once (188KB minified) instead of being duplicated in each component
- **Tiny Component Chunks**: Individual components are only 1-3KB each (97% reduction compared to bundling React in each)
- **Tree Shaking**: Unused code is automatically removed during production builds
- **CSS Minification**: Stylesheets are automatically minified with cssnano in production
- **Production Mode**: `process.env.NODE_ENV` is properly set to enable React optimizations

## Internationalization (i18n)

Built-in support for multi-language applications:

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { I18nModule } from "@ harpy-js/i18n";

@Module({
  imports: [
    I18nModule.forRoot({
      defaultLocale: "en",
      supportedLocales: ["en", "fr", "ar"],
      dictionaries: {
        en: () => import("./dictionaries/en.json"),
        fr: () => import("./dictionaries/fr.json"),
        ar: () => import("./dictionaries/ar.json"),
      },
    }),
  ],
})
export class AppModule {}
```

**Using translations in components:**

```tsx
// Client component
"use client";
import { useI18n } from "@ harpy-js/core/client";

export default function MyComponent() {
  const { t, locale, setLocale } = useI18n();

  return (
    <div>
      <h1>{t("welcome.title")}</h1>
      <button onClick={() => setLocale("fr")}>Switch to French</button>
    </div>
  );
}
```

**Using translations in controllers (server-side):**

```typescript
import { Controller, Get } from "@nestjs/common";
import { JsxRender } from "@ harpy-js/core";
import { CurrentLocale, t } from "@ harpy-js/i18n";
import { getDictionary } from "./i18n/get-dictionary";

@Controller()
export class HomeController {
  @Get()
  @JsxRender(Homepage)
  async home(@CurrentLocale() locale: string) {
    const dict = await getDictionary(locale);

    return {
      title: t(dict, "home.title"),
      message: t(dict, "home.welcome"),
      dict,
      locale,
    };
  }
}
```

## TypeScript Configuration

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "esModuleInterop": true,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## License

MIT
