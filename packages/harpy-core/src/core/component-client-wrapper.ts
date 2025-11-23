/**
 * Smart component export wrapper that automatically detects 'use client' directive
 * and applies hydration wrapping without requiring manual withClientComponent() calls.
 *
 * This simulates Next.js's automatic client component handling.
 */

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { autoWrapClientComponent } from './client-component-wrapper';
import { getComponentNameFromPath } from './component-analyzer';

/**
 * Cache to avoid re-reading files repeatedly
 */
const componentCache = new Map<
  string,
  {
    isClientComponent: boolean;
    wrappedComponent: React.ComponentType<any> | null;
  }
>();

/**
 * Check if a file has 'use client' directive by reading the source
 */
function detectClientComponent(sourceFilePath: string): {
  isClientComponent: boolean;
  componentPath: string;
} {
  // Normalize the path
  const normalizedPath = path.resolve(sourceFilePath);

  if (componentCache.has(normalizedPath)) {
    const cached = componentCache.get(normalizedPath)!;
    return {
      isClientComponent: cached.isClientComponent,
      componentPath: normalizedPath,
    };
  }

  let isClientComponent = false;

  try {
    const content = fs.readFileSync(normalizedPath, 'utf-8');
    isClientComponent = /^['"]use client['"];?\s*/.test(content);
  } catch (error) {
    // File doesn't exist or can't be read - treat as server component
    isClientComponent = false;
  }

  componentCache.set(normalizedPath, {
    isClientComponent,
    wrappedComponent: null,
  });

  return { isClientComponent, componentPath: normalizedPath };
}

/**
 * Higher-order component that automatically wraps client components.
 *
 * Usage in component files:
 * ```tsx
 * 'use client';
 *
 * function MyComponent() { ... }
 * export default createClientComponent(MyComponent, __filename);
 * ```
 *
 * The __filename reference will be resolved at build time or runtime.
 * This function detects the 'use client' directive and wraps accordingly.
 */
export function createClientComponent<T extends React.ComponentType<any>>(
  Component: T,
  sourceFile: string,
): T {
  const { isClientComponent, componentPath } =
    detectClientComponent(sourceFile);

  if (!isClientComponent) {
    // Not a client component, return as-is
    return Component;
  }

  // Get the component name from the file path
  const componentName = getComponentNameFromPath(componentPath);

  // Wrap for automatic hydration
  return autoWrapClientComponent(Component, componentName) as T;
}

/**
 * Alternative: Automatically wrap a component based on its __filename
 *
 * Can be used as a default export wrapper:
 * export default autoWrapIfClient(MyComponent, __filename);
 */
export function autoWrapIfClient<T extends React.ComponentType<any>>(
  Component: T,
  filename: string,
): T {
  return createClientComponent(Component, filename);
}

/**
 * Clear the component cache (useful for testing or hot reload)
 */
export function clearComponentCache(): void {
  componentCache.clear();
}
