# I18n (Internationalization) in Harpy

Harpy comes with built-in internationalization (i18n) support powered by TypeScript for full type safety.

## Features

✨ **Type-Safe Translations** - Full TypeScript autocomplete and type checking  
🎯 **Zero Runtime Overhead** - Compile-time validation  
🌐 **Multiple URL Patterns** - Query params or headers  
🍪 **Cookie Persistence** - Remember user's language preference  
⚡ **Easy API Switching** - Change locale with a simple API call  
📦 **Built-in React Hook** - `useI18n()` for client components

## Quick Start

### 1. Configuration

The i18n module is already configured in `src/app.module.ts`:

```typescript
import { I18nModule } from '@hepta-solutions/harpy-core';
import { i18nConfig } from './i18n/i18n.config';

@Module({
  imports: [
    I18nModule.forRoot(i18nConfig),
    // ... other modules
  ],
})
export class AppModule {}
```

### 2. Configuration Options

Edit `src/i18n/i18n.config.ts` to customize:

```typescript
export const i18nConfig: I18nModuleOptions = {
  defaultLocale: 'en',          // Fallback locale
  locales: ['en', 'fr'],        // Supported locales
  urlPattern: 'query',          // 'query' or 'header'
  translationsPath: '../dictionaries',
  cookieName: 'locale',         // Cookie name for persistence
  queryParam: 'lang',           // Query param name (if using 'query' pattern)
};
```

### 3. Add Your Translations

Create translation files in `src/dictionaries/`:

**en.json:**
```json
{
  "welcome": "Welcome",
  "greeting": "Hello {{name}}!"
}
```

**fr.json:**
```json
{
  "welcome": "Bienvenue",
  "greeting": "Bonjour {{name}} !"
}
```

Update `src/i18n/get-dictionary.ts` to include your locales:

```typescript
const dictionaries = {
  en: () => import('../dictionaries/en.json', { with: { type: 'json' } }).then(m => m.default),
  fr: () => import('../dictionaries/fr.json', { with: { type: 'json' } }).then(m => m.default),
};
```

## Usage

### In Controllers (Server-Side)

```typescript
import { Controller, Get } from '@nestjs/common';
import { JsxRender, CurrentLocale } from '@hepta-solutions/harpy-core';
import { getDictionary } from '../i18n/get-dictionary';
import MyPage from './views/my-page';

@Controller()
export class MyController {
  @Get()
  @JsxRender(MyPage)
  async getPage(@CurrentLocale() locale: string) {
    const dict = await getDictionary(locale);
    
    return {
      dict,
      locale,
    };
  }
}
```

### In Server Components (TSX)

```tsx
import { t } from '@hepta-solutions/harpy-core';
import { Dictionary } from '../i18n/get-dictionary';

interface PageProps {
  dict: Dictionary;
  locale: string;
}

export default function MyPage({ dict, locale }: PageProps) {
  return (
    <div>
      <h1>{t(dict, 'welcome')}</h1>
      <p>{t(dict, 'greeting', { name: 'John' })}</p>
    </div>
  );
}
```

### In Client Components

Use the `useI18n()` hook to switch locales:

```tsx
'use client';

import { useI18n } from '@hepta-solutions/harpy-core/client';

export function LanguageSwitcher() {
  const { switchLocale, isLoading } = useI18n();

  return (
    <div>
      <button onClick={() => switchLocale('en')} disabled={isLoading}>
        English
      </button>
      <button onClick={() => switchLocale('fr')} disabled={isLoading}>
        Français
      </button>
    </div>
  );
}
```

### Dynamic Metadata with Translations

You can translate page metadata (title, description, Open Graph, Twitter cards) using a dynamic meta function:

```tsx
import { Controller, Get } from '@nestjs/common';
import { JsxRender, CurrentLocale, t } from '@hepta-solutions/harpy-core';
import { getDictionary } from '../i18n/get-dictionary';
import MyPage, { type PageProps } from './views/my-page';

@Controller()
export class MyController {
  @Get()
  @JsxRender(MyPage, {
    // Dynamic metadata that uses translations
    meta: async (req, data: PageProps) => {
      const dict = data.dict;
      return {
        title: t(dict, 'hero.meta.title'),
        description: t(dict, 'hero.meta.description'),
        openGraph: {
          title: t(dict, 'hero.meta.title'),
          description: t(dict, 'hero.meta.description'),
          type: 'website',
          url: 'https://example.com',
        },
        twitter: {
          card: 'summary_large_image',
          title: t(dict, 'hero.meta.title'),
          description: t(dict, 'hero.meta.description'),
        },
      };
    },
  })
  async getPage(@CurrentLocale() locale: string): Promise<PageProps> {
    const dict = await getDictionary(locale);
    
    return {
      dict,
      locale,
    };
  }
}
```

