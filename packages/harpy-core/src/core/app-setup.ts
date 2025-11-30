import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import * as path from 'path';
// Use runtime `require` for optional fastify plugins so consumers don't need
// to install them as direct dependencies of the core package at compile time.
// We'll type them as `any` to avoid TypeScript module resolution errors here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyStatic: any = require('@fastify/static');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fastifyCookie: any = require('@fastify/cookie');
import { withJsxEngine } from './jsx.engine';

export interface HarpyAppOptions {
  /** JSX Default layout used by the app (optional) */
  layout?: any;
  /** Folder containing built server assets (chunks) — defaults to `dist` */
  distDir?: string;
}

/**
 * Configure a Nest + Fastify application with the standard Harpy defaults.
 *
 * This registers the JSX engine (if `layout` is provided), cookie support,
 * the `dist` static handler (required for hydration chunks), and an optional
 * public static handler. The function is intentionally conservative — it
 * registers only what Harpy needs to function, while allowing the caller to
 * pass a `publicDir` for project-specific assets.
 */
export async function configureHarpyApp(
  app: NestFastifyApplication,
  opts: HarpyAppOptions = {},
) {
  const { layout, distDir = 'dist' } = opts;

  if (layout) {
    withJsxEngine(app, layout);
  }

  const fastify = app.getHttpAdapter().getInstance();

  // Cookie support is required by i18n and other helpers
  // Register with defaults — callers can still register another plugin if needed.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fastify.register(fastifyCookie);

  // Ensure hydration chunks and other built assets are served from `dist`
  // This is important: hydration chunks are expected at the root ("/").
  // Use absolute path to be robust when invoked from different CWDs.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await fastify.register(fastifyStatic, {
    root: path.join(process.cwd(), distDir),
    prefix: '/',
    decorateReply: false,
  });

  // Note: we intentionally do not register a `public` static handler by
  // default. Some applications prefer to control their public asset handling
  // themselves (or not use a `public/` folder). If an app needs a public
  // directory served under `/public/`, it can call `fastify.register` in
  // its own `main.ts` after `configureHarpyApp`.

  // Analytics injection is intentionally omitted — keep analytics opt-in for
  // application authors so they can wire up their provider of choice.
}

/**
 * A small, strongly-typed wrapper exported for consumers who may face
 * editor/module-resolution issues when importing the original function.
 *
 * Use this in application `main.ts` to ensure the callsite is typed from
 * the core package itself (avoids local casting or lint workarounds).
 */
export async function setupHarpyApp(
  app: NestFastifyApplication,
  opts: HarpyAppOptions = {},
) {
  return configureHarpyApp(app, opts);
}
