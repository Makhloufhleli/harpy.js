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

    // Generate the entry file content with improved hydration
    const entryContent = `
/**
 * Auto-generated hydration entry for ${componentName}
 * This file handles client-side hydration with proper props and context support
 */
import { hydrateRoot, createRoot } from 'react-dom/client';
import * as React from 'react';

// Import the client component
import ${componentName} from '${importPath}';

// Import hydration runtime (for provider support)
import { 
  registerComponent, 
  deserializeProps,
  hydrateAll,
  registerProvider 
} from '@harpy-js/core/client';

// Register this component for hydration
registerComponent('${componentName}', ${componentName});

/**
 * Find and hydrate all instances of ${componentName}
 */
function hydrate${componentName}() {
  // Find all instances marked for this component
  const instances = document.querySelectorAll('[data-harpy-hydrate="${componentName}"]');
  
  if (instances.length === 0) {
    return;
  }
  
  console.log('[Harpy] Hydrating ${componentName}: ' + instances.length + ' instance(s)');

  instances.forEach((element) => {
    const instanceId = element.getAttribute('data-harpy-id');
    const propsAttr = element.getAttribute('data-harpy-props');
    const keyAttr = element.getAttribute('data-harpy-key');
    
    if (!instanceId) {
      console.warn('[Harpy] Missing instance ID for ${componentName}');
      return;
    }
    
    // Parse serialized props
    let props: Record<string, any> = {};
    if (propsAttr) {
      try {
        props = deserializeProps(propsAttr);
      } catch (e) {
        console.error('[Harpy] Failed to parse props for ${componentName}:', e);
      }
    }
    
    // Add key if present (for collections)
    if (keyAttr !== null) {
      props.key = keyAttr;
    }
    
    try {
      // Create element with parsed props
      const componentElement = React.createElement(${componentName}, props);
      
      // Hydrate the component
      hydrateRoot(element, componentElement, {
        onRecoverableError: (error, errorInfo) => {
          console.warn('[Harpy] Recoverable error in ${componentName}:', error);
        },
      });
      
      console.log('[Harpy] ✓ Hydrated: ${componentName} (' + instanceId + ')');
    } catch (error) {
      console.error('[Harpy] Hydration failed for ${componentName}:', error);
      
      // Fallback: try client-side render
      try {
        let props: Record<string, any> = {};
        if (propsAttr) {
          props = deserializeProps(propsAttr);
        }
        const root = createRoot(element);
        root.render(React.createElement(${componentName}, props));
        console.log('[Harpy] ✓ Client rendered (fallback): ${componentName}');
      } catch (fallbackError) {
        console.error('[Harpy] Client render also failed:', fallbackError);
      }
    }
  });
}

// Run hydration when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate${componentName});
  } else {
    hydrate${componentName}();
  }
}

// Export for potential manual hydration
export { hydrate${componentName} };
`.trim();

    fs.writeFileSync(entryFilePath, entryContent, "utf-8");
    entryFiles.push(entryFilePath);

    console.log(`Generated hydration entry: ${entryFileName}`);
  }

  // Generate main hydration runtime entry
  generateMainHydrationEntry(outputDir, clientComponentPaths);

  return entryFiles;
}

/**
 * Generate the main hydration entry that bundles all components
 */
function generateMainHydrationEntry(
  outputDir: string,
  componentPaths: string[]
): void {
  const imports: string[] = [];
  const registrations: string[] = [];

  for (const componentPath of componentPaths) {
    const componentName = getComponentNameFromPath(componentPath);
    imports.push(`import './${componentName}';`);
  }

  const mainContent = `
/**
 * Main Hydration Entry
 * Auto-generated - imports all client component hydration scripts
 */
${imports.join('\n')}

console.log('[Harpy] Hydration scripts loaded');
`.trim();

  fs.writeFileSync(
    path.join(outputDir, 'hydration-main.ts'),
    mainContent,
    'utf-8'
  );

  console.log('Generated main hydration entry: hydration-main.ts');
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
