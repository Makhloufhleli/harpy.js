/**
 * Browser-safe version of client component wrapper
 * This version is used only for client-side hydration and doesn't import Node modules
 */

import React from "react";

/**
 * Browser-compatible instance ID generator
 */
function generateBrowserInstanceId(prefix: string): string {
  const randomId = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${randomId}`;
}

/**
 * Client-side wrapper for hydration
 * Used during client-side hydration to wrap components
 */
export function hydrateClientComponent<T extends React.ComponentType<any>>(
  Component: T,
  componentName: string,
  props: Record<string, any>,
): React.ReactElement {
  const instanceId = generateBrowserInstanceId(`hydrate-${componentName}`);

  return React.createElement(
    "div",
    {
      id: instanceId,
      suppressHydrationWarning: true,
    },
    React.createElement(Component, props),
    React.createElement("script", {
      type: "application/json",
      id: `${instanceId}-props`,
      dangerouslySetInnerHTML: { __html: JSON.stringify(props) },
    }),
  );
}
