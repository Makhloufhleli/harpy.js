import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyReply } from 'fastify';
import * as React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { MetaOptions, RenderOptions } from '../decorators/jsx.decorator';
import { hydrationContext, initializeHydrationContext } from './hydration';
import { getChunkPath, getHydrationManifest } from './hydration-manifest';
import { LiveReloadController } from './live-reload.controller';
import { StaticAssetsController } from './static-assets.controller';

export interface JsxLayoutProps {
  children: React.ReactNode;
  meta?: MetaOptions;
}

export type JsxLayout = (props: JsxLayoutProps) => React.ReactElement;

// Cache for component-to-chunk path mappings (loaded once at startup)
const chunkPathCache = new Map<string, string>();

// Preload hydration manifest and cache chunk paths
function initializeChunkCache() {
  const manifest = getHydrationManifest();
  Object.keys(manifest).forEach(componentName => {
    const path = getChunkPath(componentName);
    if (path) {
      chunkPathCache.set(componentName, path);
    }
  });
  console.log(`[JSX Engine] Preloaded ${chunkPathCache.size} component chunk mappings`);
}

export function withJsxEngine(
  app: NestFastifyApplication,
  defaultLayout: JsxLayout,
) {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Initialize chunk cache at startup (O(1) lookups for all requests)
  initializeChunkCache();
  
  // Register live reload controllers in development mode
  if (isDev) {
    const httpAdapter = app.getHttpAdapter();
    const liveReloadController = new LiveReloadController();
    const staticAssetsController = new StaticAssetsController();
    
    // Register routes manually
    httpAdapter.get('/__harpy/live-reload', (req: any, reply: any) => {
      liveReloadController.liveReload(reply);
    });
    
    httpAdapter.post('/__harpy/live-reload/trigger', (req: any, reply: any) => {
      liveReloadController.notifyReload();
      reply.send({ status: 'ok' });
    });
    
    httpAdapter.get('/__harpy/live-reload.js', (req: any, reply: any) => {
      staticAssetsController.liveReloadScript(reply);
    });
  }
  
  // Override the render method to use the jsx engine
  // @ts-expect-error Monkey patch to make render method use jsx
  app.getHttpAdapter().render = async function (
    reply: FastifyReply,
    view: [any, RenderOptions],
    options,
  ) {
    const res = reply.raw;

    // Redirected, bad request or error, there is no need to render the view
    if (reply.statusCode >= 300) {
      res.end();
      return;
    }

    const [component, controllerOpts] = view;
    const layout = controllerOpts.layout ?? defaultLayout;

    // Prepare options for the component
    const props = {
      ...options,
    };

    let meta: MetaOptions | undefined = undefined;
    if (typeof controllerOpts.meta === 'function') {
      try {
        meta = await controllerOpts.meta(reply.request, props);
      } catch (e) {
        console.error('Error resolving dynamic meta:', e);
      }
    } else {
      meta = controllerOpts.meta;
    }

    // Inject meta into layout props
    const layoutProps = {
      ...props,
      meta,
    };

    let html: React.ReactElement;
    if (layout) {
      layoutProps.children = React.createElement(component, props);
      html = React.createElement(layout, layoutProps);
    } else {
      html = React.createElement(component, props);
    }

    // Initialize hydration context for this request
    const hydrationCtx = initializeHydrationContext();

    // Set up component registry for client component wrapping
    global.__COMPONENT_REGISTRY__ = (data) => {
      hydrationCtx.clientComponents.set(data.instanceId, data);
    };

    // Single pass: render to string to collect which components are used
    // This renders the component tree and populates hydrationCtx with registered components
    const startTime = Date.now();
    let htmlString = '';
    
    hydrationContext.run(hydrationCtx, () => {
      try {
        htmlString = renderToString(html);
      } catch (e) {
        console.error('[JSX Engine] Render error:', (e as Error).message?.split('\n')[0]);
        throw e;
      }
    });

    // Extract registered components from the context
    const registeredComponents = Array.from(
      hydrationCtx.clientComponents.values(),
    );
    
    const uniqueComponentNames = new Set(
      registeredComponents.map((c) => c.componentName),
    );
    
    // Use cached chunk paths (O(1) lookups)
    const hydrationScripts = Array.from(uniqueComponentNames)
      .map((componentName) => {
        const path = chunkPathCache.get(componentName);
        if (!path) {
          // Fallback to live lookup if not in cache (shouldn't happen in production)
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
        Array.from(uniqueComponentNames).join(', '),
      );
    }
    
    // Build hydration scripts HTML (vendor bundle + component chunks)
    let hydrationScriptsHtml = '';
    if (hydrationScripts.length > 0) {
      // Always load vendor bundle first (contains React + ReactDOM)
      hydrationScriptsHtml = '<script src="/chunks/vendor.js"></script>';
      // Then load component-specific chunks
      hydrationScripts.forEach(script => {
        hydrationScriptsHtml += `<script src="${script.path}"></script>`;
      });
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
    
    res.setHeader('content-type', 'text/html');
    reply.status(reply.statusCode || 200);
    res.end(htmlString);
  };
}
