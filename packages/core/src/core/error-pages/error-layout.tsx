import React from 'react';

export interface ErrorLayoutProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Default layout wrapper for error pages.
 * This ensures styles are loaded and provides a consistent structure.
 */
export default function ErrorLayout({
  children,
  title = 'Error',
}: ErrorLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles/styles.css" />
        <link rel="stylesheet" href="/assets/styles.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
