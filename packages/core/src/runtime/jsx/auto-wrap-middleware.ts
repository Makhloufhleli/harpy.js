/**
 * Automatic client component wrapping middleware for Bun runtime.
 *
 * This module provides component analysis and wrapping for 'use client' components.
 * It works by caching component analysis results and providing a wrapper function
 * that can be used during rendering.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import * as React from 'react';

/**
 * Cache of analyzed components
 */
const componentAnalysisCache = new Map<
  React.ComponentType<any>,
  { isClientComponent: boolean; componentName: string; componentPath: string }
>();

/**
 * Cache of file paths and whether they have 'use client' directive
 */
const clientFileCache = new Map<string, boolean>();

/**
 * Generate a unique instance ID
 */
let instanceCounter = 0;
function generateInstanceId(componentName: string): string {
  return `hydrate-${componentName}-${++instanceCounter}-${Date.now().toString(36)}`;
}

/**
 * Reset instance counter (for testing or between requests)
 */
export function resetInstanceCounter(): void {
  instanceCounter = 0;
}

/**
 * Detects if a source file has 'use client' directive
 */
function hasUseClientDirective(filePath: string): boolean {
  if (clientFileCache.has(filePath)) {
    return clientFileCache.get(filePath)!;
  }

  try {
    // Read first 100 bytes - 'use client' is at the very start of file
    const content = readFileSync(filePath, { encoding: 'utf-8' }).slice(0, 100);
    
    // Match "use client" at the very start of the file
    const hasDirective = /^['"]use client['"];?\s*/m.test(content);
    clientFileCache.set(filePath, hasDirective);
    return hasDirective;
  } catch (error) {
    clientFileCache.set(filePath, false);
    return false;
  }
}

/**
 * Get the component name from file path
 * Example: /src/components/counter.tsx -> Counter
 */
function getComponentNameFromPath(filePath: string): string {
  const fileName = basename(filePath, extname(filePath));
  // Convert kebab-case to PascalCase
  return fileName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Try to find the source file for a component
 */
function findComponentSourceFile(component: React.ComponentType<any>): string | null {
  try {
    // Check if component has a source location
    if ((component as any).__filename) {
      return (component as any).__filename;
    }
    
    // Check if component has __modulePath (set by our loader)
    if ((component as any).__modulePath) {
      return (component as any).__modulePath;
    }

    // For components with displayName or name, try common locations
    const componentName = component.displayName || component.name;
    if (!componentName) return null;

    // Look in common component directories
    const srcRoot = join(process.cwd(), 'src');
    const possibleDirs = [
      join(srcRoot, 'components'),
      join(srcRoot, 'features'),
    ];

    for (const dir of possibleDirs) {
      if (!existsSync(dir)) continue;
      
      const files = findFilesRecursive(dir, ['.tsx', '.ts']);
      
      // Find matching file by component name
      const kebabName = componentName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');
      
      const match = files.find((f) => {
        const baseName = basename(f, extname(f)).toLowerCase();
        return baseName === kebabName || baseName === componentName.toLowerCase();
      });
      
      if (match) return match;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Recursively find files with given extensions
 */
function findFilesRecursive(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  
  try {
    const files = readdirSync(dir);
    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        results.push(...findFilesRecursive(fullPath, extensions));
      } else if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch {
    // Ignore errors
  }
  
  return results;
}

/**
 * Wrap a component for client-side hydration
 */
function wrapClientComponent<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string,
  componentPath: string
): React.ComponentType<React.ComponentProps<T>> {
  const WrappedComponent = (props: React.ComponentProps<T>) => {
    const instanceId = generateInstanceId(componentName);

    // Register on server side if registry is available
    if (typeof window === 'undefined' && (global as any).__COMPONENT_REGISTRY__) {
      (global as any).__COMPONENT_REGISTRY__({
        componentPath,
        componentName,
        instanceId,
        props: props as Record<string, any>,
      });
    }

    // Serialize props for client-side hydration
    let propsJson = '{}';
    try {
      // Filter out non-serializable props
      const serializableProps = { ...props };
      delete (serializableProps as any).children;
      propsJson = JSON.stringify(serializableProps);
    } catch {
      // Ignore serialization errors
    }

    return React.createElement(
      'div',
      {
        id: instanceId,
        suppressHydrationWarning: true,
      },
      React.createElement(Component, props),
      React.createElement('script', {
        type: 'application/json',
        id: `${instanceId}-props`,
        dangerouslySetInnerHTML: { __html: propsJson },
      })
    );
  };

  WrappedComponent.displayName = `ClientComponent(${componentName})`;
  return WrappedComponent;
}

/**
 * Automatically wraps a component if it has 'use client' directive.
 * Uses caching to avoid repeated file analysis.
 */
export function autoWrapIfUsesClient(
  component: React.ComponentType<any>
): React.ComponentType<any> {
  const componentName = component.displayName || component.name || 'Unknown';
  console.log(`[AutoWrap] 🔍 Checking component: ${componentName}`);
  
  // Check cache first
  if (componentAnalysisCache.has(component)) {
    const cached = componentAnalysisCache.get(component)!;
    console.log(`[AutoWrap] ✅ Cache hit for ${componentName}: isClient=${cached.isClientComponent}`);
    if (cached.isClientComponent) {
      return wrapClientComponent(component, cached.componentName, cached.componentPath);
    }
    return component;
  }

  // Try to find source file
  const sourceFile = findComponentSourceFile(component);
  console.log(`[AutoWrap] 📄 Source file for ${componentName}: ${sourceFile || 'not found'}`);
  
  if (!sourceFile) {
    // Can't find source, cache as non-client component
    componentAnalysisCache.set(component, {
      isClientComponent: false,
      componentName: component.displayName || component.name || 'Unknown',
      componentPath: '',
    });
    return component;
  }

  // Check for 'use client' directive
  const actualComponentName = getComponentNameFromPath(sourceFile);
  
  const hasDirective = hasUseClientDirective(sourceFile);
  console.log(`[AutoWrap] ${hasDirective ? '✅ CLIENT' : '❌ SERVER'} Component ${actualComponentName} has "use client"? ${hasDirective}`);
  
  if (!hasDirective) {
    componentAnalysisCache.set(component, {
      isClientComponent: false,
      componentName: actualComponentName,
      componentPath: sourceFile,
    });
    return component;
  }

  // It's a client component - cache and wrap it
  console.log(`[AutoWrap] 🎁 Wrapping client component: ${actualComponentName}`);
  componentAnalysisCache.set(component, {
    isClientComponent: true,
    componentName: actualComponentName,
    componentPath: sourceFile,
  });

  return wrapClientComponent(component, actualComponentName, sourceFile);
}

/**
 * Clear all caches (useful for hot reload)
 */
export function clearCaches(): void {
  componentAnalysisCache.clear();
  clientFileCache.clear();
  resetInstanceCounter();
}

/**
 * Install auto-wrap middleware by providing a wrapped createElement
 * This version doesn't modify React.createElement directly
 */
export function getWrappedCreateElement() {
  return function wrappedCreateElement(
    type: React.ElementType,
    props?: Record<string, any> | null,
    ...children: React.ReactNode[]
  ): React.ReactElement {
    // Only process function components (not class components or HTML elements)
    if (typeof type === 'function' && !(type as any).prototype?.isReactComponent) {
      try {
        const wrappedType = autoWrapIfUsesClient(type as React.ComponentType<any>);
        return React.createElement(wrappedType, props, ...children);
      } catch (error) {
        // Fallback to original if wrapping fails
        console.warn('[AutoWrap] Failed to wrap component:', error);
      }
    }

    return React.createElement(type, props, ...children);
  };
}

// Export for compatibility (noop since we can't modify React.createElement in Bun)
export function installAutoWrapMiddleware(): void {
  console.log('[AutoWrap] Middleware ready - using render-time wrapping');
}

export function uninstallAutoWrapMiddleware(): void {
  // Noop
}

export const clearAutoWrapCaches = clearCaches;