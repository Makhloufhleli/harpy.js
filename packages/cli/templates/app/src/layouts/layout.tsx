import { Link, type JsxLayoutProps } from "@harpy-js/core";
import { LanguageSwitcher } from "../components/language-switcher";
import Logo from "../components/logo";

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
                <Logo className="text-amber-500  size-12" />
              </a>
              <nav className="flex items-center gap-2 md:gap-3">
                
                <LanguageSwitcher />
              </nav>
            </div>
          </div>
        </header>

        <main id="body" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
