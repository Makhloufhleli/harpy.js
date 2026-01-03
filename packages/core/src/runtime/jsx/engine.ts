import 'reflect-metadata';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import {
  hydrationContext,
  initializeHydrationContext,
  HydrationContext,
} from './hydration';
import { getChunkPath, getHydrationManifest } from './hydration-manifest';
import { resetInstanceCounter } from './auto-wrap-middleware';

// Note: Auto-wrap middleware disabled due to React.createElement being read-only in bundles
// Client components need to use withHydration() wrapper explicitly for now

/**
 * JSX Layout component type
 */
export type JsxLayout<P = any> = React.ComponentType<P & { children?: React.ReactNode }>;

/**
 * Layout props interface
 */
export interface JsxLayoutProps {
  children?: React.ReactNode;
  meta?: MetaOptions;
  [key: string]: any;
}

/**
 * Page props interface
 */
export interface PageProps {
  [key: string]: any;
}

/**
 * Meta options for SEO
 */
export interface MetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

/**
 * Render options for JsxRender decorator
 */
export interface RenderOptions {
  layout?: JsxLayout;
  bootstrapScripts?: string[];
  meta?: MetaResolver;
}

/**
 * Meta resolver can be static or dynamic
 */
export type MetaResolver<T = any> =
  | MetaOptions
  | ((req: Request, data: T) => MetaOptions | Promise<MetaOptions>);

/**
 * Metadata key for JSX render
 */
export const JSX_RENDER_METADATA = 'harpy:jsx:render';

/**
 * @JsxRender() decorator
 * 
 * Marks a controller method to render a React component as HTML.
 * 
 * @param template - React component to render
 * @param options - Render options including layout and meta
 * 
 * @example
 * ```typescript
 * @Controller()
 * class HomeController {
 *   @Get()
 *   @JsxRender(HomePage, {
 *     meta: { title: 'Home Page' }
 *   })
 *   home() {
 *     return { message: 'Hello World' };
 *   }
 * }
 * ```
 */
export function JsxRender<T>(
  template: React.ComponentType<T>,
  options: RenderOptions = {}
): MethodDecorator {
  return (
    target: Object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    // Check if WithLayout was applied first (decorators run bottom-up)
    const existingLayout = Reflect.getMetadata('harpy:jsx:layout', descriptor.value);
    if (existingLayout && !options.layout) {
      options.layout = existingLayout;
    }
    
    Reflect.defineMetadata(
      JSX_RENDER_METADATA,
      { template, options },
      descriptor.value
    );
    return descriptor;
  };
}

/**
 * Get JSX render metadata from a method
 */
export function getJsxRenderMetadata(handler: Function): {
  template: React.ComponentType<any>;
  options: RenderOptions;
} | null {
  return Reflect.getMetadata(JSX_RENDER_METADATA, handler) || null;
}

/**
 * JSX Engine configuration
 */
export interface JsxEngineConfig {
  defaultLayout?: JsxLayout;
  distDir?: string;
  isDev?: boolean;
}

// Cache for component-to-chunk path mappings
const chunkPathCache = new Map<string, string>();

/**
 * Initialize chunk cache from manifest
 */
export function initializeChunkCache(): void {
  const manifest = getHydrationManifest();
  Object.keys(manifest).forEach((componentName) => {
    const path = getChunkPath(componentName);
    if (path) {
      chunkPathCache.set(componentName, path);
    }
  });
  console.log(
    `[JSX Engine] Preloaded ${chunkPathCache.size} component chunk mappings`
  );
}

/**
 * Render a React component to an HTML Response
 */
