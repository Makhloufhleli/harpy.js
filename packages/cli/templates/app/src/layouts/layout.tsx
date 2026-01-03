import type { LayoutProps } from '@harpy-js/core/runtime';

export function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Harpy.js on Bun</title>
        <meta
          name="description"
          content="A blazing-fast full-stack framework built on Bun with React SSR"
        />
        <link rel="stylesheet" href="/public/styles.css" />
      </head>
      <body className="bg-slate-50 min-h-screen">
        <header className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-purple-900 shadow-lg sticky top-0 z-50">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2 text-white font-bold text-xl">
                🦅 Harpy.js
              </a>
              <nav className="flex items-center gap-4">
                <a href="?lang=en" className="text-white/80 hover:text-white text-sm">EN</a>
                <a href="?lang=es" className="text-white/80 hover:text-white text-sm">ES</a>
                <a href="?lang=pt" className="text-white/80 hover:text-white text-sm">PT</a>
              </nav>
            </div>
          </div>
        </header>

        <main id="app" className="min-h-screen">
          {children}
        </main>

        <footer className="bg-slate-900 text-white/60 py-8 text-center text-sm">
          Built with Harpy.js on Bun 🚀
        </footer>
      </body>
    </html>
  );
}
