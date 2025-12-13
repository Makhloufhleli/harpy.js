#!/usr/bin/env node

import { spawn } from "child_process";
import * as fs from "fs";
import * as http from "http";
import { Logger } from "./logger";

const logger = new Logger("DevServer");

let nestProcess: any = null;
let isRebuilding = false;

/**
 * Trigger browser reload by sending notification to LiveReloadController
 */
function triggerBrowserReload(): void {
  const options = {
    hostname: "127.0.0.1",
    port: 3000,
    path: "/__harpy/live-reload/trigger",
    method: "POST",
  };

  const req = http.request(options, () => {
    // Silently succeed
  });

  req.on("error", () => {
    // Silently fail - server might not be ready yet
  });

  req.end();
}

async function runCommand(cmd: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit", shell: true });
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function buildHydration(): Promise<void> {
  logger.log("Building hydration components...");
  try {
    const tsxPath = require("child_process")
      .execSync("which tsx", { encoding: "utf-8" })
      .trim();
    await runCommand(tsxPath, [
      require("path").join(__dirname, "build-hydration.ts"),
    ]);
  } catch (error) {
    logger.error(`Hydration build failed: ${error}`);
    throw error;
  }
}

async function autoWrap(): Promise<void> {
  logger.log("Auto-wrapping client components...");
  try {
    const tsxPath = require("child_process")
      .execSync("which tsx", { encoding: "utf-8" })
      .trim();
    await runCommand(tsxPath, [
      require("path").join(__dirname, "auto-wrap-exports.ts"),
    ]);
  } catch (error) {
    logger.error(`Auto-wrap failed: ${error}`);
  }
}

async function buildStyles(): Promise<void> {
  logger.log("Building styles...");
  try {
    const tsxPath = require("child_process")
      .execSync("which tsx", { encoding: "utf-8" })
      .trim();
    await runCommand(tsxPath, [
      require("path").join(__dirname, "build-page-styles.ts"),
    ]);
  } catch (error) {
    logger.error(`Styles build failed: ${error}`);
  }
}

async function startNestServer(): Promise<void> {
  return new Promise((resolve) => {
    logger.log("Starting NestJS application...");
    // Run compiled dist/main.js instead of using ts-node
    nestProcess = spawn("node", ["--watch", "dist/main.js"], {
      stdio: "pipe",
      shell: false,
      cwd: process.cwd(),
    });

    let resolved = false;
    let isFirstStart = true;

    // Capture output to detect when server is ready
    nestProcess.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      process.stdout.write(output);

      // Detect when NestJS application successfully started
      if (output.includes("Nest application successfully started")) {
        if (!resolved && isFirstStart) {
          // First start - resolve the promise
          resolved = true;
          isFirstStart = false;
          resolve();
        } else if (!isFirstStart && !isRebuilding) {
          // Subsequent restarts - rebuild assets
          setTimeout(async () => {
            if (isRebuilding) return;
            isRebuilding = true;
            logger.log("Rebuilding assets after code change...");
            try {
              await buildHydration();
              await autoWrap();
              await buildStyles();
              triggerBrowserReload();
            } catch (error) {
              logger.error(`Asset rebuild failed: ${error}`);
            } finally {
              isRebuilding = false;
            }
          }, 100);
        }
      }
    });

    nestProcess.stderr?.on("data", (data: Buffer) => {
      process.stderr.write(data);
    });

    // Fallback timeout in case the detection fails
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        isFirstStart = false;
        resolve();
      }
    }, 8000);
  });
}

function watchSourceChanges(): void {
  logger.log("Watching source files for changes...");

  let debounceTimer: NodeJS.Timeout | null = null;

  // Watch src for CSS changes only (TS/TSX changes are handled by NestJS watch + stdout detection)
  fs.watch("src", { recursive: true }, async (eventType, filename) => {
    if (!filename || isRebuilding) return;

    // Ignore .hydration-entries changes
    if (filename.includes(".hydration-entries")) {
      return;
    }

    // Only watch CSS files (TS/TSX changes trigger nest rebuild which we catch above)
    if (!filename.endsWith(".css")) return;

    // Skip if we just rebuilt for this file (avoid duplicate rebuilds)
    if (watchedFiles.has(filename)) {
      return;
    }

    watchedFiles.add(filename);

    // Debounce: wait 1000ms after last change before rebuilding
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      isRebuilding = true;
      logger.log(`CSS file changed: ${filename}`);

      try {
        await buildStyles();
        triggerBrowserReload();
      } catch (error) {
        logger.error(`Style rebuild failed: ${error}`);
      } finally {
        watchedFiles.delete(filename);
        isRebuilding = false;
      }
    }, 1000);
  });
}

let tscProcess: any = null;

async function startTypeScriptWatch(): Promise<void> {
  return new Promise((resolve) => {
    logger.log("Starting TypeScript compiler in watch mode...");
    tscProcess = spawn("pnpm", ["nest", "build", "--watch"], {
      stdio: "pipe",
      shell: true,
    });

    let resolved = false;

    tscProcess.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      process.stdout.write(output);

      // Resolve once first compilation is done
      if (output.includes("Found 0 errors. Watching") && !resolved) {
        resolved = true;
        resolve();
      }
    });

    tscProcess.stderr?.on("data", (data: Buffer) => {
      process.stderr.write(data);
    });
  });
}

async function main(): Promise<void> {
  try {
    logger.log("Initializing development environment...");

    // First: Start TypeScript compiler in watch mode
    await startTypeScriptWatch();

    // Build initial assets after first compilation
    logger.log("Building initial assets...");
    await buildHydration();
    await autoWrap();
    await buildStyles();

    // Now start the node server with compiled dist files
    await startNestServer();

    logger.log("Development server ready!");

    // Watch for source changes
    watchSourceChanges();

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      logger.log("Stopping development server...");
      if (tscProcess) tscProcess.kill();
      if (nestProcess) nestProcess.kill();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.log("Stopping development server...");
      if (tscProcess) tscProcess.kill();
      if (nestProcess) nestProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

main();
