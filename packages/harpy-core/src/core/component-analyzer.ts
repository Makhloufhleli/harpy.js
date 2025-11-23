import * as fs from 'fs';
import * as path from 'path';

/**
 * Detects if a component file has the 'use client' directive
 */
export function hasUseClientDirective(filePath: string): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Match "use client" directive at the start of the file, possibly after comments
    const useClientRegex = /^(['"]use client['"];?\s*)/m;
    return useClientRegex.test(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

/**
 * Get the component name from file path
 * Example: /src/features/home/views/counter.tsx -> Counter (converted from counter)
 */
export function getComponentNameFromPath(filePath: string): string {
  const fileName = path.basename(filePath, path.extname(filePath));
  // Convert kebab-case to PascalCase
  return fileName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Recursively find all component files (.tsx/.ts) in a directory
 */
export function findComponentFiles(
  dir: string,
  exclude: string[] = [],
): string[] {
  const components: string[] = [];

  function traverse(currentPath: string) {
    try {
      const files = fs.readdirSync(currentPath);

      for (const file of files) {
        const fullPath = path.join(currentPath, file);
        const stat = fs.statSync(fullPath);

        // Skip excluded paths
        if (exclude.some((ex) => fullPath.includes(ex))) {
          continue;
        }

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          // Only include files that export components (convention: in views/ or end with Component)
          if (
            fullPath.includes('/views/') ||
            file.endsWith('.component.ts') ||
            file.endsWith('.component.tsx')
          ) {
            components.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error traversing directory ${currentPath}:`, error);
    }
  }

  traverse(dir);
  return components;
}

/**
 * Get client components from source directory
 */
export function getClientComponents(srcDir: string): string[] {
  const components = findComponentFiles(srcDir, [
    '/node_modules/',
    '/dist/',
    '/test/',
    '/core/', // Exclude internal framework code
  ]);
  return components.filter((componentPath) =>
    hasUseClientDirective(componentPath),
  );
}
