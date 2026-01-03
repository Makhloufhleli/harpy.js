#!/usr/bin/env bun

/**
 * Build navigation script bundle
 * This script bundles the client-side navigation system
 */

const PROJECT_ROOT = process.cwd();
const HARPY_DIR = `${PROJECT_ROOT}/.harpy`;
const STATIC_DIR = `${HARPY_DIR}/static`;

async function buildNavigation() {
  console.log('📦 Building navigation bundle...');

  // Ensure directories exist
  await Bun.write(`${HARPY_DIR}/.gitkeep`, '');
  await Bun.write(`${STATIC_DIR}/.gitkeep`, '');

  try {
    // Build the navigation script
    const result = await Bun.build({
      entrypoints: [
        `${PROJECT_ROOT}/node_modules/@harpy-js/core/dist/client/init-navigation.js`,
      ],
      outdir: STATIC_DIR,
      naming: 'navigation.js',
      target: 'browser',
      minify: process.env.NODE_ENV === 'production',
      sourcemap: process.env.NODE_ENV !== 'production' ? 'external' : 'none',
    });

    if (!result.success) {
      console.error('❌ Navigation build failed:');
      for (const log of result.logs) {
        console.error(log);
      }
      process.exit(1);
    }

    console.log(`✅ Navigation bundle built: ${STATIC_DIR}/navigation.js`);
  } catch (error) {
    console.error('❌ Failed to build navigation:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  await buildNavigation();
}

export { buildNavigation };
