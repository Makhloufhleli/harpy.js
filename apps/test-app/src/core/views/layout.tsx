import React from 'react';
import type { JsxLayoutProps } from 'harpy-core/dist/core/jsx.engine';

export default function DefaultLayout({
  children,
  meta,
  hydrationScripts,
}: JsxLayoutProps & {
  hydrationScripts?: Array<{ componentName: string; path: string }>;
}) {
  const title = meta?.title ?? 'My App';
  const description = meta?.description ?? 'Default app description';
  const canonical = meta?.canonical ?? 'https://example.com';

  const og = meta?.openGraph ?? {};
  const twitter = meta?.twitter ?? {};

  // Use hydration scripts passed from the engine if available
  const chunkScripts = hydrationScripts || [];

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="/styles/styles.css" />

        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph tags */}
        {og.title && <meta property="og:title" content={og.title} />}
        {og.description && (
          <meta property="og:description" content={og.description} />
        )}
        {og.type && <meta property="og:type" content={og.type} />}
        {og.image && <meta property="og:image" content={og.image} />}
        {og.url && <meta property="og:url" content={og.url} />}

        {/* Twitter cards */}
        {twitter.card && <meta name="twitter:card" content={twitter.card} />}
        {twitter.title && <meta name="twitter:title" content={twitter.title} />}
        {twitter.description && (
          <meta name="twitter:description" content={twitter.description} />
        )}
        {twitter.image && <meta name="twitter:image" content={twitter.image} />}
      </head>
      <body className="bg-slate-50">
        <main id="body" className="min-h-screen">
          {children}
        </main>

        {/* Auto-injected hydration scripts at end of body to ensure DOM is ready */}
        {chunkScripts.map((script) => (
          <script key={script.componentName} src={script.path}></script>
        ))}
      </body>
    </html>
  );
}
