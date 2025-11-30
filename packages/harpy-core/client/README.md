# Harpy Core — Client Helpers

This small client helper package contains utilities to compute the active
navigation item id on the client so the client and server share identical
matching/normalization rules.

Files
- `getActiveItemId.ts` — tiny helper to build a normalized `href` index and
  compute the active item id using ancestor-prefix matching.
- `Link.tsx` — client `Link` component exported by the core package.

Why this exists
- The server-side `NavigationService` exposes a fast `getActiveItemId()` and
  also returns cached, sorted navigation via `getAllSections()`.
- To ensure the client computes the same active item id (for hydration or
  client-side routing), this helper mirrors the same normalization and
  ancestor-matching logic.

Import paths
- Server-side (or from package root exports):

```ts
import { buildHrefIndex, getActiveItemIdFromManifest } from '@hepta-solutions/harpy-core';
```

- Client-side direct import (explicit client path):

```ts
import { buildHrefIndex, getActiveItemIdFromManifest } from '@hepta-solutions/harpy-core/client/getActiveItemId';
import Link from '@hepta-solutions/harpy-core/client/Link';
```

Basic usage (client)

```ts
import { buildHrefIndex, getActiveItemIdFromManifest } from '@hepta-solutions/harpy-core/client/getActiveItemId';

// flatten your nav manifest into an array of items: [{ id, href }, ...]
const items = [
  { id: 'home', href: '/' },
  { id: 'docs', href: '/docs' },
  { id: 'docs-getting-started', href: '/docs/getting-started' },
];

// Option A: compute active id directly from the manifest
const activeId = getActiveItemIdFromManifest(items, window.location.pathname);

// Option B: prebuild an index (recommended for repeated route checks)
const index = buildHrefIndex(items);
const activeId2 = getActiveItemIdFromManifest(items, window.location.pathname);
```

Notes and integration tips

- Normalization rules: query strings and fragments are ignored; trailing
  slashes are removed (except for root `/`). Matching is performed by
  checking the exact normalized href first and falling back to ancestor
  prefix matches (e.g. `/docs/getting-started` matches an item with href
  `/docs`).

- Performance: prebuilding the `hrefIndex` and using `getActiveItemIdFromIndex`
  is recommended when the client checks active state frequently (on every
  route change). If the nav manifest is static, build the index once and reuse it.

- Hydration/SSG/SSR: the server can compute the active item id using
  `NavigationService.getActiveItemId()` and embed it in the HTML/props so the
  client can hydrate without recomputing. If embedding isn't possible, the
  client helper will produce the same result.

- Exported from package root: some helper functions are also exported from
  the package root for convenience; use whichever import path you prefer.


Next steps (docs)
- Document this helper in the core package docs and the docs app so consumers
  know to use the prebuilt index for best performance.
