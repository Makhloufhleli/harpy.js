#!/usr/bin/env bun
/**
 * Build script for Tailwind CSS v4
 * Compiles src/assets/global.css to .harpy/static/styles.css
 */

const PROJECT_ROOT = process.cwd();
const inputFile = `${PROJECT_ROOT}/src/assets/global.css`;
const outputDir = `${PROJECT_ROOT}/.harpy/static`;
const outputFile = `${outputDir}/styles.css`;

// Ensure output directory exists
await Bun.$`mkdir -p ${outputDir}`.quiet();

// Read the input CSS file
const inputCSS = await Bun.file(inputFile).text();

// Import and compile with Tailwind v4 PostCSS
try {
  const tailwindModule = await import("@tailwindcss/postcss");
  const postcss = await import("postcss");
  
  const tailwindPlugin = tailwindModule.default || tailwindModule;

  const result = await postcss.default([tailwindPlugin]).process(inputCSS, {
    from: inputFile,
    to: outputFile,
  });
  
  await Bun.write(outputFile, result.css);
  console.log(`✅ CSS compiled successfully to ${outputFile}`);
  console.log(`   Generated ${result.css.length} bytes`);
} catch (err) {
  console.error("❌ CSS compilation failed:", err);
  process.exit(1);
}
