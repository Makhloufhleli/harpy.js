import * as fs from "fs";
import * as path from "path";
import {
  getClientComponents,
  getComponentNameFromPath,
} from "./component-analyzer";

/**
 * Generates separate entry point files for each client component
 * These files will be bundled separately to reduce bundle size
 */
export function generateHydrationEntryFiles(
  srcDir: string,
  outputDir: string,
): string[] {
  const clientComponentPaths = getClientComponents(srcDir);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const entryFiles: string[] = [];

  for (const componentPath of clientComponentPaths) {
    const componentName = getComponentNameFromPath(componentPath);
    const relativePath = path.relative(srcDir, componentPath);

    // Compute relative import path from assets/hydrate to the component
    const fromAssets = path.join(outputDir, "dummy.ts");
    let importPath = path.relative(path.dirname(fromAssets), componentPath);

    // Normalize path separators to forward slashes (required for imports)
    importPath = importPath.replace(/\\/g, "/");

    // Remove .tsx/.ts extension if present and add it explicitly
    importPath = importPath.replace(/\.tsx?$/, "");

    // Create entry file for this component
    const entryFileName = `${componentName}.ts`;
    const entryFilePath = path.join(outputDir, entryFileName);

    // Generate the entry file content
    const entryContent = `
import { hydrateRoot } from 'react-dom/client';
import * as React from 'react';

// Import the client component
import ${componentName} from '${importPath}';

/**
 * Auto-generated hydration entry for ${componentName}
 * This file is bundled separately to reduce the main bundle size
 */

// Find all instances of this component marked with data-hydration-id
const instances = document.querySelectorAll('[data-hydration-id]');

instances.forEach((element) => {
  const hydrationId = element.getAttribute('data-hydration-id');
  if (hydrationId) {
    try {
      // Hydrate the component
      hydrateRoot(element, React.createElement(${componentName}));
      console.log('[Hydration] Successfully hydrated ${componentName} (id: ' + hydrationId + ')');
    } catch (error) {
      console.error('[Hydration] Failed to hydrate ${componentName}:', error);
    }
  }
});
`.trim();

    fs.writeFileSync(entryFilePath, entryContent, "utf-8");
    entryFiles.push(entryFilePath);

    console.log(`Generated hydration entry: ${entryFileName}`);
  }

  return entryFiles;
}

/**
 * Get all hydration entry files that were generated
 */
export function getHydrationEntryFiles(outputDir: string): string[] {
  if (!fs.existsSync(outputDir)) {
    return [];
  }

  return fs
    .readdirSync(outputDir)
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"))
    .map((file) => path.join(outputDir, file));
}
