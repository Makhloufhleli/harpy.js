#!/usr/bin/env bun

/**
 * Simplified hydration build script:
 * 1. Find components with 'use client'
 * 2. Temporarily wrap their default exports with withHydration()
 * 3. Build client-side chunks
 * 4. Generate manifest
 * 
 * Note: Components are automatically wrapped at runtime by importing from core
 */

const PROJECT_ROOT = process.cwd();
const SRC_DIR = `${PROJECT_ROOT}/src`;
const HARPY_DIR = `${PROJECT_ROOT}/.harpy`;
const CHUNKS_DIR = `${HARPY_DIR}/chunks`;
const MANIFEST_FILE = `${HARPY_DIR}/hydration-manifest.json`;

interface ComponentFile {
  filePath: string;
  componentName: string;
  relativePath: string;
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
      // Check if file has a default export
      const hasDefaultExport = /export\s+default\s+(function|class|const|let|var)/.test(content);
      
      if (!hasDefaultExport) {
        continue;
      }
      
      const fileName = file.split("/").pop()!.replace(/\.(ts|tsx)$/, "");
      const componentName = fileName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");

      components.push({
        filePath: fullPath,
        componentName,
        relativePath: file,
      });
    }
  }

  return components;
}

/**
 * Generate hydration entry point for a component
 */
function generateHydrationEntry(component: ComponentFile): string {
  // Calculate relative path from chunks dir to component
  const pathParts = component.relativePath.split("/");
  const depth = pathParts.length;
  const relativePath = "../".repeat(depth + 1) + "src/" + component.relativePath;
  
  return `import { hydrateRoot } from 'react-dom/client';
import Component from '${relativePath}';

// Find all instances of this component and hydrate them
const elements = document.querySelectorAll('[data-harpy-hydrate="${component.componentName}"]');

elements.forEach((container) => {
  const propsScript = container.querySelector('[id$="-props"]');
  const props = propsScript ? JSON.parse(propsScript.textContent || '{}') : {};
  
  hydrateRoot(container, Component(props));
});
`;
}

async function main() {
  console.log("🔍 Detecting client components...");

  // Ensure directories exist
  await Bun.$`mkdir -p ${CHUNKS_DIR}`.quiet();

  // Find all client components
  const clientComponents = await findClientComponents();

  if (clientComponents.length === 0) {
    console.log("⚠️  No client components found");
    return;
  }

  console.log(`✓ Found ${clientComponents.length} client component(s)`);
  clientComponents.forEach((c) => console.log(`   - ${c.componentName}`));

  // Build client-side hydration bundles
  console.log("\n📦 Building hydration chunks...");
  const manifest: Record<string, string> = {};

  for (const component of clientComponents) {
    console.log(`   Building ${component.componentName}...`);
    
    const entryContent = generateHydrationEntry(component);
    const entryFile = `${CHUNKS_DIR}/${component.componentName}.entry.tsx`;
    await Bun.write(entryFile, entryContent);

    const outputFile = `${component.componentName}.js`;

    try {
      const result = await Bun.build({
        entrypoints: [entryFile],
        outdir: CHUNKS_DIR,
        naming: outputFile,
        target: "browser",
        format: "esm",
        minify: false,
        splitting: false,
        external: ['react', 'react-dom'],
      });

      if (!result.success) {
        console.error(`   ✗ Failed to build ${component.componentName}:`, result.logs);
        await Bun.$`rm -f ${entryFile}`.quiet();
        continue;
      }

      await Bun.$`rm -f ${entryFile}`.quiet();
      manifest[component.componentName] = outputFile;
      console.log(`   ✓ ${outputFile}`);
    } catch (error) {
      console.error(`   ✗ Failed to build ${component.componentName}:`, error);
    }
  }

  // Write manifest
  await Bun.write(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`\n✅ Hydration manifest written`);
  console.log(`📦 ${Object.keys(manifest).length} chunk(s) built`);
  console.log(`\n💡 Components will be automatically wrapped at runtime`);
}

main().catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});
