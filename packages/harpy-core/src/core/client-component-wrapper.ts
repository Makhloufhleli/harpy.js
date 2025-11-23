import React from 'react';

/**
 * Generates a unique instance ID (browser-compatible version)
 */
function generateInstanceId(prefix: string): string {
  // Use Math.random for browser compatibility
  const randomId = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${randomId}`;
}

/**
 * Global tracker for registering components on the server side
 * This is set by the JSX engine during server-side rendering
 */
declare global {
  var __COMPONENT_REGISTRY__: ((data: any) => void) | undefined;
}

/**
 * Wrapper that enables automatic hydration for components marked with 'use client'.
 *
 * This works on both server and browser:
 * - Server: Creates a hydration container with props and calls the registration function if available
 * - Browser: Creates the same hydration container for client-side hydration
 */
export function autoWrapClientComponent<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string,
): React.ComponentType<React.ComponentProps<T>> {
  const WrappedComponent = (props: React.ComponentProps<T>) => {
    // Generate a unique instance ID for this component instance
    const instanceId = generateInstanceId(`hydrate-${componentName}`);

    // Register on server side if registry is available
    console.log(`[Wrapper] Rendering ${componentName}, registry available:`, typeof global !== 'undefined' && !!global.__COMPONENT_REGISTRY__);
    if (typeof global !== 'undefined' && global.__COMPONENT_REGISTRY__) {
      console.log(`[Wrapper] Registering ${componentName} with id ${instanceId}`);
      global.__COMPONENT_REGISTRY__({
        componentPath: '',
        componentName,
        instanceId,
        props: props as Record<string, any>,
      });
    }

    // Store props in a script tag for client-side hydration access
    const propsJson = JSON.stringify(props);

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
      }),
    );
  };

  WrappedComponent.displayName = `ClientComponent(${componentName})`;
  return WrappedComponent;
}
