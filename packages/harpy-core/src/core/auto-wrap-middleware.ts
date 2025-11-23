/**
 * Automatic client component wrapping middleware.
 *
 * This module provides a createElement wrapper that intercepts React component creation
 * and automatically wraps components with 'use client' directive for hydration.
 *
 * It works by analyzing component modules at render time and applying hydration
 * wrapping transparently without requiring explicit wrapper calls in user code.
 */

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { autoWrapClientComponent } from './client-component-wrapper';
import { getComponentNameFromPath } from './component-analyzer';

/**
 * Cache of analyzed components
 */
const componentAnalysisCache = new Map<
  React.ComponentType<any>,
  { isClientComponent: boolean; componentName: string }
>();

/**
 * Try to find the source file for a component
 * This is a best-effort approach that works for most cases
 */
function findComponentSourceFile(
  component: React.ComponentType<any>,
): string | null {
  try {
    // Check if component has a source location (some bundlers preserve this)
    if ((component as any).__filename) {
      return (component as any).__filename;
    }

    // For default exports from modules, try to find based on name
    // This is a heuristic and may not work in all cases
    const componentName = component.displayName || component.name;
    if (!componentName) return null;

    // Look in src/features/*/views/ directories
    const srcRoot = path.join(process.cwd(), 'src');
    const viewsDirs = fs.readdirSync(srcRoot).flatMap((feature) => {
      const viewsPath = path.join(srcRoot, 'features', feature, 'views');
      if (fs.existsSync(viewsPath)) {
        return fs
          .readdirSync(viewsPath)
          .map((file) => path.join(viewsPath, file));
      }
      return [];
    });

    // Find matching file
    const kebabName = componentName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1);

    return (
      viewsDirs.find(
        (f) =>
          path.basename(f, path.extname(f)) === kebabName ||
          path.basename(f, path.extname(f)) === componentName.toLowerCase(),
      ) || null
    );
  } catch (error) {
    return null;
  }
}

/**
 * Check if a component source has 'use client' directive
 */
function hasUseClientDirective(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return /^['"]use client['"];?\s*/.test(content);
  } catch {
    return false;
  }
}

/**
 * Automatically wraps a component if it has 'use client' directive.
 * Uses caching to avoid repeated file analysis.
 */
export function autoWrapIfUsesClient(
  component: React.ComponentType<any>,
): React.ComponentType<any> {
  // Check cache
  if (componentAnalysisCache.has(component)) {
    const cached = componentAnalysisCache.get(component)!;
    if (cached.isClientComponent) {
      return autoWrapClientComponent(component, cached.componentName);
    }
    return component;
  }

  // Try to find source file
  const sourceFile = findComponentSourceFile(component);
  if (!sourceFile) {
    // Can't find source, cache as non-client component
    componentAnalysisCache.set(component, {
      isClientComponent: false,
      componentName: component.displayName || component.name || 'Unknown',
    });
    return component;
  }

  // Check for 'use client' directive
  if (!hasUseClientDirective(sourceFile)) {
    const componentName = getComponentNameFromPath(sourceFile);
    componentAnalysisCache.set(component, {
      isClientComponent: false,
      componentName,
    });
    return component;
  }

  // It's a client component - wrap it
  const componentName = getComponentNameFromPath(sourceFile);
  componentAnalysisCache.set(component, {
    isClientComponent: true,
    componentName,
  });

  return autoWrapClientComponent(component, componentName);
}

/**
 * Override React.createElement to auto-wrap client components.
 * This is called for every JSX element during rendering.
 */
export const createAutoWrapCreateElement = (
  originalCreateElement: typeof React.createElement,
) => {
  return (
    type: React.ElementType,
    props?: Record<string, any> | null,
    ...children: React.ReactNode[]
  ) => {
    // Only process function components
    if (typeof type === 'function' && !type.prototype?.isReactComponent) {
      try {
        // Auto-wrap if it has 'use client'
        const wrappedType = autoWrapIfUsesClient(type);
        return originalCreateElement(wrappedType, props, ...children);
      } catch (error) {
        // Fallback to original if wrapping fails
        return originalCreateElement(type, props, ...children);
      }
    }

    return originalCreateElement(type, props, ...children);
  };
};

/**
 * Clear the analysis cache (useful for testing or hot reload)
 */
export function clearComponentAnalysisCache(): void {
  componentAnalysisCache.clear();
}
