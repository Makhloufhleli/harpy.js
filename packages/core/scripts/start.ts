#!/usr/bin/env node

import { spawn } from "child_process";
import { Logger } from "./logger";

const logger = new Logger("Server");

function startServer(): void {
  logger.log("Starting production server...");

  const serverProcess = spawn("node", ["dist/main.js"], {
    stdio: "inherit",
    shell: false,
    cwd: process.cwd(),
  });

  serverProcess.on("error", (error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });

  serverProcess.on("exit", (code) => {
    if (code !== 0) {
      logger.error(`Server exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  // Handle termination signals
  process.on("SIGINT", () => {
    logger.log("Shutting down server...");
    serverProcess.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    logger.log("Shutting down server...");
    serverProcess.kill("SIGTERM");
  });
}

startServer();
