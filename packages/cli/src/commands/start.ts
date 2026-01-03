import chalk from "chalk";
import * as path from "path";
import { spawn } from "child_process";

interface StartOptions {
  port?: number;
  host?: string;
}

const SERVER_MAIN = ".harpy/server/main.js";

/**
 * Start the Harpy production server
 */
export async function startCommand(options: StartOptions = {}) {
  const cwd = process.cwd();
  
  // Check if we're in a Harpy project
  const packageJsonPath = path.join(cwd, "package.json");
  const packageJsonFile = Bun.file(packageJsonPath);
  
  if (!(await packageJsonFile.exists())) {
    console.error(chalk.red("✖ No package.json found. Are you in a Harpy project?"));
    process.exit(1);
  }

  const packageJson = await packageJsonFile.json();
  if (!packageJson.dependencies?.["@harpy-js/core"]) {
    console.error(chalk.red("✖ This doesn't appear to be a Harpy project."));
    process.exit(1);
  }

  // Check if .harpy/server exists (new structure)
  const newMainPath = path.join(cwd, SERVER_MAIN);
  const newMainFile = Bun.file(newMainPath);
  // Fallback to old dist structure
  const oldMainPath = path.join(cwd, "dist/main.js");
  const oldMainFile = Bun.file(oldMainPath);
  
  let mainPath: string;
  if (await newMainFile.exists()) {
    mainPath = SERVER_MAIN;
  } else if (await oldMainFile.exists()) {
    mainPath = "dist/main.js";
  } else {
    console.error(chalk.red("✖ No production build found. Run 'harpy build' first."));
    process.exit(1);
  }

  console.log("");
  console.log(chalk.hex("#f97316")("🦅 Harpy.js") + chalk.gray(" Production Server"));
  console.log("");

  // Set environment variables
  const env: Record<string, string | undefined> = {
    ...process.env,
    NODE_ENV: "production",
    HARPY_STATIC_DIR: path.join(cwd, ".harpy/static"),
    HARPY_PUBLIC_DIR: path.join(cwd, ".harpy/public"),
  };

  if (options.port) {
    env.PORT = String(options.port);
  }

  if (options.host) {
    env.HOST = options.host;
  }

  // Run the production build
  const bunProcess = spawn("bun", ["run", mainPath], {
    cwd,
    stdio: "inherit",
    env,
  });

  bunProcess.on("error", (error) => {
    console.error(chalk.red("✖ Failed to start production server:"), error.message);
    process.exit(1);
  });

  bunProcess.on("close", (code) => {
    process.exit(code || 0);
  });

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    bunProcess.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    bunProcess.kill("SIGTERM");
  });
}
