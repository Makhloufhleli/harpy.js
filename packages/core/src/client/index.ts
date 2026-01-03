/**
 * Client-side exports for Harpy.js
 *
 * These modules are designed to run in the browser.
 * Import from '@harpy-js/core/client' in client components.
 */

// Client-side hydration runtime
export {
  registerComponent,
  registerProvider,
  clearProviders,
  serializeProps,
  deserializeProps,
  hydrateAll,
  initHydration,
  React,
} from './hydration-runtime';
export type { HydrationData, ProviderConfig } from './hydration-runtime';

// Client-side navigation Link component
export { default as Link } from './Link';
export type { LinkProps } from './Link';

// Navigation utilities
export {
  buildHrefIndex,
  getActiveItemIdFromIndex,
  getActiveItemIdFromManifest,
} from './getActiveItemId';
export type { NavItemLite } from './getActiveItemId';

// i18n hook for client components
export { useI18n } from './use-i18n';
