#!/usr/bin/env node
/**
 * Analyze page components to determine which styles are used
 * This helps identify page-specific vs common styles
 */

import * as fs from "fs";
import * as path from "path";

const SRC_DIR = path.join(__dirname, "../src");
const FEATURES_DIR = path.join(SRC_DIR, "features");

interface PageInfo {
  name: string;
  viewFiles: string[];
  classes: Set<string>;
}

// Extract Tailwind classes from file content
function extractClasses(content: string): Set<string> {
  const classes = new Set<string>();
  // Match className="..." and class="..."
  const classMatches = content.match(/(?:className|class)="([^"]*)"/g) || [];

  classMatches.forEach((match) => {
    const classContent = match
      .replace(/(?:className|class)="/, "")
      .replace(/"$/, "");
    const tokens = classContent.split(/\s+/);
    tokens.forEach((token) => {
      if (token.trim()) classes.add(token);
    });
  });

  return classes;
}

// Find all pages and their view files
function analyzePages(): PageInfo[] {
  const pages: PageInfo[] = [];

  if (!fs.existsSync(FEATURES_DIR)) return pages;

  const featureDirs = fs
    .readdirSync(FEATURES_DIR)
    .filter((f) => fs.statSync(path.join(FEATURES_DIR, f)).isDirectory());

  featureDirs.forEach((featureName) => {
    const viewsDir = path.join(FEATURES_DIR, featureName, "views");
    if (fs.existsSync(viewsDir)) {
      const viewFiles = fs
        .readdirSync(viewsDir)
        .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
        .map((f) => path.join(viewsDir, f));

      const classes = new Set<string>();
      viewFiles.forEach((file) => {
        const content = fs.readFileSync(file, "utf-8");
        const fileClasses = extractClasses(content);
        fileClasses.forEach((c) => classes.add(c));
      });

      pages.push({
        name: featureName,
        viewFiles,
        classes,
      });
    }
  });

  return pages;
}

// Also extract classes from layout
function getLayoutClasses(): Set<string> {
  const layoutFile = path.join(SRC_DIR, "core/views/layout.tsx");
  if (fs.existsSync(layoutFile)) {
    const content = fs.readFileSync(layoutFile, "utf-8");
    return extractClasses(content);
  }
  return new Set();
}

function main() {
  const pages = analyzePages();
  const layoutClasses = getLayoutClasses();

  console.log("📊 Page Style Analysis:\n");

  pages.forEach((page) => {
    console.log(`${page.name}: ${page.classes.size} classes`);
    console.log(
      `  Files: ${page.viewFiles.map((f) => path.basename(f)).join(", ")}`,
    );
  });

  console.log(`\nlayout: ${layoutClasses.size} classes`);
  console.log("\nCommon classes (used across multiple pages):");

  const commonClasses = new Set<string>();
  const classUsage = new Map<string, number>();

  // Count usage across all pages and layout
  layoutClasses.forEach((c) => classUsage.set(c, (classUsage.get(c) || 0) + 1));
  pages.forEach((page) => {
    page.classes.forEach((c) => {
      classUsage.set(c, (classUsage.get(c) || 0) + 1);
    });
  });

  classUsage.forEach((count, className) => {
    if (count > 1) {
      commonClasses.add(className);
    }
  });

  console.log(`Total common: ${commonClasses.size}`);
  console.log(
    "Sample common classes:",
    Array.from(commonClasses).slice(0, 10).join(", "),
  );
}

main();
