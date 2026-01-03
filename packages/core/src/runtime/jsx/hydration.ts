import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Client component instance tracking
 */
export interface ClientComponentInstance {
  componentPath: string;
  componentName: string;
  instanceId: string;
  props: Record<string, any>;
  key?: string | number;
  childIndex?: number;
}

/**
 * Hydration context for SSR
 */
export interface HydrationContext {
  clientComponents: Map<string, ClientComponentInstance>;
  providers: ProviderConfig[];
}

/**
 * Provider configuration for client-side context
 */
export interface ProviderConfig {
  name: string;
  order: number;
  props?: Record<string, any>;
}

/**
 * Global context storage for tracking client components during SSR
 */
export const hydrationContext = new AsyncLocalStorage<HydrationContext>();

/**
 * Generate a unique instance ID for a component
 */
export function generateInstanceId(componentPath: string): string {
  return `${Math.random().toString(36).substring(2, 10)}-${Date.now()}`;
}

/**
 * Initialize hydration context for a request
 */
export function initializeHydrationContext(): HydrationContext {
  return {
    clientComponents: new Map(),
    providers: [],
  };
}

/**
 * Register a provider for client-side hydration
 */
export function registerProvider(config: ProviderConfig): void {
  const context = hydrationContext.getStore();
  if (context) {
    context.providers.push(config);
    // Sort by order
    context.providers.sort((a, b) => a.order - b.order);
  }
}

/**
 * Register a client component instance during SSR
 */
export function registerClientComponent(instance: ClientComponentInstance): void {
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
