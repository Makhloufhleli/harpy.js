#!/usr/bin/env bun

/**
 * Bun-native CSS build script for Tailwind CSS v4
 * Compiles src/assets/global.css to .harpy/static/styles.css
 */

const PROJECT_ROOT = process.cwd();
const INPUT_FILE = `${PROJECT_ROOT}/src/assets/global.css`;
const OUTPUT_DIR = `${PROJECT_ROOT}/.harpy/static`;
const OUTPUT_FILE = `${OUTPUT_DIR}/styles.css`;

async function buildCSS() {
  try {
    // Ensure output directory exists
    await Bun.$`mkdir -p ${OUTPUT_DIR}`.quiet();

    // Read input CSS
    const inputCSS = await Bun.file(INPUT_FILE).text();

    // Compile with Tailwind v4
    const tailwindModule = await import("@tailwindcss/postcss");
    const compile = (tailwindModule as any).default || (tailwindModule as any).compile;

    const startTime = Date.now();
    const output = await compile(inputCSS, {
      file: INPUT_FILE,
    });

    // Write output
    await Bun.write(OUTPUT_FILE, output.toString());
    
    const duration = Date.now() - startTime;
    console.log(`✅ CSS compiled successfully in ${duration}ms → .harpy/static/styles.css`);
  } catch (err) {
    console.error("❌ CSS compilation failed:", err);
    process.exit(1);
  }
}

buildCSS();
