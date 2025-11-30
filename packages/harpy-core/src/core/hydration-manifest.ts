/**
 * Hydration manifest loader
 * Reads the generated hydration manifest at runtime to map component names to chunked filenames
 */

import * as fs from "fs";
import * as path from "path";

export interface HydrationManifest {
  [componentName: string]: string; // componentName -> chunkFileName
}

let cachedManifest: HydrationManifest | null = null;

/**
 * Get the hydration manifest
 * The manifest is generated during build and contains mappings of component names to cache-busted chunk filenames
 */
export function getHydrationManifest(): HydrationManifest {
  if (cachedManifest) {
    return cachedManifest;
  }

  // Try dist folder first (where it's generated), then legacy src location
  const manifestPaths = [
    path.join(process.cwd(), "dist", "hydration-manifest.json"),
    path.join(process.cwd(), "src", "hydration-manifest.json"), // legacy fallback
  ];

  let manifestPath: string | null = null;
  for (const p of manifestPaths) {
    if (fs.existsSync(p)) {
      manifestPath = p;
      break;
    }
  }

  if (!manifestPath) {
    console.warn(
      "[Hydration] Manifest file not found at any of:",
      manifestPaths,
      "- ensure build:hydration has been run",
    );
    return {};
  }

  try {
    const content = fs.readFileSync(manifestPath, "utf-8");
    cachedManifest = JSON.parse(content) as HydrationManifest;
    return cachedManifest;
  } catch (error) {
    console.error("[Hydration] Failed to load hydration manifest:", error);
    cachedManifest = {};
    return cachedManifest;
  }
}

/**
 * Get the chunk filename for a specific component
 */
export function getChunkFileName(componentName: string): string | null {
  const manifest = getHydrationManifest();
  return manifest[componentName] || null;
}

/**
 * Get the public path for a component chunk
 */
export function getChunkPath(componentName: string): string | null {
  const fileName = getChunkFileName(componentName);
  return fileName ? `/chunks/${fileName}` : null;
}

/**
 * Invalidate cached manifest (useful for development mode with hot reload)
 */
export function invalidateManifestCache(): void {
  cachedManifest = null;
}
