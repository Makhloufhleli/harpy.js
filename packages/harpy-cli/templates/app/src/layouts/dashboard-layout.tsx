import * as React from "react";
import { JsxLayoutProps } from "@hepta-solutions/harpy-core";

/**
 * Dashboard Layout - Sidebar layout for admin/dashboard pages
 */
export default function DashboardLayout({
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
        <title>{meta?.title || "Dashboard"}</title>
        {meta?.description && (
          <meta name="description" content={meta.description} />
        )}
        <link rel="stylesheet" href="/styles/styles.css" />
      </head>
      <body className="min-h-screen bg-gray-100">
        <div className="grid grid-cols-[250px_1fr] min-h-screen">
          <aside className="bg-gradient-to-b from-slate-700 to-slate-800 text-white py-8">
            <div className="px-8 pb-8 border-b border-white/10 mb-8">
              <h2 className="text-2xl flex items-center gap-2">📊 Dashboard</h2>
            </div>
            <ul className="list-none">
              <li className="my-2">
                <a
                  href="/dashboard"
                  className="block px-8 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  Overview
                </a>
              </li>
              <li className="my-2">
                <a
                  href="/dashboard/analytics"
                  className="block px-8 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  Analytics
                </a>
              </li>
              <li className="my-2">
                <a
                  href="/dashboard/settings"
                  className="block px-8 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  Settings
                </a>
              </li>
              <li className="mt-8">
                <a
                  href="/"
                  className="block px-8 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  ← Exit Dashboard
                </a>
              </li>
            </ul>
          </aside>
          <div className="flex flex-col">
            <header className="bg-white px-8 py-6 shadow-sm flex justify-between items-center">
              <h1 className="text-slate-700 text-2xl">Dashboard</h1>
              <div className="flex gap-4 items-center">
                <span>👤 Admin</span>
                <a href="/auth/logout" className="text-slate-700 font-medium">
                  Logout
                </a>
              </div>
            </header>
            <main className="flex-1 p-8">{children}</main>
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
