#!/usr/bin/env bun

import { Command } from "commander";
import { createCommand } from "./commands/create";
import { doctorCommand } from "./commands/doctor";
import { devCommand } from "./commands/dev";
import { buildCommand } from "./commands/build";
import { startCommand } from "./commands/start";

// Read version from package.json using Bun
const packageJson = await Bun.file(`${import.meta.dir}/../package.json`).json();

const program = new Command();

program
  .name("harpy")
  .description(
    "Harpy CLI - Create and manage Harpy projects with React/JSX support",
  )
  .version(packageJson.version);

program
  .command("create")
  .description("Create a new Harpy project with React/JSX support")
  .argument("<project-name>", "Name of the project")
  .option("--include-i18n", "Include i18n support in the generated project")
  .option("--skip-git", "Skip git repository initialization")
  .option("--skip-install", "Skip dependency installation")
  .option(
    "--no-examples",
    "Do not include example pages in the generated project",
  )
  .action(createCommand);

program
  .command("dev")
  .description("Start the development server with hot reload")
  .option("-p, --port <port>", "Port to run the server on", "3000")
  .option("-h, --host <host>", "Host to bind the server to", "0.0.0.0")
  .action(devCommand);

program
  .command("build")
  .description("Build the application for production")
  .option("-t, --target <target>", "Deployment target (bun, vercel, cloudflare, aws)", "bun")
  .option("--no-minify", "Disable minification")
  .action(buildCommand);

program
  .command("start")
  .description("Start the production server")
  .option("-p, --port <port>", "Port to run the server on", "3000")
  .option("-h, --host <host>", "Host to bind the server to", "0.0.0.0")
  .action(startCommand);

program
  .command("doctor")
  .description("Check system requirements and diagnose common issues")
  .option("-v, --verbose", "Show detailed diagnostic information")
  .action(doctorCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
