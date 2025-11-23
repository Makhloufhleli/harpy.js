import { AsyncLocalStorage } from 'async_hooks';
import * as crypto from 'crypto';

/**
 * Tracks client components during SSR rendering
 */

export interface ClientComponentInstance {
  componentPath: string;
  componentName: string;
  instanceId: string;
  props: Record<string, any>;
}

export interface HydrationContext {
  clientComponents: Map<string, ClientComponentInstance>;
}

// Global context storage for tracking client components during SSR
export const hydrationContext = new AsyncLocalStorage<HydrationContext>();

/**
 * Generate a unique instance ID for a component
 */
export function generateInstanceId(componentPath: string): string {
  return `${crypto.randomBytes(4).toString('hex')}-${Date.now()}`;
}

/**
 * Initialize hydration context for a request
 */
export function initializeHydrationContext(): HydrationContext {
  const context: HydrationContext = {
    clientComponents: new Map(),
  };
  return context;
}

/**
 * Register a client component instance during SSR
 */
export function registerClientComponent(
  instance: ClientComponentInstance,
): void {
  const context = hydrationContext.getStore();
  if (context) {
    context.clientComponents.set(instance.instanceId, instance);
  }
}

/**
 * Get all registered client components
 */
export function getClientComponents(): ClientComponentInstance[] {
  const context = hydrationContext.getStore();
  if (!context) {
    return [];
  }
  return Array.from(context.clientComponents.values());
}

/**
 * Clear hydration context
 */
export function clearHydrationContext(): void {
  const context = hydrationContext.getStore();
  if (context) {
    context.clientComponents.clear();
  }
}
