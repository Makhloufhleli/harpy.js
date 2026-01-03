/**
 * Bun plugin to automatically wrap 'use client' components with hydration logic
 */

import { plugin, type BunPlugin } from "bun";
import { readFileSync } from "node:fs";

export const harpyHydrationPlugin: BunPlugin = {
  name: "harpy-hydration",
  setup(build) {
    // Intercept TypeScript/TSX files
    build.onLoad({ filter: /\.(tsx?|jsx?)$/ }, async (args) => {
      const source = readFileSync(args.path, "utf8");
      
      // Check if file has 'use client' directive
      if (!/^['"]use client['"]/.test(source.trim())) {
        return { contents: source, loader: args.path.endsWith('.tsx') || args.path.endsWith('.jsx') ? 'tsx' : 'ts' };
      }
      
      // Check if it has a default export
      if (!/export\s+default\s+(function|class|const|let|var|\{)/.test(source)) {
        return { contents: source, loader: args.path.endsWith('.tsx') || args.path.endsWith('.jsx') ? 'tsx' : 'ts' };
      }
      
      // Extract component name from file path
      const fileName = args.path.split("/").pop()!.replace(/\.(ts|tsx|js|jsx)$/, "");
      const componentName = fileName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      
      // Wrap the default export with withHydration
      const modifiedSource = wrapDefaultExport(source, componentName, args.path);
      
      return {
        contents: modifiedSource,
        loader: args.path.endsWith('.tsx') || args.path.endsWith('.jsx') ? 'tsx' : 'ts',
      };
    });
  },
};

/**
 * Wrap the default export of a component with withHydration
 */
function wrapDefaultExport(source: string, componentName: string, filePath: string): string {
  // Add import for withHydration at the top (after 'use client')
  const lines = source.split('\n');
  const firstNonDirectiveLine = lines.findIndex(line => 
    line.trim() && !line.trim().startsWith("'use") && !line.trim().startsWith('"use')
  );
  
  const importStatement = `import { withHydration } from '@harpy-js/core/runtime';\n`;
  lines.splice(firstNonDirectiveLine, 0, importStatement);
  
  // Find and wrap the default export
  const modifiedLines = lines.map(line => {
    // Match: export default function ComponentName
    if (/export\s+default\s+function\s+(\w+)/.test(line)) {
      return line.replace(
        /export\s+default\s+function\s+(\w+)/,
        `function $1`
      ) + `\nexport default withHydration(${componentName}, '${componentName}', '${filePath}');`;
    }
    
    // Match: export default ComponentName
    if (/export\s+default\s+(\w+);?$/.test(line)) {
      const match = line.match(/export\s+default\s+(\w+);?$/);
      if (match) {
        const exportedName = match[1];
        return `export default withHydration(${exportedName}, '${componentName}', '${filePath}');`;
      }
    }
    
    return line;
  });
  
  return modifiedLines.join('\n');
}

// Auto-install the plugin
plugin(harpyHydrationPlugin);
