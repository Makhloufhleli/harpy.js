# configureHarpyApp

`configureHarpyApp(app, opts?)` is the centralized helper provided by `@hepta-solutions/harpy-core` to register the minimal runtime pieces that Harpy needs to function in a Nest + Fastify app.

Why use it

- Keeps the developer `main.ts` clean and consistent across CLI-created apps.
- Ensures the hydration chunks and runtime assets are served from the `dist` directory at the root path (`/`), which the framework expects.
- Registers cookie support (required by i18n) so consumers don't need to add that boilerplate.

Usage

```ts
import { configureHarpyApp } from "@hepta-solutions/harpy-core";
import DefaultLayout from "./layouts/layout";

await configureHarpyApp(app, { layout: DefaultLayout, distDir: "dist" });
```

Options

- `layout?: any` — optional default JSX layout to register with Harpy's JSX engine.
- `distDir?: string` — folder containing built server assets (chunks). Defaults to `dist`.

Important notes

- `distDir`:
  - Harpy expects hydration chunks and other built server assets to be served at the root (`/`). The helper will register a static handler for the provided `distDir` (defaults to `dist`).
  - If you changed your Nest build output (`outDir`) in your project's `tsconfig.json`, set `distDir` to that directory when calling `configureHarpyApp`.

- `public` assets:
  - The helper intentionally does NOT register a default `/public/` handler. Some projects prefer to control their public asset handling (or omit it altogether). If you want to serve a `public/` folder, register it in your `main.ts` after calling `configureHarpyApp`:

```ts
const fastify = app.getHttpAdapter().getInstance();
await fastify.register(require("@fastify/static"), {
  root: path.join(process.cwd(), "public"),
  prefix: "/public/",
  decorateReply: false,
});
```

- Analytics / other providers:
  - The core helper intentionally leaves analytics and similar integrations to application authors (opt-in). Add those integrations explicitly in `main.ts` when needed.

Advanced

- If you need to customize cookie plugin options, register `@fastify/cookie` yourself before or after calling `configureHarpyApp`.

If you have ideas for additional convenience options, we can add them to the helper but prefer explicit opt-in for integrations that are not required by Harpy's runtime.
