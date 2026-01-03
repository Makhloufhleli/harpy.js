/**
 * Runtime hydration loader
 * Automatically wraps 'use client' components for SSR hydration
 */

import React from 'react';
import { registerClientComponent } from './jsx/hydration';

const clientComponentCache = new Map<string, any>();

/**
 * Wrap a client component with hydration logic
 */
export function wrapClientComponent(
  OriginalComponent: any,
  componentName: string
): any {
  // Check cache first
  if (clientComponentCache.has(componentName)) {
    return clientComponentCache.get(componentName);
  }

  function WrappedComponent(props: any) {
    // Generate instance ID
    const instanceId = `harpy-${Math.random().toString(36).slice(2)}`;
    
    if (typeof window === 'undefined') {
      // Server-side: register and wrap in hydration container
      if ((global as any).__COMPONENT_REGISTRY__) {
        (global as any).__COMPONENT_REGISTRY__({
          instanceId,
          componentName,
          props,
        });
      }
      
      return React.createElement(
        'div',
        {
          'data-harpy-hydrate': componentName,
          'data-harpy-id': instanceId,
          'data-harpy-props': JSON.stringify(props),
          style: { display: 'contents' },
        },
        React.createElement(OriginalComponent, props)
      );
    }
    
    // Client-side: just render the component
    return React.createElement(OriginalComponent, props);
  }

  // Preserve component name for debugging
  WrappedComponent.displayName = `Harpy(${componentName})`;
  
  clientComponentCache.set(componentName, WrappedComponent);
  return WrappedComponent;
}

/**
 * Check if a module has 'use client' directive
 */
export function hasUseClientDirective(moduleSource: string): boolean {
  return /^['"]use client['"]/.test(moduleSource.trim());
}
