/**
 * Hydration manifest loader for Bun runtime
 * Reads the generated hydration manifest at runtime to map component names to chunked filenames
 * 
 * Note: Uses Bun's built-in node:path compatibility
 */

export interface HydrationManifest {
  [componentName: string]: string; // componentName -> chunkFileName
}

let cachedManifest: HydrationManifest | null = null;
let manifestLoaded = false;

/**
 * Get the hydration manifest (sync version using cached data)
 * The manifest is generated during build and contains mappings of component names to cache-busted chunk filenames
 */
export function getHydrationManifest(): HydrationManifest {
  if (cachedManifest) {
    return cachedManifest;
  }
  
  // If not loaded yet, try sync loading
  if (!manifestLoaded) {
    loadManifestSync();
  }
  
  return cachedManifest || {};
}

/**
 * Load manifest synchronously at startup using Bun.file
 * Note: We use file.size to check existence (sync in Bun) and 
 * Bun.spawnSync to read file content synchronously
 */
function loadManifestSync(): void {
  const cwd = process.cwd();
  const manifestPaths = [
    `${cwd}/.harpy/hydration-manifest.json`,
    `${cwd}/dist/hydration-manifest.json`,
    `${cwd}/src/hydration-manifest.json`,
  ];

  for (const p of manifestPaths) {
    try {
      const file = Bun.file(p);
      // file.size is synchronous in Bun and returns 0 if file doesn't exist
      if (file.size > 0) {
        // Use Bun.spawnSync to read file synchronously
        const result = Bun.spawnSync(['cat', p]);
        if (result.success) {
          const content = JSON.parse(result.stdout.toString());
          cachedManifest = content as HydrationManifest;
          manifestLoaded = true;
          return;
        }
      }
    } catch {
      // File doesn't exist or can't be read, try next
    }
  }

  console.warn(
    '[Hydration] Manifest file not found at any of:',
    manifestPaths,
    '- ensure build:hydration has been run'
  );
  cachedManifest = {};
  manifestLoaded = true;
}

/**
 * Load manifest asynchronously (preferred for initialization)
 */
export async function loadHydrationManifest(): Promise<HydrationManifest> {
  if (cachedManifest) {
    return cachedManifest;
  }

  const cwd = process.cwd();
  const manifestPaths = [
    `${cwd}/.harpy/hydration-manifest.json`,
    `${cwd}/dist/hydration-manifest.json`,
    `${cwd}/src/hydration-manifest.json`,
  ];

  for (const p of manifestPaths) {
    try {
      const file = Bun.file(p);
      if (await file.exists()) {
        const content = await file.text();
        cachedManifest = JSON.parse(content) as HydrationManifest;
        manifestLoaded = true;
        return cachedManifest;
      }
    } catch {
      // File doesn't exist or can't be read, try next
    }
  }

  console.warn(
    '[Hydration] Manifest file not found at any of:',
    manifestPaths,
    '- ensure build:hydration has been run'
  );
  cachedManifest = {};
  manifestLoaded = true;
  return cachedManifest;
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
  return fileName ? `/_harpy/chunks/${fileName}` : null;
}

/**
 * Invalidate cached manifest (useful for development mode with hot reload)
 */
export function invalidateManifestCache(): void {
  cachedManifest = null;
}
