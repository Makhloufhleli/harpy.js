#!/usr/bin/env node

/**
 * Build script to:
 * 1. Analyze components for 'use client' directive
 * 2. Generate separate hydration entry files
 * 3. Bundle them with esbuild to dist/chunks with cache-busted names
 * 4. Create a manifest file for server-side lookup
 */

import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const HYDRATION_ENTRIES_DIR = path.join(SRC_DIR, '.hydration-entries');
const CHUNKS_DIR = path.join(DIST_DIR, 'chunks');
// Write manifest directly to dist (no need for temp since this runs after nest build)
const MANIFEST_FILE = path.join(DIST_DIR, 'hydration-manifest.json');

// Check if running in production mode (add cache-busting hashes only in production)
const IS_PRODUCTION = process.argv.includes('--prod');

interface ComponentFile {
  filePath: string;
  componentName: string;
  isNamedExport: boolean; // Track if it's a named export
}

interface HydrationManifest {
  [componentName: string]: string; // componentName -> chunkFileName
}

/**
 * Find all files with 'use client' directive
 */
function findClientComponents(): ComponentFile[] {
  const components: ComponentFile[] = [];
  const extensions = ['.ts', '.tsx'];

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walkDir(fullPath);
        }
      } else if (extensions.includes(path.extname(entry.name))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');

          // Check for 'use client' directive at the start of the file
          if (/^['"]use client['"]/.test(content.trim())) {
            const fileName = path.basename(fullPath, path.extname(fullPath));
            // Convert kebab-case to PascalCase
            const componentName = fileName
              .split('-')
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join('');
            
            // Detect if it's a named export by checking for patterns like:
            // export function ComponentName or export const ComponentName
            const hasNamedExport = new RegExp(
              `export\\s+(function|const|class)\\s+${componentName}\\b`
            ).test(content);
            
            components.push({
              filePath: fullPath,
              componentName,
              isNamedExport: hasNamedExport,
            });
          }
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  }

  walkDir(SRC_DIR);
  return components;
}

/**
 * Generate hydration entry file for a client component
 */
function generateHydrationEntry(component: ComponentFile): string {
  const relativePath = path.relative(HYDRATION_ENTRIES_DIR, component.filePath);
  const importPath = `./${relativePath.replace(/\\\\/g, '/')}`;

  // Generate appropriate import statement based on export type
  const importStatement = component.isNamedExport
    ? `import { ${component.componentName} } from '${importPath}';`
    : `import ${component.componentName} from '${importPath}';`;

  const content = `
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
${importStatement}

/**
 * Auto-generated hydration entry for ${component.componentName}
 */

// Find all hydration containers for this component
const containers = document.querySelectorAll('[id^="hydrate-${component.componentName}"]');

containers.forEach((container) => {
  const containerElement = container as HTMLElement;
  const propsElement = document.getElementById(\`\${container.id}-props\`);
  
  let props = {};
  if (propsElement) {
    try {
      props = JSON.parse(propsElement.textContent || '{}');
    } catch (error) {
      console.error('Error parsing props:', error);
    }
  }

  try {
    hydrateRoot(containerElement, React.createElement(${component.componentName}, props));
    console.log('[Hydration] Hydrated ${component.componentName}');
  } catch (error) {
    console.error('[Hydration] Failed to hydrate ${component.componentName}:', error);
  }
});
`.trim();

  return content;
}

/**
 * Generate cache-busted filename (production only)
 * In dev mode, uses consistent filenames so the browser doesn't re-download
 */
function generateChunkFilename(componentName: string): string {
  if (IS_PRODUCTION) {
    // Production: use cache-busting hash
    const hash = crypto.randomBytes(8).toString('hex');
    return `${componentName}.${hash}.js`;
  } else {
    // Development: use consistent filename
    return `${componentName}.js`;
  }
}

/**
 * Main build process
 */
function main(): void {
  // Ensure hydration entries directory exists
  if (!fs.existsSync(HYDRATION_ENTRIES_DIR)) {
    fs.mkdirSync(HYDRATION_ENTRIES_DIR, { recursive: true });
  }

  console.log('🔍 Detecting client components...');
  const clientComponents = findClientComponents();

  if (clientComponents.length === 0) {
    console.log('⚠️  No client components found');
    // Still ensure chunks directory exists and clear manifest
    if (!fs.existsSync(CHUNKS_DIR)) {
      fs.mkdirSync(CHUNKS_DIR, { recursive: true });
    }
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify({}, null, 2), 'utf-8');
    return;
  }

  console.log(`✅ Found ${clientComponents.length} client component(s):`);
  clientComponents.forEach((c) => console.log(`   - ${c.componentName}`));

  // Create hydration entries directory
  if (!fs.existsSync(HYDRATION_ENTRIES_DIR)) {
    fs.mkdirSync(HYDRATION_ENTRIES_DIR, { recursive: true });
  }

  // Ensure chunks directory exists
  if (!fs.existsSync(CHUNKS_DIR)) {
    fs.mkdirSync(CHUNKS_DIR, { recursive: true });
  }

  console.log('\n📝 Generating hydration entries...');

  // Generate hydration entry files
  const entryFiles: { path: string; componentName: string }[] = [];
  for (const component of clientComponents) {
    const entryContent = generateHydrationEntry(component);
    const entryPath = path.join(
      HYDRATION_ENTRIES_DIR,
      `${component.componentName}.tsx`,
    );

    fs.writeFileSync(entryPath, entryContent, 'utf-8');
    entryFiles.push({
      path: entryPath,
      componentName: component.componentName,
    });
    console.log(`   ✓ ${component.componentName}.tsx`);
  }

  // Bundle each entry file separately with cache-busted names
  console.log('\n📦 Bundling hydration scripts with cache busting...');

  const manifest: HydrationManifest = {};

  for (const entry of entryFiles) {
    const chunkFilename = generateChunkFilename(entry.componentName);
    const outputPath = path.join(CHUNKS_DIR, chunkFilename);

    try {
      const command = `npx esbuild "${entry.path}" --bundle --minify --sourcemap --target=chrome120 --keep-names --outfile="${outputPath}" --platform=browser`;
      execSync(command, { stdio: 'inherit' });
      manifest[entry.componentName] = chunkFilename;
      console.log(`   ✓ ${entry.componentName} -> ${chunkFilename}`);
    } catch (error) {
      console.error(`   ✗ Failed to bundle ${entry.componentName}:`, error);
      process.exit(1);
    }
  }

  // Write manifest file for server-side lookup
  console.log('\n📋 Writing hydration manifest...');
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`   ✓ Manifest written to ${MANIFEST_FILE}`);

  // Clean up temporary entries directory
  if (fs.existsSync(HYDRATION_ENTRIES_DIR)) {
    fs.rmSync(HYDRATION_ENTRIES_DIR, { recursive: true });
  }

  console.log('\n✨ Hydration build complete!');
}

main();
