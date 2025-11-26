# @hepta-solutions/harpy-cli

A CLI tool to create and manage NestJS projects with React/JSX support and automatic client-side hydration.

## Features

- 🚀 **Automatic Setup** - Creates a complete NestJS + React/JSX project with one command
- ⚡ **Fast Development** - Hot reload with automatic asset rebuilding
- 🎨 **Tailwind CSS v4** - Pre-configured with the latest Tailwind CSS
- 🔄 **Auto Hydration** - Client components automatically hydrate with `'use client'` directive
- 🌐 **I18n Ready** - Built-in internationalization with language switching
- 📦 **Zero Config** - Everything works out of the box
- 🚀 **Performance Optimized** - Shared vendor bundle + tiny component chunks (1-3KB)
- 🎯 **Production Ready** - Optimized builds with minification and tree-shaking

## Installation

```bash
npm install -g @hepta-solutions/harpy-cli
# or
yarn global add @hepta-solutions/harpy-cli
# or
pnpm add -g @hepta-solutions/harpy-cli
```

## Usage

### Create a new project

```bash
harpy create my-app
```

With options:

```bash
harpy create my-app --package-manager pnpm
harpy create my-app --skip-git
harpy create my-app --skip-install
```

### Options

- `-p, --package-manager <manager>` - Package manager to use (npm, yarn, pnpm). Default: pnpm
- `--skip-git` - Skip git repository initialization
- `--skip-install` - Skip dependency installation

## Project Structure

```
my-app/
├── src/
│   ├── features/
│   │   ├── home/
│   │   │   ├── home.controller.ts
│   │   │   ├── home.module.ts
│   │   │   ├── home.service.ts
│   │   │   └── views/
│   │   │       ├── homepage.tsx
│   │   │       └── counter.tsx       # Client component with 'use client'
│   │   ├── about/
│   │   ├── auth/                     # Login/Register with custom layout
│   │   └── dashboard/                # Dashboard with custom layout
│   ├── layouts/
│   │   ├── layout.tsx                # Default layout
│   │   ├── auth-layout.tsx           # Auth pages layout
│   │   └── dashboard-layout.tsx      # Dashboard layout
│   ├── components/
│   │   └── language-switcher.tsx     # I18n language switcher
│   ├── dictionaries/                 # I18n translation files
│   │   ├── en.json
│   │   └── fr.json
│   ├── i18n/
│   │   └── i18n.config.ts            # I18n configuration
│   ├── assets/
│   │   └── styles.css                # Tailwind CSS
│   ├── app.module.ts
│   └── main.ts
├── dist/                             # Compiled output
│   ├── chunks/                       # Hydration bundles
│   │   ├── vendor.js                 # Shared React bundle (188KB)
│   │   └── *.js                      # Component chunks (1-3KB each)
│   └── styles/                       # Compiled CSS
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Development

```bash
cd my-app
pnpm dev
```

This starts the development server with:

- Automatic NestJS rebuild on file changes
- Automatic hydration asset rebuilding
- Automatic style compilation
- Hot reload

## Creating Client Components

Just add `'use client'` at the top of your component:

```tsx
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

That's it! The component will automatically:

- Be wrapped for hydration
- Be bundled for the client
- Hydrate on the client-side

## Production Build

```bash
pnpm build
pnpm start:prod
```

The production build includes:
- ✅ Minified JavaScript bundles
- ✅ Optimized CSS with cssnano
- ✅ Tree-shaken dependencies
- ✅ Shared vendor bundle (188KB)
- ✅ Tiny component chunks (1-3KB each)

## What's Included

Your new project comes with:

- **NestJS 11** with Fastify adapter for high performance
- **React 19** with automatic hydration
- **Tailwind CSS v4** with PostCSS
- **I18n Support** pre-configured with English and French
- **Example Features**:
  - Home page with interactive counter
  - About page with color changer
  - Auth pages (login/register) with custom layout
  - Dashboard with analytics and custom layout
  - Language switcher component
- **Development Tools**:
  - Hot reload with file watching
  - Automatic asset rebuilding
  - TypeScript with JSX support

## Custom Layouts

Use the `@WithLayout` decorator to specify custom layouts for routes:

```typescript
import { Controller, Get } from '@nestjs/common';
import { JsxRender, WithLayout } from '@hepta-solutions/harpy-core';
import AuthLayout from './layouts/auth-layout';
import LoginPage from './views/login-page';

@Controller('auth')
@WithLayout(AuthLayout)  // Apply to entire controller
export class AuthController {
  @Get('login')
  @JsxRender(LoginPage)
  login() {
    return { title: 'Login' };
  }
}
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development
```

## License

MIT
