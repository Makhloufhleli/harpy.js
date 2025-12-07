import {
  buildHrefIndex,
  getActiveItemIdFromIndex,
  getActiveItemIdFromManifest,
} from '../getActiveItemId';

describe('getActiveItemId helpers', () => {
  const items = [
    { id: 'home', href: '/' },
    { id: 'docs', href: '/docs' },
    { id: 'docs-start', href: '/docs/getting-started' },
    { id: 'about', href: '/about/' },
  ];

  test('exact match prefers exact href over ancestor', () => {
    const id = getActiveItemIdFromManifest(items, '/docs/getting-started');
    expect(id).toBe('docs-start');
  });

  test('ancestor matching finds parent when exact missing', () => {
    const id = getActiveItemIdFromManifest(items, '/docs/usage');
    expect(id).toBe('docs');
  });

  test('normalizes query and fragment and trailing slash', () => {
    const id = getActiveItemIdFromManifest(items, '/about?lang=en#team');
    // item href '/about/' should match '/about?lang=en#team'
    expect(id).toBe('about');
  });

  test('root fallback matches when no other match', () => {
    const id = getActiveItemIdFromManifest(items, '/unknown/path');
    // root '/' exists and is the fallback in ancestor trimming
    expect(id).toBe('home');
  });

  test('returns undefined when no match and no root', () => {
    const itemsNoRoot = items.filter((i) => i.href !== '/');
    const id = getActiveItemIdFromManifest(itemsNoRoot, '/unknown/path');
    expect(id).toBeUndefined();
  });

  test('index-based lookup returns same result as manifest-based', () => {
    const idx = buildHrefIndex(items);
    const byIndex = getActiveItemIdFromIndex(idx, '/docs/guide/intro');
    const byManifest = getActiveItemIdFromManifest(items, '/docs/guide/intro');
    expect(byIndex).toBe(byManifest);
  });
});
