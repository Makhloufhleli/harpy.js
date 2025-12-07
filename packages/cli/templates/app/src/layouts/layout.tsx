import { Link, type JsxLayoutProps } from "@harpy-js/core";
import { LanguageSwitcher } from "../components/language-switcher";

export default function DefaultLayout({
  children,
  meta,
}: JsxLayoutProps) {
  const title = meta?.title ?? "Harpy Framework";
  const description =
    meta?.description ??
    "A powerful NestJS + React framework with automatic hydration. Built for speed, precision, and adaptability.";
  const canonical =
    meta?.canonical ?? "https://github.com/Makhloufhleli/harpy.js";

  const og = meta?.openGraph ?? {};
  const twitter = meta?.twitter ?? {};

  return (
    <html lang="en">
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="HarpyJS, JavaScript library, JS framework, web development, full-stack development, open source, Performance, NestJS, developer tools, web apps"
        />
        <link rel="stylesheet" href="/styles/styles.css" />

        {/* Favicon and Icon Configuration */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="application-name" content="Harpy.js" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Harpy.js" />

        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />

        {/* Open Graph tags */}
        <meta property="og:title" content={og.title || title} />
        <meta
          property="og:description"
          content={og.description || description}
        />
        <meta property="og:type" content={og.type || "website"} />
        <meta property="og:image" content={og.image || "/favicon.svg"} />
        <meta property="og:image:type" content="image/svg+xml" />
        {og.url && <meta property="og:url" content={og.url} />}

        {/* Twitter cards */}
        <meta
          name="twitter:card"
          content={twitter.card || "summary_large_image"}
        />
        <meta name="twitter:title" content={twitter.title || title} />
        <meta
          name="twitter:description"
          content={twitter.description || description}
        />
        <meta name="twitter:image" content={twitter.image || "/favicon.svg"} />
      </head>
      <body className="bg-slate-50 overflow-x-hidden">
        {/* Header */}
        <header className="bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-purple-900 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-2 group">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  🦅
                </span>
              </a>
              <nav className="flex items-center gap-2 md:gap-3">
                <Link
                  href="https://github.com/Makhloufhleli/harpy.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-base font-medium rounded-lg transition-all"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="hidden sm:inline">GitHub</span>
                </Link>
                <Link
                  href="https://www.npmjs.com/package/@harpy-js/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
                  </svg>
                  npm
                </Link>
                <LanguageSwitcher />
              </nav>
            </div>
          </div>
        </header>

        <main id="body" className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-bl from-slate-900 via-purple-900 to-slate-900 text-white py-12 border-t border-slate-700">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">🦅</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Harpy.js
                  </span>
                </div>
                <p className="text-slate-300">
                  A powerful NestJS + React framework with automatic hydration.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white">Resources</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>
                    <Link
                      href="https://harpyjs.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-400 transition-colors"
                    >
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.npmjs.com/package/@harpy-js/core"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-400 transition-colors"
                    >
                      NPM Core
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="https://www.npmjs.com/package/@harpy-js/cli"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-amber-400 transition-colors"
                    >
                      NPM CLI
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 text-white">Built With</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>NestJS 11</li>
                  <li>React 19</li>
                  <li>Fastify</li>
                  <li>Tailwind CSS</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-8 text-center">
              <p className="text-slate-400 mb-2">
                Powered by{" "}
                <span className="text-amber-500 font-semibold">Harpy.js</span> -
                Soar above the competition
              </p>
              <p className="text-slate-500">
                Built with ❤️ by{" "}
                <a
                  href="https://github.com/Makhloufhleli"
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Makhlouf Helali
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