Add the translations to your dictionary:

```json
{
  "hero": {
    "meta": {
      "title": "Welcome to My App",
      "description": "This is the homepage of my awesome app."
    }
  }
}
```

## URL Patterns

### Query Pattern (Recommended)

Set `urlPattern: 'query'` in config.

- URLs: `/?lang=en`, `/about?lang=fr`
- User-friendly and SEO-compatible
- Easy to share URLs

### Header Pattern

Set `urlPattern: 'header'` in config.

- No URL changes
- Uses `x-lang` or `accept-language` headers
- Best for APIs or when clean URLs are critical

## Type Safety

The `t()` function provides full TypeScript support:

```typescript
// ✅ Autocomplete for keys
t(dict, 'welcome')  // ✓

// ✅ Nested keys
t(dict, 'user.profile.name')  // ✓

// ✅ Variable validation
t(dict, 'greeting', { name: 'John' })  // ✓

// ❌ Invalid keys caught at compile time
t(dict, 'invalid.key')  // Type error!

// ❌ Missing variables caught at compile time
t(dict, 'greeting')  // Type error: missing 'name' variable
```

## Cookie Persistence

The locale preference is automatically saved in a cookie (default: `locale`).  
When users return, they'll see content in their preferred language.

## API Reference

### `I18nService`

Injectable service for translations:

```typescript
constructor(private i18n: I18nService) {}

async myMethod() {
  const locale = this.i18n.getLocale();
  const dict = await this.i18n.getDict();
  const text = await this.i18n.translate('welcome');
}
```

### `@CurrentLocale()` Decorator

Get the current locale in route handlers:

```typescript
@Get()
myRoute(@CurrentLocale() locale: string) {
  console.log('User locale:', locale);
}
```

### `t()` Function

Type-safe translation function:

```typescript
t(dict, 'key')                    // Simple translation
t(dict, 'nested.key')             // Nested keys
t(dict, 'greeting', { name: 'John' })  // With variables
```

### `useI18n()` Hook

Client-side hook for locale switching:

```typescript
const { switchLocale, isLoading, error } = useI18n();

await switchLocale('fr');  // Switch to French
```

## Adding More Languages

1. Create `src/dictionaries/{locale}.json`
2. Add the locale to `i18nConfig.locales`
3. Update `src/i18n/get-dictionary.ts` to import the new file
4. Add a button in your language switcher

```typescript
// i18n.config.ts
locales: ['en', 'fr', 'es', 'de']

// get-dictionary.ts
const dictionaries = {
  en: () => import('../dictionaries/en.json', { with: { type: 'json' } }).then(m => m.default),
  fr: () => import('../dictionaries/fr.json', { with: { type: 'json' } }).then(m => m.default),
  es: () => import('../dictionaries/es.json', { with: { type: 'json' } }).then(m => m.default),
  de: () => import('../dictionaries/de.json', { with: { type: 'json' } }).then(m => m.default),
};
```

## Best Practices

✅ **Use Nested Keys** - Organize translations by feature or page  
✅ **Keep Keys Semantic** - Use descriptive keys like `nav.home` instead of `home1`  
✅ **Type Everything** - Let TypeScript catch translation errors  
✅ **Consistent Structure** - Keep the same structure across all locale files  
✅ **Extract Common Strings** - Reuse common translations like buttons and labels

## Troubleshooting

### Translations not updating

Make sure you've built the project after adding new translations:
```bash
npm run build
```

### Cookie not persisting

Ensure `@fastify/cookie` is registered in `main.ts`:
```typescript
await fastify.register(fastifyCookie);
```

### Type errors with t()

Make sure you're importing the correct `Dictionary` type from `get-dictionary.ts`.

## License

MIT
