// Hydration
export {
  hydrationContext,
  initializeHydrationContext,
  registerClientComponent,
  registerProvider,
  getClientComponents,
  clearHydrationContext,
  generateInstanceId,
} from './hydration';
export type { HydrationContext, ClientComponentInstance, ProviderConfig } from './hydration';

// Hydration manifest
export {
  getHydrationManifest,
  loadHydrationManifest,
  getChunkFileName,
  getChunkPath,
  invalidateManifestCache,
} from './hydration-manifest';
export type { HydrationManifest } from './hydration-manifest';

// Client Boundary (Server-side utilities for hydration)
export {
  ClientBoundary,
  withHydration,
  createClientComponent,
  renderClientList,
} from './client-boundary';

// JSX Engine
export {
  JsxRender,
  WithLayout,
  getJsxRenderMetadata,
  renderJsx,
  initializeChunkCache,
  JSX_RENDER_METADATA,
} from './engine';
export type {
  JsxLayout,
  JsxLayoutProps,
  PageProps,
  MetaOptions,
  RenderOptions,
  MetaResolver,
  JsxEngineConfig,
} from './engine';

// Auto-wrap middleware for client components
export {
  installAutoWrapMiddleware,
  uninstallAutoWrapMiddleware,
  autoWrapIfUsesClient,
  clearCaches as clearAutoWrapCaches,
  resetInstanceCounter,
} from './auto-wrap-middleware';
