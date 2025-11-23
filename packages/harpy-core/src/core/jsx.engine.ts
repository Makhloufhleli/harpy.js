import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyReply } from 'fastify';
import * as React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { MetaOptions, RenderOptions } from '../decorators/jsx.decorator';
import { hydrationContext, initializeHydrationContext } from './hydration';
import { getChunkPath } from './hydration-manifest';

export interface JsxLayoutProps {
  children: React.ReactNode;
  meta?: MetaOptions;
}

export type JsxLayout = (props: JsxLayoutProps) => React.ReactElement;

export function withJsxEngine(
  app: NestFastifyApplication,
  defaultLayout: JsxLayout,
) {
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
    console.log('[JSX Engine] Setting up __COMPONENT_REGISTRY__');
    global.__COMPONENT_REGISTRY__ = (data) => {
      console.log('[JSX Engine] Registry callback called for:', data.componentName);
      hydrationCtx.clientComponents.set(data.instanceId, data);
    };

    // First pass: render to string to collect which components are used
    // This renders the component tree and populates hydrationCtx with registered components
    let hydrationScripts: Array<{ componentName: string; path: string }> = [];

    console.log(
      '[JSX Engine] Pre-rendering to collect component registrations...',
      'Registry available:',
      !!global.__COMPONENT_REGISTRY__,
    );
    hydrationContext.run(hydrationCtx, () => {
      try {
        renderToString(html);
      } catch (e) {
        // Pre-render may fail, we still try to get what was registered
        console.log(
          '[JSX Engine] Pre-render error:',
          (e as Error).message?.split('\n')[0],
        );
      }
    });

    // Extract registered components from the context we just populated
    const registeredComponents = Array.from(
      hydrationCtx.clientComponents.values(),
    );
    console.log(
      '[JSX Engine] Collected',
      registeredComponents.length,
      'component instances:',
      registeredComponents.map((c) => c.componentName).join(', '),
    );

    const uniqueComponentNames = new Set(
      registeredComponents.map((c) => c.componentName),
    );
    hydrationScripts = Array.from(uniqueComponentNames)
      .map((componentName) => {
        const path = getChunkPath(componentName);
        console.log('[JSX Engine] Mapping', componentName, '->', path);
        return path ? { componentName, path } : null;
      })
      .filter((script) => script !== null) as Array<{
      componentName: string;
      path: string;
    }>;

    console.log(
      `[JSX Engine] Found ${hydrationScripts.length} hydration scripts to inject`,
    );

    // Recreate the HTML tree with hydration scripts passed to layout
    const finalLayoutProps = {
      ...layoutProps,
      hydrationScripts,
    };

    let finalHtml: React.ReactElement;
    if (layout) {
      finalLayoutProps.children = React.createElement(component, props);
      finalHtml = React.createElement(layout, finalLayoutProps);
    } else {
      finalHtml = html;
    }

    // Render with a fresh context for the actual output
    // This ensures components render cleanly for the client
    const finalHydrationCtx = initializeHydrationContext();
    hydrationContext.run(finalHydrationCtx, () => {
      const { pipe } = renderToPipeableStream(finalHtml, {
        onShellReady() {
          res.setHeader('content-type', 'text/html');
          reply.status(reply.statusCode || 200);
          pipe(res);
        },
        onError(error) {
          console.error(error);
          if (!res.headersSent) {
            reply.status(500).send({ error: 'Internal Server Error' });
          } else {
            res.end();
          }
        },
      });
    });
  };
}
