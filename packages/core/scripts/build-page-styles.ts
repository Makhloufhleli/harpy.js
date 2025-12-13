#!/usr/bin/env node
/**
 * Build script for common CSS file
 * Generates a single styles.css with all Tailwind styles for the entire app
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "./logger";

const logger = new Logger("StylesBuilder");
const projectRoot = process.cwd();
const distDir = path.join(projectRoot, "dist");
const stylesDir = path.join(distDir, "styles");
const srcAssetsDir = path.join(projectRoot, "src/assets");
const outputCssPath = path.join(stylesDir, "styles.css");

async function main(): Promise<void> {
  logger.log("Building styles...");

  try {
    // Ensure styles directory exists
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir, { recursive: true });
    }

    // Compile Tailwind CSS
    logger.log("Compiling Tailwind CSS...");
    execSync(
      `NODE_ENV=production postcss ${path.join(srcAssetsDir, "styles.css")} -o ${outputCssPath}`,
      {
        stdio: "inherit",
      },
    );

    logger.log("Styles build complete!");
  } catch (error: any) {
    logger.error(`CSS generation failed: ${error.message}`);
    process.exit(1);
  }
}

main();
