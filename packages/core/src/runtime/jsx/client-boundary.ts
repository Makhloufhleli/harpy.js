/**
 * Harpy.js Server-Side Hydration Utilities
 * 
 * This module provides utilities for marking React components
 * for client-side hydration during SSR.
 */

import * as React from 'react';
import { serializeProps } from '../../client/hydration-runtime';

let instanceCounter = 0;

/**
 * Generate a unique instance ID
 */
function generateInstanceId(): string {
  return `harpy-${++instanceCounter}-${Date.now().toString(36)}`;
}

/**
 * Reset instance counter (for testing)
 */
export function resetInstanceCounter(): void {
  instanceCounter = 0;
}

/**
 * Props for the ClientBoundary component
 */
interface ClientBoundaryProps {
  componentName: string;
  componentPath?: string;
  children: React.ReactNode;
  props?: Record<string, any>;
  hydrationKey?: string | number;
}

/**
 * ClientBoundary wraps a client component and adds hydration markers
 * 
 * This is used internally to mark where client components should be hydrated.
 */
export function ClientBoundary({
  componentName,
  componentPath,
  children,
  props = {},
  hydrationKey,
}: ClientBoundaryProps): React.ReactElement {
  const instanceId = generateInstanceId();
  
  // Register component with the engine if we're on the server
  if (typeof window === 'undefined' && (global as any).__COMPONENT_REGISTRY__) {
    (global as any).__COMPONENT_REGISTRY__({
      componentPath: componentPath || '',
      componentName,
      instanceId,
      props,
      key: hydrationKey,
    });
  }
  
  // Serialize props for client hydration
  // Filter out children and other non-serializable props
  const serializableProps = { ...props };
  delete serializableProps.children;
  
  let serializedProps: string;
  try {
    serializedProps = serializeProps(serializableProps);
  } catch (e) {
    console.warn(`[Harpy] Failed to serialize props for ${componentName}:`, e);
    serializedProps = '{}';
  }
  
  // Create wrapper element with hydration data attributes
  return React.createElement(
    'div',
    {
      'data-harpy-hydrate': componentName,
      'data-harpy-id': instanceId,
      'data-harpy-props': serializedProps,
      ...(hydrationKey !== undefined && { 'data-harpy-key': String(hydrationKey) }),
      style: { display: 'contents' }, // Invisible wrapper
    },
    children
  );
}

/**
 * Higher-order component that wraps a client component for SSR + hydration
 * 
 * Usage:
 * ```tsx
 * // In your client component file
 * 'use client';
 * 
 * function Counter({ initialCount }: { initialCount: number }) {
 *   const [count, setCount] = useState(initialCount);
 *   return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
 * }
 * 
 * export default withHydration(Counter, 'Counter');
 * ```
 */
export function withHydration<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  componentPath?: string
): React.FC<P & { hydrationKey?: string | number }> {
  const WrappedComponent: React.FC<P & { hydrationKey?: string | number }> = (props) => {
    const { hydrationKey, ...restProps } = props;
    
    const childElement = React.createElement(Component, restProps as P);
    
    return React.createElement(
      ClientBoundary,
      {
        componentName,
        componentPath,
        props: restProps,
        hydrationKey,
        children: childElement,
      }
    );
  };
  
  WrappedComponent.displayName = `Hydrated(${componentName})`;
  
  return WrappedComponent;
}

/**
 * Type for createClientComponent return
 */
type ClientComponent<P> = React.FC<P & { 
  hydrationKey?: string | number;
  children?: React.ReactNode;
}>;

/**
 * Create a client component wrapper
 * 
 * This is the recommended way to define client components that need hydration.
 * 
 * Usage:
 * ```tsx
 * 'use client';
 * 
 * const Counter = createClientComponent('Counter', ({ initialCount = 0 }) => {
 *   const [count, setCount] = useState(initialCount);
 *   return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
 * });
 * 
 * export default Counter;
 * ```
 */
export function createClientComponent<P extends object>(
  componentName: string,
  Component: React.FC<P>
): ClientComponent<P> {
  return withHydration(Component, componentName);
}

/**
 * Mark a component as a client component in the hydration manifest
 * 
 * This is called during SSR to track which components need hydration.
 */
export function markClientComponent(
  componentName: string,
  componentPath: string,
  instanceId: string,
  props: Record<string, any>
): void {
  // This will be picked up by the hydration context
  if (typeof (global as any).__COMPONENT_REGISTRY__ === 'function') {
    (global as any).__COMPONENT_REGISTRY__({
      componentName,
      componentPath,
      instanceId,
      props,
    });
  }
}

/**
 * Utility to render a list of items with proper hydration keys
 * 
 * This ensures that when rendering collections of client components,
 * each item gets a proper key for React reconciliation during hydration.
 * 
 * Usage:
 * ```tsx
 * const items = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
 * 
 * {renderClientList(items, (item) => (
 *   <ClientCard key={item.id} hydrationKey={item.id} data={item} />
 * ))}
 * ```
 */
export function renderClientList<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactElement,
  getKey?: (item: T, index: number) => string | number
): React.ReactElement[] {
  return items.map((item, index) => {
    const element = renderItem(item, index);
    const key = getKey ? getKey(item, index) : (element.key ?? index);
    
    // Clone element to ensure key is set
    return React.cloneElement(element, { key } as React.Attributes);
  });
}
