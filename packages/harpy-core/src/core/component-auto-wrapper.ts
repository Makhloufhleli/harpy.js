/**
 * Auto-wrapping system for components with 'use client' directive.
 *
 * This module provides utilities to automatically detect and wrap client components
 * without requiring manual withClientComponent() calls in application code.
 *
 * The wrapping happens transparently at the component definition level.
 */

import * as fs from "fs";
import React from "react";
import { autoWrapClientComponent } from "./client-component-wrapper";
import { getComponentNameFromPath } from "./component-analyzer";

/**
 * Cache of file paths and whether they have 'use client' directive
 * Key: absolute file path, Value: boolean indicating presence of 'use client'
 */
const clientComponentCache = new Map<string, boolean>();

/**
 * Detects if a source file has 'use client' directive
 */
function hasUseClientDirective(filePath: string): boolean {
  if (clientComponentCache.has(filePath)) {
    return clientComponentCache.get(filePath)!;
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    // Match "use client" at the very start of the file
    const hasDirective = /^(['"]use client['"];?\s*)/m.test(content);
    clientComponentCache.set(filePath, hasDirective);
    return hasDirective;
  } catch (error) {
    clientComponentCache.set(filePath, false);
    return false;
  }
}

/**
 * Wraps a component if its source file contains 'use client' directive.
 * This is the recommended way to use client components - just export them normally
 * with 'use client' at the top, and they'll be auto-wrapped.
 *
 * Usage:
 *   export default autoWrap(MyComponent, import.meta.url);
 *
 * Or better yet, use the custom hook approach in component-client.ts
 */
export function autoWrap<T extends React.ComponentType<any>>(
  Component: T,
  fileUrl: string,
): T {
  // Convert URL to file path
  const filePath = fileUrl.replace("file://", "");

  // If this component file doesn't have 'use client', return it unwrapped
  if (!hasUseClientDirective(filePath)) {
    return Component;
  }

  // Get component name from file path
  const componentName = getComponentNameFromPath(filePath);

  // Wrap for auto-hydration
  return autoWrapClientComponent(Component, componentName) as T;
}
