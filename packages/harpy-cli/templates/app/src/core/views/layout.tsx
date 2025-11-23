import React from 'react';
import type { JsxLayoutProps } from '@hepta-solutions/harpy-core';

export default function DefaultLayout({
  children,
  meta,
  hydrationScripts,
}: JsxLayoutProps & {
  hydrationScripts?: Array<{ componentName: string; path: string }>;
}) {
  const title = meta?.title ?? 'Harpy Framework';
  const description = meta?.description ?? 'A powerful NestJS + React framework with automatic hydration. Built for speed, precision, and adaptability.';
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
        <meta property="og:title" content={og.title || title} />
        <meta property="og:description" content={og.description || description} />
        <meta property="og:type" content={og.type || 'website'} />
        {og.image && <meta property="og:image" content={og.image} />}
        {og.url && <meta property="og:url" content={og.url} />}

        {/* Twitter cards */}
        <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
        <meta name="twitter:title" content={twitter.title || title} />
        <meta name="twitter:description" content={twitter.description || description} />
        {twitter.image && <meta name="twitter:image" content={twitter.image} />}
        
        {/* Favicon */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦅</text></svg>" />
      </head>
      <body className="bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2 group">
                <span className="text-3xl group-hover:scale-110 transition-transform">🦅</span>
                <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Harpy
                </span>
              </a>
              <nav className="flex gap-6">
                <a href="/" className="text-slate-600 hover:text-amber-600 font-medium transition-colors">
                  Home
                </a>
                <a href="/about" className="text-slate-600 hover:text-amber-600 font-medium transition-colors">
                  About
                </a>
              </nav>
            </div>
          </div>
        </header>

        <main id="body" className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12 mt-20">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">🦅</span>
                  <span className="text-xl font-bold">Harpy</span>
                </div>
                <p className="text-slate-400">
                  A powerful NestJS + React framework with automatic hydration.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4">Resources</h3>
                <ul className="space-y-2 text-slate-400">
                  <li><a href="https://github.com/Makhloufhleli/harpy.js" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="https://www.npmjs.com/package/@hepta-solutions/harpy-core" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NPM Core</a></li>
                  <li><a href="https://www.npmjs.com/package/@hepta-solutions/harpy-cli" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">NPM CLI</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4">Built With</h3>
                <ul className="space-y-2 text-slate-400">
                  <li>NestJS</li>
                  <li>React 19</li>
                  <li>Fastify</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
              <p>Powered by <span className="text-amber-500 font-semibold">Harpy</span> - Soar above the competition 🦅</p>
            </div>
          </div>
        </footer>

        {/* Auto-injected hydration scripts at end of body to ensure DOM is ready */}
        {chunkScripts.map((script) => (
          <script key={script.componentName} src={script.path}></script>
        ))}
      </body>
    </html>
  );
}
