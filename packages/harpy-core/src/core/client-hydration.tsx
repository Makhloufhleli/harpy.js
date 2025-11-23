/**
 * Client-side hydration entry point.
 * This script is injected into the HTML and runs in the browser to hydrate interactive components.
 */

import React from 'react';

/**
 * Client-side hydration entry point.
 * This script is injected into the HTML and runs in the browser to hydrate interactive components.
 */

interface HydrationMarker {
  componentName: string;
  instanceId: string;
  propsId: string;
}

/**
 * Finds all hydration markers in the DOM and returns their data
 */
function findHydrationMarkers(): HydrationMarker[] {
  const markers: HydrationMarker[] = [];

  // Find all divs with id starting with 'hydrate-'
  const hydrationDivs = document.querySelectorAll('div[id^="hydrate-"]');

  hydrationDivs.forEach((div) => {
    const instanceId = div.id;
    // Parse instanceId: "hydrate-ComponentName-uniqueid"
    const match = instanceId.match(/^hydrate-([^-]+)-(.+)$/);

    if (match) {
      const componentName = match[1];
      const propsScriptId = `${instanceId}-props`;

      markers.push({
        componentName,
        instanceId,
        propsId: propsScriptId,
      });
    }
  });

  return markers;
}

/**
 * Gets props for a hydration marker from the embedded script tag
 */
function getHydrationProps(propsId: string): Record<string, any> {
  const propsScript = document.getElementById(propsId);
  if (!propsScript) return {};

  try {
    return JSON.parse(propsScript.textContent || '{}');
  } catch (e) {
    console.warn(`Failed to parse props for ${propsId}:`, e);
    return {};
  }
}

/**
 * Hydrates a single client component
 * This is called by the bundled component chunk scripts
 */
export function hydrateComponent(
  componentName: string,
  Component: React.ComponentType<any>,
) {
  const markers = findHydrationMarkers();
  const relevantMarkers = markers.filter(
    (m) => m.componentName === componentName,
  );

  relevantMarkers.forEach((marker) => {
    const container = document.getElementById(marker.instanceId);
    if (!container) {
      console.warn(`Hydration container not found for ${marker.instanceId}`);
      return;
    }

    const props = getHydrationProps(marker.propsId);

    // Dynamically import React for hydration
    Promise.all([import('react-dom/client')]).then(([{ hydrateRoot }]) => {
      try {
        hydrateRoot(container, React.createElement(Component, props));
      } catch (error) {
        console.error(`Failed to hydrate component ${componentName}:`, error);
      }
    });
  });
}

// Export for use in component bundles
if (typeof window !== 'undefined') {
  (window as any).__HYDRATION__ = { hydrateComponent };
}
