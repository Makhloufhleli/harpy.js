// Core exports
export { autoWrapClientComponent } from './core/client-component-wrapper';
export { hydrationContext, initializeHydrationContext } from './core/hydration';
export { getChunkPath, getHydrationManifest } from './core/hydration-manifest';
export { withJsxEngine } from './core/jsx.engine';
export { LiveReloadController } from './core/live-reload.controller';
export { StaticAssetsController } from './core/static-assets.controller';

// Decorators
export { JsxRender } from './decorators/jsx.decorator';
export { WithLayout } from './decorators/layout.decorator';
export type { MetaOptions, RenderOptions } from './decorators/jsx.decorator';

// Types
export type { JsxLayout, JsxLayoutProps } from './core/jsx.engine';
