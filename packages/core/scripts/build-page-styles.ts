#!/usr/bin/env node
/**
 * Build script for common CSS file
 * Generates a single styles.css with all Tailwind styles for the entire app
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const stylesDir = path.join(distDir, "styles");
const srcAssetsDir = path.join(projectRoot, "src/assets");
const outputCssPath = path.join(stylesDir, "styles.css");

async function main(): Promise<void> {
  console.log("🎨 Building styles...");

  try {
    // Ensure styles directory exists
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    // Compile Tailwind CSS
    console.log("   Compiling Tailwind CSS...");
    execSync(
      `NODE_ENV=production postcss ${path.join(srcAssetsDir, "styles.css")} -o ${outputCssPath}`,
      {
        stdio: "inherit",
      },
    );

    console.log(`   ✓ Generated styles.css`);
    console.log("✨ Styles build complete!");
  } catch (error: any) {
    console.error("❌ CSS generation failed:", error.message);
    process.exit(1);
  }
}

main();
