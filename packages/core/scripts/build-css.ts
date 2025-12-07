#!/usr/bin/env node
/**
 * Build script for Tailwind CSS v4
 * Compiles src/assets/styles.css to public/styles.css
 */

import * as fs from "fs";
import * as path from "path";

const inputFile = path.join(__dirname, "../src/assets/styles.css");
const outputFile = path.join(__dirname, "../public/styles.css");

// Create public directory if it doesn't exist
const publicDir = path.dirname(outputFile);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Read the input CSS file
const inputCSS = fs.readFileSync(inputFile, "utf8");

// Import and compile with Tailwind v4
(async () => {
  const tailwindModule = await import("@tailwindcss/postcss");
  const compile =
    (tailwindModule as any).default || (tailwindModule as any).compile;

  try {
    const output = await compile(inputCSS, {
      file: inputFile,
    });
    fs.writeFileSync(outputFile, output.toString());
    console.log("✅ CSS compiled successfully");
  } catch (err) {
    console.error("❌ CSS compilation failed:", err);
    process.exit(1);
  }
})();
