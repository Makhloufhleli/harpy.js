<p align="center">
  <span style="font-size: 120px;">🦅</span>
</p>

<h1 align="center">Harpy.js Application</h1>

<p align="center">A full-stack application built with <strong>Harpy.js</strong> - leveraging NestJS ecosystem with React SSR.</p>

> **⚠️ Beta Version**: Harpy.js is currently in beta. Features may change, and you might encounter bugs. We appreciate your feedback!

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Your application will be available at `http://localhost:3000`

## 🛠️ Tech Stack

- **Framework**: [Harpy.js](https://github.com/Makhloufhleli/harpy.js) (NestJS 11 + React 19 SSR)
- **Runtime**: Node.js with Fastify
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Compiler**: SWC (ultra-fast compilation)

## 📦 What's Included

- ✅ Server-side React rendering (1-7ms render times)
- ✅ Automatic client-side hydration
- ✅ Built-in internationalization (i18n)
- ✅ Hot module replacement
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ NestJS dependency injection
- ✅ Modular architecture

## 🏗️ Project Structure

```
src/
├── features/          # Feature modules
│   ├── home/          # Homepage feature
│   │   ├── views/
│   │   ├── home.controller.ts
│   │   ├── home.service.ts
│   │   └── home.module.ts
│   └── about/         # About page feature
│       ├── views/
│       ├── about.controller.ts
│       ├── about.service.ts
│       └── about.module.ts
├── layouts/           # Layout components
│   └── layout.tsx
├── core/              # Core functionality
│   └── views/
├── i18n/              # Internationalization
│   ├── dictionaries/
│   └── get-dictionary.ts
├── assets/            # Static assets and styles
├── app.module.ts      # Root module
└── main.ts            # Application entry point
```

## 🎨 Creating Components

### Server Components (Default)

```tsx
export default function MyComponent({ data }: Props) {
  return <div>{data}</div>;
}
```

### Client Components (Interactive)

Add `'use client'` at the top:

```tsx
'use client';
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## 🌍 Internationalization

Harpy.js includes built-in i18n support. See `I18N_GUIDE.md` for details.

```tsx
import { t } from '@hepta-solutions/harpy-core';

// In your component
<h1>{t(dict.welcome)}</h1>
```

## 🔧 Adding New Routes

1. Create a new feature folder in `src/features/`
2. Add controller, service, and module files
3. Create views in the `views/` subfolder
4. Import module in `app.module.ts`

Example controller:

```typescript
import { Controller, Get } from '@nestjs/common';
import { JsxRender } from '@hepta-solutions/harpy-core';
import MyPage from './views/mypage';

@Controller('my-route')
export class MyController {
  @Get()
  @JsxRender(MyPage, {
    meta: async () => ({
      title: 'My Page',
      description: 'Page description'
    })
  })
  async index() {
    return { data: 'Hello World' };
  }
}
```

## 📝 Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run linter
- `pnpm format` - Format code with Prettier

## 🚀 Performance

Harpy.js delivers exceptional performance:

- **SSR Render Time**: 1-7ms
- **Automatic Code Splitting**: Client components are automatically split
- **Optimized Hydration**: Only interactive components hydrate on client
- **Fast Refresh**: Instant feedback during development

## 📚 Learn More

- **Documentation**: [Harpy.js Docs](https://github.com/Makhloufhleli/harpyjs-docs)
- **Framework Repository**: [Harpy.js on GitHub](https://github.com/Makhloufhleli/harpy.js)
- **NestJS Docs**: [NestJS Documentation](https://docs.nestjs.com)
- **React Docs**: [React Documentation](https://react.dev)

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on the [Harpy.js repository](https://github.com/Makhloufhleli/harpy.js/issues).

## 👨‍💻 Author

Built with ❤️ by [Makhlouf Helali](https://github.com/Makhloufhleli)

## 📄 License

This project is part of the Harpy.js framework ecosystem.

---

**Happy coding with Harpy.js! 🦅**
