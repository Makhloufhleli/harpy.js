// Core exports
export { autoWrapClientComponent } from './core/client-component-wrapper';
export { hydrationContext, initializeHydrationContext } from './core/hydration';
export { getChunkPath, getHydrationManifest } from './core/hydration-manifest';
export { withJsxEngine } from './core/jsx.engine';

// Decorators
export { JsxRender } from './decorators/jsx.decorator';
export type { MetaOptions, RenderOptions } from './decorators/jsx.decorator';

// Types
export type { JsxLayout, JsxLayoutProps } from './core/jsx.engine';
