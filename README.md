# 🦅 Harpy

**Harpy** - A powerful NestJS + React/JSX SSR framework with automatic hydration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 🚀 What is Harpy?

Harpy is a meta-framework that extends **NestJS** with **server-side React rendering** and **automatic client-side hydration**. It solves the performance and complexity issues found in other full-stack frameworks by:

- ✅ Using NestJS's powerful architecture as the foundation
- ✅ Enabling React/JSX for server-side rendering
- ✅ Automatically detecting and hydrating client components
- ✅ Zero configuration for most use cases
- ✅ Full TypeScript support throughout

## 📦 Packages

This monorepo contains:

- **`@hepta-solutions/harpy-core`**: Core rendering engine, hydration system, and build tools
- **`@hepta-solutions/harpy-cli`**: CLI tool for creating and managing Harpy projects

## ⚡ Quick Start

### Installation

```bash
# Using npm
npm install -g @hepta-solutions/harpy-cli

# Using pnpm
pnpm add -g @hepta-solutions/harpy-cli

# Using yarn
yarn global add @hepta-solutions/harpy-cli
```

### Create a New Project

```bash
harpy create my-app
cd my-app
pnpm install
pnpm run start:dev
```

Your app will be running at `http://localhost:3000`!

## 🎯 Key Features

### 🔥 Automatic Hydration

Simply add `'use client'` to any React component, and Harpy will automatically:

1. Detect it during build
2. Generate hydration bundles
3. Inject hydration scripts
4. Make it interactive on the client

```tsx
"use client";

export default function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
```

### 🏗️ NestJS Architecture

Build on the solid foundation of NestJS:

- Dependency injection
- Modular architecture
- Powerful decorators
- Enterprise-ready patterns

```typescript
import { Controller, Get } from "@nestjs/common";
import { JsxRender } from "harpy-core";
import HomePage from "./views/homepage";

@Controller()
export class HomeController {
  @Get()
  @JsxRender(HomePage)
  getHome() {
    return {
      props: { items: ["Item 1", "Item 2", "Item 3"] },
    };
  }
}
```

### 🎨 Tailwind CSS Support

Built-in Tailwind CSS 4.0 support with automatic compilation and hot reload.

### ⚡ Fast Development

- Hot reload for server and client code
- Automatic TypeScript compilation
- Live hydration updates
- Instant feedback loop

## 📚 Documentation

- [Core Package](./packages/harpy-core/README.md)
- [CLI Package](./packages/harpy-cli/README.md)
- [Project State](./PROJECT_STATE.md)

## 🛠️ Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/Makhloufhleli/harpy.js
cd harpy.js

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test
```

### Local Development

```bash
# Build and pack harpy-core
cd packages/harpy-core
pnpm build
npm pack

# Build harpy-cli
cd ../harpy-cli
pnpm build
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          NestJS Application              │
│  (Controllers, Services, Modules)        │
└─────────────┬───────────────────────────┘
              │
              │ withJsxEngine()
              ▼
┌─────────────────────────────────────────┐
│        Harpy JSX Engine                  │
│  - Server-side rendering                 │
│  - Component detection                   │
│  - Hydration manifest                    │
└─────────────┬───────────────────────────┘
              │
              ├──────────────┬──────────────┐
              ▼              ▼              ▼
         ┌────────┐    ┌─────────┐    ┌────────┐
         │Server  │    │Client   │    │Static  │
         │Side    │    │Side     │    │Assets  │
         │React   │    │Hydration│    │CSS/JS  │
         └────────┘    └─────────┘    └────────┘
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for detailed information on:

- Development workflow
- Branch naming conventions
- Commit message format
- Pull request process
- Code style guidelines

Before submitting a PR, make sure to review the full guidelines in [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

MIT

## 🙏 Credits

Built with:

- [NestJS](https://nestjs.com/)
- [React](https://react.dev/)
- [Fastify](https://fastify.dev/)
- [esbuild](https://esbuild.github.io/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Harpy** - Soar above the competition with powerful full-stack development 🦅
