# SPA Navigation in Harpy.js

Harpy.js provides a built-in client-side navigation system similar to Next.js, allowing you to navigate between routes without full page reloads.

## Features

- 🚀 **Client-side routing** - Navigate without page reloads
- 🔄 **Automatic hydration** - Components re-hydrate after navigation
- 📦 **Prefetching** - Preload pages for instant navigation
- 💾 **Caching** - Cache fetched pages for faster back/forward
- ⌨️ **Keyboard support** - Cmd/Ctrl+Click to open in new tab
- 🎯 **SEO friendly** - Uses real `<a>` tags for crawlers

## Quick Start

### 1. Import the Link Component

```tsx
import { Link } from '@harpy-js/core';

export default function MyPage() {
  return (
    <div>
      <Link href="/about">About Us</Link>
      <Link href="/contact">Contact</Link>
    </div>
  );
}
```

### 2. Initialize Navigation (Optional)

For advanced features like custom loading indicators, you can manually initialize:

```tsx
// In your main layout or app entry point
import { initNavigation } from '@harpy-js/core/client';

if (typeof window !== 'undefined') {
  initNavigation({
    contentSelector: '#app', // Where to replace content
    onBeforeNavigate: (url) => {
      // Show loading indicator
      document.body.classList.add('navigating');
    },
    onAfterNavigate: (url) => {
      // Hide loading indicator
      document.body.classList.remove('navigating');
    },
    onError: (error) => {
      console.error('Navigation error:', error);
    },
  });
}
```

### 3. Add the Navigation Script (Automatic)

The navigation system is automatically initialized when you use the `Link` component. The built-in hydration handles the setup.

## Link Component API

### Props

All standard `<a>` tag props are supported, plus:

```tsx
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** URL to navigate to */
  href: string;
  
  /** Replace current history entry instead of pushing */
  replace?: boolean;
  
  /** All other props from <a> tag */
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  // ... etc
}
```

### Examples

```tsx
// Basic link
<Link href="/about">About</Link>

// With styling
<Link 
  href="/products" 
  className="btn btn-primary"
>
  Products
</Link>

// Replace history
<Link href="/login" replace>
  Login
</Link>

// With custom click handler
<Link 
  href="/dashboard"
  onClick={(e) => {
    console.log('Navigating to dashboard');
  }}
>
  Dashboard
</Link>

// External link (opens normally)
<Link href="https://example.com">
  External Site
</Link>
```

## Programmatic Navigation

You can also navigate programmatically:

```tsx
import { navigate } from '@harpy-js/core/client';

// Navigate to a URL
navigate('/about');

// Replace current entry
navigate('/login', true);
```

## Advanced Features

### Prefetching

Prefetch pages for instant navigation:

```tsx
import { getNavigation } from '@harpy-js/core/client';

const nav = getNavigation();
nav?.prefetch('/about');
```

### Cache Management

Clear the navigation cache:

```tsx
import { getNavigation } from '@harpy-js/core/client';

const nav = getNavigation();
nav?.clearCache();
```

## Loading States

Add loading indicators with CSS:

```css
/* Show loading spinner when navigating */
body.navigating {
  cursor: wait;
}

body.navigating::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f59e0b, #f97316);
  animation: loading 1s ease-in-out infinite;
}

@keyframes loading {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## How It Works

1. **Click Interception**: The `Link` component intercepts clicks on internal links
2. **History Update**: Uses `history.pushState` to update the URL
3. **Content Fetch**: Fetches the new page content from the server
4. **DOM Update**: Replaces the content in the `#app` container
5. **Re-hydration**: Re-hydrates client components automatically
6. **Scroll**: Scrolls to the top of the page

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation to full page loads if JavaScript is disabled
- SEO-friendly with real `<a>` tags

## Performance Tips

1. **Use Link for internal navigation**: Always use `<Link>` for internal routes
2. **Prefetch important pages**: Prefetch frequently accessed pages
3. **Keep pages small**: Smaller pages load faster
4. **Use HTTP/2**: Server push can improve initial load times

## Troubleshooting

### Navigation not working?

- Ensure you're using `<Link>` instead of `<a>` for internal links
- Check that the `#app` container exists in your layout
- Verify client-side JavaScript is enabled

### Hydration errors?

- Make sure 'use client' components import from `.harpy/wrappers/`
- Check console for hydration errors
- Verify component props are serializable

### Slow navigation?

- Enable prefetching for frequently accessed pages
- Reduce page size and complexity
- Check network tab for slow requests

## Migration from Regular Links

Replace this:
```tsx
<a href="/about">About</a>
```

With this:
```tsx
<Link href="/about">About</Link>
```

That's it! The Link component handles everything else automatically.
