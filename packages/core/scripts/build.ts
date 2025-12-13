#!/usr/bin/env node

import { spawn } from "child_process";
import { Logger } from "./logger";

const logger = new Logger("Builder");

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

async function buildNestApp(): Promise<void> {
  logger.log("Building NestJS application...");
  try {
    await runCommand("nest", ["build"]);
  } catch (error) {
    logger.error(`NestJS build failed: ${error}`);
    throw error;
  }
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
    throw error;
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
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    logger.log("Starting production build...");

    await buildNestApp();
    await buildHydration();
    await autoWrap();
    await buildStyles();

    logger.log("Production build complete!");
    process.exit(0);
  } catch (error) {
    logger.error(`Build failed: ${error}`);
    process.exit(1);
  }
}

main();
