import React from 'react';
import Logo from '../components/logo';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Harpy.js App</title>
        <meta name="description" content="A blazing-fast full-stack framework built on Bun with React SSR" />
        <link rel="stylesheet" href="/_harpy/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-900 min-h-screen font-[Inter,system-ui,sans-serif] antialiased">
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-3 text-white font-bold text-xl hover:opacity-80 transition-opacity">
                <Logo className="w-8 h-8" />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Harpy.js</span>
              </a>
              <nav className="flex items-center gap-6">
                <a href="https://harpyjs.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Docs</a>
                <a href="https://github.com/AcroBytes/harpy.js" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">GitHub</a>
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                  <a href="?lang=en" className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">EN</a>
                  <a href="?lang=es" className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">ES</a>
                  <a href="?lang=pt" className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">PT</a>
                </div>
              </nav>
            </div>
          </div>
        </header>

        <main id="app" className="pt-16">
          {children}
        </main>

        <footer className="bg-slate-950 border-t border-slate-800">
          <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Logo className="w-6 h-6" />
                <span className="text-slate-400 text-sm">Built with Harpy.js on Bun</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://harpyjs.org" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">Documentation</a>
                <a href="https://github.com/AcroBytes/harpy.js" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">GitHub</a>
                <a href="https://bun.sh" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">Bun</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Harpy.js. Open source under MIT License.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
