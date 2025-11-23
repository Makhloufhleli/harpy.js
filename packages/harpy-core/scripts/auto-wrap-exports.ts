#!/usr/bin/env node

/**
 * Post-build script to automatically wrap client component exports
 *
 * This script:
 * 1. Identifies components with 'use client' directive in source
 * 2. Automatically wraps their compiled exports with autoWrapClientComponent
 * 3. Allows developers to write components without manual wrapping
 */

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

interface ClientComponentInfo {
  sourceFile: string;
  compiledFile: string;
  componentName: string;
}

/**
 * Find all TypeScript/TSX files with 'use client' directive
 */
function findClientComponentsInSource(): Map<string, string> {
  const clientComponents = new Map<string, string>(); // compiledFile -> componentName
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

            // Calculate the corresponding compiled file path
            const relativePath = path.relative(SRC_DIR, fullPath);
            const compiledPath = path.join(
              DIST_DIR,
              relativePath.replace(/\.tsx?$/, '.js'),
            );

            clientComponents.set(compiledPath, componentName);
          }
        } catch (error) {
          console.error(`Error reading file ${fullPath}:`, error);
        }
      }
    }
  }

  walkDir(SRC_DIR);
  return clientComponents;
}

/**
 * Transform a compiled JavaScript file to wrap the default export
 * Handles SWC's Object.defineProperty pattern
 */
function transformCompiledFile(
  filePath: string,
  componentName: string,
): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already wrapped (contains autoWrapClientComponent)
    if (content.includes('autoWrapClientComponent')) {
      console.log(`  ✓ Already wrapped: ${path.basename(filePath)}`);
      return true;
    }

    // Import the wrapper from harpy-core package instead of relative path
    const normalizedRelativePath = 'harpy-core';

    // Add the require at the top of the file (after the 'use strict' and initial Object.defineProperty)
    const requireStatement = `var { autoWrapClientComponent: _autoWrapClientComponent } = require("${normalizedRelativePath}");`;

    // Check if we have the 'use client' and Object.defineProperty pattern
    if (
      content.includes('"use strict"') &&
      content.includes('Object.defineProperty')
    ) {
      // Insert require statement after the initial Object.defineProperty setup
      content = content.replace(
        /("use strict";\s*Object\.defineProperty\([^}]+\}\);)/,
        `$1\n${requireStatement}`,
      );
    } else if (!content.includes(requireStatement)) {
      // Fallback: insert at the beginning after any initial comments
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('"use strict"')) {
          insertIndex = i + 1;
          break;
        }
      }
      lines.splice(insertIndex, 0, requireStatement);
      content = lines.join('\n');
    }

    // SWC pattern: const _default = ComponentName;
    const swcPattern = new RegExp(
      `const\\s+_default\\s*=\\s*${componentName}\\s*;`,
    );

    if (swcPattern.test(content)) {
      // Replace the _default assignment with a wrapped version
      content = content.replace(
        `const _default = ${componentName};`,
        `const _default = _autoWrapClientComponent(${componentName}, '${componentName}');`,
      );

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ Wrapped: ${path.basename(filePath)}`);
      return true;
    }

    // CommonJS pattern: exports.default = ComponentName;
    const pattern1 = new RegExp(
      `exports\\.default\\s*=\\s*${componentName}\\s*;`,
    );
    if (pattern1.test(content)) {
      content = content.replace(
        pattern1,
        `var { autoWrapClientComponent } = require("${normalizedRelativePath}");\nexports.default = autoWrapClientComponent(${componentName}, '${componentName}');`,
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ Wrapped: ${path.basename(filePath)}`);
      return true;
    }

    // ES6 pattern: export default ComponentName;
    const pattern2 = new RegExp(`export\\s+default\\s+${componentName}\\s*;`);
    if (pattern2.test(content)) {
      content = content.replace(
        `export default ${componentName};`,
        `import { autoWrapClientComponent as _autoWrapClientComponent } from "${normalizedRelativePath}";\nexport default _autoWrapClientComponent(${componentName}, '${componentName}');`,
      );
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ Wrapped: ${path.basename(filePath)}`);
      return true;
    }

    console.warn(
      `  ⚠️  Could not find default export pattern for ${componentName} in ${path.basename(filePath)}`,
    );
    return false;
  } catch (error) {
    console.error(`  ✗ Error transforming ${path.basename(filePath)}:`, error);
    return false;
  }
}

/**
 * Main function
 */
function main(): void {
  console.log('🔄 Auto-wrapping client component exports...\n');

  const clientComponents = findClientComponentsInSource();

  if (clientComponents.size === 0) {
    console.log('⚠️  No client components found\n');
    return;
  }

  console.log(`Found ${clientComponents.size} client component(s):\n`);

  let wrapped = 0;
  for (const [compiledPath, componentName] of clientComponents) {
    if (transformCompiledFile(compiledPath, componentName)) {
      wrapped++;
    }
  }

  console.log(
    `\n✨ Auto-wrap complete: ${wrapped}/${clientComponents.size} components wrapped\n`,
  );
}

main();
