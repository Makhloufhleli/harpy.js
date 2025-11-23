/**
 * SWC Plugin for automatic client component wrapping
 *
 * This plugin detects files with 'use client' directive and automatically
 * wraps the default export with the hydration wrapper, similar to Next.js 15.
 *
 * No manual wrapping required - just use 'use client' at the top of the file.
 */

module.exports = function (api) {
  return {
    name: 'client-component-wrapper',

    visitor: {
      Program: {
        enter(path, state) {
          const { filename } = state;
          const sourceCode = state.source;

          // Check if the file has 'use client' directive
          const hasUseClientDirective = /^['"]use client['"];?\s*/.test(
            sourceCode,
          );

          if (!hasUseClientDirective) {
            return;
          }

          // Find the default export
          path.node.body.forEach((stmt, index) => {
            if (stmt.type === 'ExportDefaultDeclaration') {
              const declaration = stmt.declaration;

              // Handle: export default function Component() { ... }
              if (declaration.type === 'FunctionDeclaration') {
                const componentName = declaration.id.name;
                const wrappedName = `__wrapped_${componentName}`;

                // Rename original function
                declaration.id.name = wrappedName;

                // Replace export with wrapped version
                stmt.declaration = {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'autoWrapClientComponent',
                  },
                  arguments: [
                    {
                      type: 'Identifier',
                      name: wrappedName,
                    },
                    {
                      type: 'StringLiteral',
                      value: componentName,
                    },
                  ],
                };

                // Add import for autoWrapClientComponent if not already present
                addImportIfNeeded(
                  path,
                  'autoWrapClientComponent',
                  '@/core/client-component-wrapper',
                );
              }
              // Handle: export default Component (identifier)
              else if (declaration.type === 'Identifier') {
                const componentName = declaration.name;

                // Wrap the identifier in a call
                stmt.declaration = {
                  type: 'CallExpression',
                  callee: {
                    type: 'Identifier',
                    name: 'autoWrapClientComponent',
                  },
                  arguments: [
                    {
                      type: 'Identifier',
                      name: componentName,
                    },
                    {
                      type: 'StringLiteral',
                      value: componentName,
                    },
                  ],
                };

                addImportIfNeeded(
                  path,
                  'autoWrapClientComponent',
                  '@/core/client-component-wrapper',
                );
              }
            }
          });
        },
      },
    },
  };

  function addImportIfNeeded(path, importName, fromModule) {
    // Check if import already exists
    let hasImport = false;

    path.node.body.forEach((stmt) => {
      if (
        stmt.type === 'ImportDeclaration' &&
        stmt.source.value === fromModule
      ) {
        // Check if the specific import exists
        stmt.specifiers.forEach((spec) => {
          if (spec.local.name === importName) {
            hasImport = true;
          }
        });
      }
    });

    // If not found, add the import at the beginning (after 'use client')
    if (!hasImport) {
      let insertIndex = 0;

      // Skip 'use client' directive
      if (
        path.node.body[0] &&
        path.node.body[0].type === 'ExpressionStatement' &&
        path.node.body[0].expression.type === 'StringLiteral'
      ) {
        insertIndex = 1;
      }

      const importStatement = {
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportSpecifier',
            imported: {
              type: 'Identifier',
              name: importName,
            },
            local: {
              type: 'Identifier',
              name: importName,
            },
          },
        ],
        source: {
          type: 'StringLiteral',
          value: fromModule,
        },
      };

      path.node.body.splice(insertIndex, 0, importStatement);
    }
  }
};
