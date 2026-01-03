#!/usr/bin/env bun

/**
 * Bun-native build script to:
 * 1. Analyze components for 'use client' directive
 * 2. Generate separate hydration entry files
 * 3. Bundle them with Bun to .harpy/chunks
 * 4. Create a manifest file for server-side lookup
 */

const PROJECT_ROOT = process.cwd();
const SRC_DIR = `${PROJECT_ROOT}/src`;
const HARPY_DIR = `${PROJECT_ROOT}/.harpy`;
const CHUNKS_DIR = `${HARPY_DIR}/chunks`;
const BACKUPS_DIR = `${HARPY_DIR}/component-originals`;
const MANIFEST_FILE = `${HARPY_DIR}/hydration-manifest.json`;

interface ComponentFile {
  filePath: string;
  componentName: string;
}

/**
 * Restore original components from backups
 */
async function restoreOriginalComponents(): Promise<void> {
  try {
    const backupsExist = await Bun.file(BACKUPS_DIR).exists();
    if (!backupsExist) return;

    const glob = new Bun.Glob("*.original.tsx");
    const backups = await Array.fromAsync(glob.scan({ cwd: BACKUPS_DIR, onlyFiles: true }));

    for (const backup of backups) {
      const backupPath = `${BACKUPS_DIR}/${backup}`;
      const originalContent = await Bun.file(backupPath).text();
      
      // Find the component name from backup filename
      const componentName = backup.replace('.original.tsx', '');
      
      // Find the source file (search for it)
      const srcGlob = new Bun.Glob(`**/${componentName.toLowerCase()}.tsx`);
      const srcFiles = await Array.fromAsync(srcGlob.scan({ cwd: SRC_DIR, onlyFiles: true }));
      
      if (srcFiles.length > 0) {
        const srcPath = `${SRC_DIR}/${srcFiles[0]}`;
        await Bun.write(srcPath, originalContent);
      }
    }
  } catch (error) {
    // Silently ignore restoration errors on first run
  }
}

interface ComponentFile {
  filePath: string;
  componentName: string;
}

/**
 * Find all files with 'use client' directive
 */
