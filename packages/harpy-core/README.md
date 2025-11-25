# @hepta-solutions/harpy-core

Core package for NestJS + React/JSX with server-side rendering and automatic client-side hydration.

## Features

- 🎯 **JSX Engine** - Render React components in NestJS controllers
- 🔄 **Auto Hydration** - Client components marked with `'use client'` automatically hydrate
- ⚡ **Fast Builds** - Optimized build pipeline with esbuild
- 📦 **Zero Config** - Works out of the box with NestJS
- 🌐 **I18n Support** - Built-in internationalization with type-safe translations
- 🍪 **Cookie Management** - Integrated with Fastify for session management

## Installation

```bash
npm install @hepta-solutions/harpy-core
# or
yarn add @hepta-solutions/harpy-core
# or
pnpm add @hepta-solutions/harpy-core
```

## Quick Start

### 1. Set up the JSX engine in your main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { withJsxEngine } from '@hepta-solutions/harpy-core';
import { AppModule } from './app.module';
import DefaultLayout from './views/layout';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Enable JSX rendering
  withJsxEngine(app, DefaultLayout);

  await app.listen(3000);
}

bootstrap();
```

### 2. Create a layout component

```tsx
// src/views/layout.tsx
import React from 'react';
import { JsxLayoutProps } from '@hepta-solutions/harpy-core';

export default function Layout({
  children,
  meta,
  hydrationScripts,
}: JsxLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{meta?.title || 'My App'}</title>
        <link rel="stylesheet" href="/styles/styles.css" />
      </head>
      <body>
        <main id="body">{children}</main>
        {hydrationScripts?.map((script) => (
          <script key={script.componentName} src={script.path} />
        ))}
      </body>
    </html>
  );
}
```

### 3. Create a controller with JSX rendering

```typescript
import { Controller, Get } from '@nestjs/common';
import { JsxRender } from 'harpy-core';
import Homepage from './views/homepage';

@Controller()
export class HomeController {
  @Get()
  @JsxRender(Homepage, {
    meta: {
      title: 'Welcome',
      description: 'My homepage',
    },
  })
  home() {
    return {
      message: 'Hello World',
    };
  }
}
```

### 4. Create your page component

```tsx
// src/features/home/views/homepage.tsx
import React from 'react';
import Counter from './counter';

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
'use client';

import React from 'react';

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
4. **Client Bundling**: Client components are bundled separately with esbuild
5. **Hydration**: Client bundles are loaded in the browser and hydrate the SSR'd HTML

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
