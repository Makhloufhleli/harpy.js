# NestJSX CLI

A CLI tool to create and manage NestJS projects with React/JSX support and automatic client-side hydration.

## Features

- 🚀 **Automatic Setup** - Creates a complete NestJS + React/JSX project with one command
- ⚡ **Fast Development** - Hot reload with automatic asset rebuilding
- 🎨 **Tailwind CSS** - Pre-configured with Tailwind CSS 4
- 🔄 **Auto Hydration** - Client components automatically hydrate with `'use client'` directive
- 📦 **Zero Config** - Everything works out of the box

## Installation

```bash
npm install -g nestjsx-cli
# or
yarn global add nestjsx-cli
# or
pnpm add -g nestjsx-cli
```

## Usage

### Create a new project

```bash
nestjsx create my-app
```

With options:

```bash
nestjsx create my-app --package-manager pnpm
nestjsx create my-app --skip-git
nestjsx create my-app --skip-install
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
│   │   └── about/
│   │       └── ...
│   ├── core/
│   │   └── views/
│   │       └── layout.tsx            # Default layout
│   ├── assets/
│   │   └── styles.css                # Tailwind CSS
│   ├── app.module.ts
│   └── main.ts
├── dist/                             # Compiled output
│   ├── chunks/                       # Hydration bundles
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
pnpm prod
```

## License

MIT