async function findClientComponents(): Promise<ComponentFile[]> {
  const components: ComponentFile[] = [];
  
  const glob = new Bun.Glob("**/*.{ts,tsx}");
  const files = await Array.fromAsync(glob.scan({ cwd: SRC_DIR, onlyFiles: true }));

  for (const file of files) {
    const fullPath = `${SRC_DIR}/${file}`;
    const content = await Bun.file(fullPath).text();

    // Check for 'use client' directive at the start
    if (/^['"]use client['"]/.test(content.trim())) {
      // Check if file has a default export (required for hydration)
      const hasDefaultExport = /export\s+default\s+(function|class|const|let|var|\{)/.test(content);
      
      if (!hasDefaultExport) {
        // Skip files without default export (e.g., context providers with only named exports)
        continue;
      }
      
      const fileName = file.split("/").pop()!.replace(/\.(ts|tsx)$/, "");
      // Convert kebab-case to PascalCase
      const componentName = fileName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      components.push({
        filePath: fullPath,
        componentName,
      });
    }
  }

  return components;
}

/**
 * Generate hydration entry file for a client component
 */
function generateHydrationEntry(component: ComponentFile): string {
  return `
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import Component from '${component.filePath}';

// Find all hydration containers for this component
const containers = document.querySelectorAll('[data-harpy-hydrate="${component.componentName}"]');

containers.forEach((container) => {
  const containerElement = container as HTMLElement;
  const propsAttr = containerElement.getAttribute('data-harpy-props');
  
  let props = {};
  if (propsAttr) {
    try {
      props = JSON.parse(propsAttr);
    } catch (error) {
      console.error('[Hydration] Error parsing props:', error);
    }
  }

  try {
    hydrateRoot(containerElement, React.createElement(Component, props));
    console.log('[Hydration] Hydrated ${component.componentName} at', containerElement);
  } catch (error) {
    console.error('[Hydration] Failed to hydrate ${component.componentName}:', error);
  }
});
`.trim();
}

/**
 * Main build process
 */
async function main() {
  console.log("🔍 Detecting client components...");
  const clientComponents = await findClientComponents();

  if (clientComponents.length === 0) {
    console.log("⚠️  No client components found");
    // Ensure directory exists and create empty manifest
    await Bun.$`mkdir -p ${CHUNKS_DIR}`.quiet();
    await Bun.write(MANIFEST_FILE, JSON.stringify({}, null, 2));
    return;
  }

  console.log(`✅ Found ${clientComponents.length} client component(s):`);
  clientComponents.forEach(c => console.log(`   - ${c.componentName}`));

  // Ensure chunks directory exists
  await Bun.$`mkdir -p ${CHUNKS_DIR}`.quiet();

  const manifest: Record<string, string> = {};

  // Step 1: Generate SSR wrapper files in .harpy/wrappers/
  console.log("\n📝 Generating SSR wrappers...");
  
  const WRAPPERS_DIR = `${HARPY_DIR}/wrappers`;
  await Bun.$`mkdir -p ${WRAPPERS_DIR}`.quiet();
  
  for (const component of clientComponents) {
    const wrapperContent = `
import React from 'react';
import { registerClientComponent } from '@harpy-js/core/runtime';
import OriginalComponent from '${component.filePath}';

export default function ${component.componentName}(props: any) {
  const instanceId = \`harpy-\${Math.random().toString(36).slice(2)}\`;
  
  if (typeof window === 'undefined') {
    // Server-side: register and wrap in hydration container
    if ((global as any).__COMPONENT_REGISTRY__) {
      (global as any).__COMPONENT_REGISTRY__({
        instanceId,
        componentName: '${component.componentName}',
        props,
      });
    }
    
    return React.createElement(
      'div',
      {
        'data-harpy-hydrate': '${component.componentName}',
        'data-harpy-id': instanceId,
        'data-harpy-props': JSON.stringify(props),
        style: { display: 'contents' },
      },
      React.createElement(OriginalComponent, props)
    );
  }
  
  // Client-side: just render the component
  return React.createElement(OriginalComponent, props);
}
`.trim();

    const wrapperPath = `${WRAPPERS_DIR}/${component.componentName}.wrapper.tsx`;
    await Bun.write(wrapperPath, wrapperContent);
    console.log(`   ✓ ${component.componentName} wrapper`);
  }

  // Step 2: Build client-side hydration bundles
  console.log("\n📦 Building hydration chunks...");
  for (const component of clientComponents) {
  // Step 2: Build client-side hydration bundles
  console.log("\n📦 Building hydration chunks...");
  for (const component of clientComponents) {
    console.log(`   Building ${component.componentName}...`);
    
    // Generate entry content
    const entryContent = generateHydrationEntry(component);
    
    // Write to temp entry file
    const entryFile = `${CHUNKS_DIR}/${component.componentName}.entry.tsx`;
    await Bun.write(entryFile, entryContent);

    // Bundle with Bun
    const outputFile = `${component.componentName}.js`;
    const outputPath = `${CHUNKS_DIR}/${outputFile}`;

    try {
      const result = await Bun.build({
        entrypoints: [entryFile],
        outdir: CHUNKS_DIR,
        naming: outputFile,
        target: "browser",
        format: "esm",
        minify: false,
        splitting: false,
      });

      if (!result.success) {
        console.error(`   ✗ Failed to build ${component.componentName}:`, result.logs);
        // Clean up entry file even on failure
        await Bun.$`rm -f ${entryFile}`.quiet();
        continue;
      }

      // Clean up entry file
      await Bun.$`rm -f ${entryFile}`.quiet();

      manifest[component.componentName] = outputFile;
      console.log(`   ✓ ${outputFile}`);
    } catch (error) {
      console.error(`   ✗ Failed to build ${component.componentName}:`, error);
    }
  }

  // Write manifest
  await Bun.write(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Hydration manifest written to ${MANIFEST_FILE}`);
  console.log(`📦 ${Object.keys(manifest).length} chunk(s) built`);
  console.log('💡 Wrappers created in .harpy/wrappers/ - import from there for hydration');

  // Build navigation bundle
  console.log('\n📦 Building navigation bundle...');
  try {
    const navResult = await Bun.build({
      entrypoints: [`${PROJECT_ROOT}/node_modules/@harpy-js/core/dist/client/init-navigation.js`],
      outdir: `${HARPY_DIR}/static`,
      naming: 'navigation.js',
      target: 'browser',
      minify: false,
      sourcemap: 'external',
    });

    if (navResult.success) {
      console.log(`✅ Navigation bundle: ${HARPY_DIR}/static/navigation.js`);
    }
  } catch (error) {
    console.warn('⚠️  Navigation bundle build skipped (optional)');
  }
}
}

main().catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});