export async function renderJsx(
  template: React.ComponentType<any>,
  props: any,
  options: RenderOptions,
  request: Request,
  config: JsxEngineConfig = {}
): Promise<Response> {
  // Reset instance counter for each request to keep IDs consistent
  resetInstanceCounter();
  
  const { defaultLayout, isDev = process.env.NODE_ENV !== 'production' } = config;
  const layout = options.layout ?? defaultLayout;

  // Resolve meta (can be static or dynamic)
  let meta: MetaOptions | undefined;
  if (typeof options.meta === 'function') {
    try {
      meta = await options.meta(request, props);
    } catch (e) {
      console.error('[JSX Engine] Error resolving dynamic meta:', e);
    }
  } else {
    meta = options.meta;
  }

  // Build layout props
  const layoutProps: JsxLayoutProps = {
    ...props,
    meta,
  };

  // Initialize hydration context for this request
  const hydrationCtx = initializeHydrationContext();

  // Set up component registry for client component wrapping
  (global as any).__COMPONENT_REGISTRY__ = (data: any) => {
    hydrationCtx.clientComponents.set(data.instanceId, data);
  };

  // Create the component tree
  // Client components should be imported from .harpy/wrappers/ for automatic hydration
  let element: React.ReactElement;
  if (layout) {
    layoutProps.children = React.createElement(template, props);
    element = React.createElement(layout, layoutProps);
  } else {
    element = React.createElement(template, props);
  }

  // Render to string within hydration context
  const startTime = Date.now();
  let htmlString = '';

  hydrationContext.run(hydrationCtx, () => {
    try {
      htmlString = renderToString(element);
    } catch (e) {
      console.error(
        '[JSX Engine] Render error:',
        (e as Error).message?.split('\n')[0]
      );
      throw e;
    }
  });

  // Extract registered components from the context
  const registeredComponents = Array.from(hydrationCtx.clientComponents.values());
  const uniqueComponentNames = new Set(
    registeredComponents.map((c) => c.componentName)
  );

  // Use cached chunk paths
  const hydrationScripts = Array.from(uniqueComponentNames)
    .map((componentName) => {
      const path = chunkPathCache.get(componentName);
      if (!path) {
        // Fallback to live lookup if not in cache
        const livePath = getChunkPath(componentName);
        if (livePath) {
          chunkPathCache.set(componentName, livePath);
          return { componentName, path: livePath };
        }
        return null;
      }
      return { componentName, path };
    })
    .filter((script) => script !== null) as Array<{
    componentName: string;
    path: string;
  }>;

  const renderTime = Date.now() - startTime;
  if (isDev) {
    console.log(
      `[JSX Engine] Rendered in ${renderTime}ms with ${hydrationScripts.length} scripts for:`,
      Array.from(uniqueComponentNames).join(', ')
    );
  }

  // Build hydration data script - includes component registry and provider config
  let hydrationDataScript = '';
  if (registeredComponents.length > 0) {
    // Create a hydration manifest for the client
    const hydrationManifest = registeredComponents.map(comp => ({
      id: comp.instanceId,
      name: comp.componentName,
      props: comp.props || {},
      key: comp.key,
    }));
    
    // Serialize safely for embedding in HTML
    const manifestJson = JSON.stringify(hydrationManifest)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
    
    hydrationDataScript = `
<script id="__HARPY_HYDRATION_DATA__" type="application/json">${manifestJson}</script>
<script>
  window.__HARPY_HYDRATION__ = {
    manifest: JSON.parse(document.getElementById('__HARPY_HYDRATION_DATA__').textContent),
    providers: [],
    ready: false
  };
</script>`;
  }

  // Build hydration scripts HTML
  let hydrationScriptsHtml = '';
  if (hydrationScripts.length > 0) {
    // Load component-specific chunks (Bun bundles include React)
    hydrationScripts.forEach((script) => {
      hydrationScriptsHtml += `<script type="module" src="${script.path}"></script>`;
    });
    // Mark hydration as ready after all scripts loaded
    hydrationScriptsHtml += `
<script>
  if (window.__HARPY_HYDRATION__) {
    window.__HARPY_HYDRATION__.ready = true;
    window.dispatchEvent(new CustomEvent('harpy:hydration-ready'));
  }
</script>`;
  }

  // Inject data script into <head> and hydration scripts before </body>
  if (hydrationDataScript) {
    htmlString = htmlString.replace('</head>', `${hydrationDataScript}</head>`);
  }

  // Inject scripts before closing body tag
  if (isDev) {
    // In development, add live reload script
    const liveReloadScript = '<script src="/__harpy/live-reload.js"></script>';
    const scriptsToInject = `${hydrationScriptsHtml}${liveReloadScript}`;
    htmlString = htmlString.replace('</body>', `${scriptsToInject}</body>`);
  } else if (hydrationScriptsHtml) {
    // In production, only inject hydration scripts
    htmlString = htmlString.replace('</body>', `${hydrationScriptsHtml}</body>`);
  }

  return new Response(htmlString, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

/**
 * @WithLayout() decorator
 * 
 * Override the default layout for a controller method.
 * 
 * @param layout - Layout component to use
 * 
 * @example
 * ```typescript
 * @Controller()
 * class PageController {
 *   @Get('minimal')
 *   @JsxRender(MinimalPage)
 *   @WithLayout(MinimalLayout)
 *   minimalPage() {
 *     return {};
 *   }
 * }
 * ```
 */
export function WithLayout(layout: JsxLayout): MethodDecorator {
  return (
    target: Object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    // Store the layout in a separate metadata key
    // This will be picked up by JsxRender or merged at render time
    Reflect.defineMetadata('harpy:jsx:layout', layout, descriptor.value);
    
    // Also try to update existing JSX render metadata if it exists
    const existing = Reflect.getMetadata(JSX_RENDER_METADATA, descriptor.value);
    if (existing) {
      existing.options.layout = layout;
      Reflect.defineMetadata(JSX_RENDER_METADATA, existing, descriptor.value);
    }
    return descriptor;
  };
}
