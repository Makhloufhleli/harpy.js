/**
 * Harpy.js Client Hydration Runtime
 * 
 * This file is the client-side runtime for hydrating React components.
 * It handles:
 * - Component hydration with proper props serialization
 * - Collections with keys
 * - Context providers (React Context, Redux, etc.)
 * - Error boundaries
 */

import * as React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';

/**
 * Serialized component data from SSR
 */
export interface HydrationData {
  componentName: string;
  componentPath: string;
  instanceId: string;
  props: Record<string, any>;
  key?: string | number;
  children?: HydrationData[];
}

/**
 * Provider configuration for wrapping hydrated components
 */
export interface ProviderConfig {
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

/**
 * Global hydration registry
 */
interface HydrationRegistry {
  components: Map<string, React.ComponentType<any>>;
  providers: ProviderConfig[];
  hydrationData: Map<string, HydrationData>;
  isHydrating: boolean;
}

// Global registry
const registry: HydrationRegistry = {
  components: new Map(),
  providers: [],
  hydrationData: new Map(),
  isHydrating: false,
};

/**
 * Register a client component for hydration
 */
export function registerComponent(name: string, component: React.ComponentType<any>): void {
  registry.components.set(name, component);
}

/**
 * Register a provider to wrap all hydrated components
 * Providers are applied in order (first registered = outermost)
 */
export function registerProvider(provider: ProviderConfig): void {
  registry.providers.push(provider);
}

/**
 * Clear all registered providers
 */
export function clearProviders(): void {
  registry.providers = [];
}

/**
 * Wrap a component with all registered providers
 */
function wrapWithProviders(element: React.ReactElement): React.ReactElement {
  let wrapped = element;
  
  // Apply providers in reverse order so first registered is outermost
  for (let i = registry.providers.length - 1; i >= 0; i--) {
    const { component: Provider, props = {} } = registry.providers[i];
    wrapped = React.createElement(Provider, props, wrapped);
  }
  
  return wrapped;
}

/**
 * Error boundary for hydration errors
 */
class HydrationErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `[Harpy Hydration] Error in component "${this.props.componentName}":`,
      error,
      errorInfo
    );
  }

  render() {
    if (this.state.hasError) {
      // In development, show error UI
      if (process.env.NODE_ENV === 'development') {
        return React.createElement(
          'div',
          {
            style: {
              padding: '16px',
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#991b1b',
              fontSize: '14px',
            },
          },
          React.createElement('strong', null, `Hydration Error: ${this.props.componentName}`),
          React.createElement('pre', { style: { marginTop: '8px', fontSize: '12px' } }, 
            this.state.error?.message
          )
        );
      }
      // In production, render nothing (or could render children as fallback)
      return null;
    }

    return this.props.children;
  }
}

/**
 * Serialize props for transport (SSR -> Client)
 * Handles special cases like functions, symbols, etc.
 */
export function serializeProps(props: Record<string, any>): string {
  const seen = new WeakSet();
  
  return JSON.stringify(props, (key, value) => {
    // Skip functions (they can't be serialized)
    if (typeof value === 'function') {
      return undefined;
    }
    
    // Skip symbols
    if (typeof value === 'symbol') {
      return undefined;
    }
    
    // Handle circular references
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    
    // Handle React elements (convert to placeholder)
    if (React.isValidElement(value)) {
      return { __react_element__: true, type: (value.type as any)?.name || 'Unknown' };
    }
    
    // Handle Date objects
    if (value instanceof Date) {
      return { __date__: value.toISOString() };
    }
    
    // Handle Map
    if (value instanceof Map) {
      return { __map__: Array.from(value.entries()) };
    }
    
    // Handle Set
    if (value instanceof Set) {
      return { __set__: Array.from(value.values()) };
    }
    
    return value;
  });
}

/**
 * Deserialize props from transport
 */
export function deserializeProps(serialized: string): Record<string, any> {
  return JSON.parse(serialized, (key, value) => {
    if (value && typeof value === 'object') {
      // Restore Date
      if (value.__date__) {
        return new Date(value.__date__);
      }
      // Restore Map
      if (value.__map__) {
        return new Map(value.__map__);
      }
      // Restore Set
      if (value.__set__) {
        return new Set(value.__set__);
      }
    }
    return value;
  });
}

/**
 * Hydrate a single component instance
 */
function hydrateInstance(
  element: Element,
  Component: React.ComponentType<any>,
  data: HydrationData
): void {
  const { componentName, props, key } = data;
  
  // Create the component element with key if present
  let componentElement = React.createElement(Component, { ...props, key });
  
  // Wrap with error boundary
  componentElement = React.createElement(
    HydrationErrorBoundary,
    { componentName, children: componentElement }
  );
  
  // Wrap with providers
  const wrappedElement = wrapWithProviders(componentElement);
  
  try {
    // Use hydrateRoot for SSR-rendered content
    hydrateRoot(element, wrappedElement, {
      onRecoverableError: (error) => {
        console.warn(`[Harpy] Recoverable hydration error in ${componentName}:`, error);
      },
    });
    
    console.log(`[Harpy] ✓ Hydrated: ${componentName} (${data.instanceId})`);
  } catch (error) {
    console.error(`[Harpy] Hydration failed for ${componentName}:`, error);
    
    // Fallback: try client-side render instead
    try {
      const root = createRoot(element);
      root.render(wrappedElement);
      console.log(`[Harpy] ✓ Client rendered (fallback): ${componentName}`);
    } catch (fallbackError) {
      console.error(`[Harpy] Client render also failed:`, fallbackError);
    }
  }
}

/**
 * Hydrate all components on the page
 */
export function hydrateAll(): void {
  if (registry.isHydrating) {
    console.warn('[Harpy] Hydration already in progress');
    return;
  }
  
  registry.isHydrating = true;
  
  try {
    // Find all hydration markers
    const markers = document.querySelectorAll('[data-harpy-hydrate]');
    
    console.log(`[Harpy] Found ${markers.length} components to hydrate`);
    
    markers.forEach((element) => {
      const componentName = element.getAttribute('data-harpy-hydrate');
      const instanceId = element.getAttribute('data-harpy-id');
      const propsAttr = element.getAttribute('data-harpy-props');
      const keyAttr = element.getAttribute('data-harpy-key');
      
      if (!componentName || !instanceId) {
        console.warn('[Harpy] Missing hydration data on element:', element);
        return;
      }
      
      // Get the component from registry
      const Component = registry.components.get(componentName);
      if (!Component) {
        console.warn(`[Harpy] Component not registered: ${componentName}`);
        return;
      }
      
      // Deserialize props
      let props: Record<string, any> = {};
      if (propsAttr) {
        try {
          props = deserializeProps(propsAttr);
        } catch (e) {
          console.error(`[Harpy] Failed to parse props for ${componentName}:`, e);
        }
      }
      
      // Build hydration data
      const data: HydrationData = {
        componentName,
        componentPath: '',
        instanceId,
        props,
        key: keyAttr !== null ? keyAttr : undefined,
      };
      
      // Hydrate
      hydrateInstance(element, Component, data);
    });
  } finally {
    registry.isHydrating = false;
  }
}

/**
 * Initialize hydration when DOM is ready
 */
export function initHydration(): void {
  if (typeof document === 'undefined') {
    return; // SSR environment
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrateAll);
  } else {
    // DOM already loaded
    hydrateAll();
  }
}

// Export for use in generated hydration entries
export { React };
