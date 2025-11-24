import * as React from 'react';
import { JsxLayoutProps } from '@hepta-solutions/harpy-core';

/**
 * Auth Layout - Centered card layout for authentication pages
 */
export default function AuthLayout({
  children,
  meta,
  hydrationScripts,
}: JsxLayoutProps & {
  hydrationScripts?: Array<{ componentName: string; path: string }>;
}) {
  const chunkScripts = hydrationScripts || [];

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{meta?.title || 'Authentication'}</title>
        {meta?.description && <meta name="description" content={meta.description} />}
        <link rel="stylesheet" href="/styles/styles.css" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-[90%]">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl text-blue-900 mb-2">Authentication</h1>
            <p className="text-gray-600 text-sm">Secure access to your account</p>
          </div>
          <div className="text-gray-800">
            {children}
          </div>
          <div className="mt-8 text-center pt-8 border-t border-gray-200">
            <a href="/" className="text-blue-700 font-medium hover:underline">← Back to Home</a>
          </div>
        </div>
        {/* Auto-injected hydration scripts */}
        {chunkScripts.map((script) => (
          <script key={script.componentName} src={script.path}></script>
        ))}
      </body>
    </html>
  );
}
