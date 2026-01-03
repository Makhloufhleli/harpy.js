import chalk from "chalk";
import * as path from "path";
import { spawn } from "child_process";
import { watch } from "chokidar";

interface DevOptions {
  port?: number;
  host?: string;
}

const HARPY_DIR = ".harpy";
const STATIC_DIR = ".harpy/static";

/**
 * Run the Harpy development server with hot reload
 */
export async function devCommand(options: DevOptions = {}) {
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

  console.log("");
  console.log(chalk.hex("#f97316")("🦅 Harpy.js") + chalk.gray(" Development Server"));
  console.log("");

  const totalStartTime = Date.now();

  // Ensure .harpy directory structure exists
  const harpyDir = path.join(cwd, HARPY_DIR);
  const staticDir = path.join(cwd, STATIC_DIR);
  await Bun.$`mkdir -p ${staticDir}`.quiet();

  // Add .harpy to .gitignore if not already there
  await ensureGitignore(cwd);

  // Step 1: Build CSS to .harpy/static
  const globalCssPath = path.join(cwd, "src/assets/global.css");
  const globalCssFile = Bun.file(globalCssPath);
  
  if (await globalCssFile.exists()) {
    await buildCss(cwd, globalCssPath, staticDir);
    
    // Watch for CSS changes
    watchCss(cwd, globalCssPath, staticDir);
  }

  // Step 2: Build hydration chunks for client components
  await buildHydration(cwd);
  
  // Watch for component changes
  watchComponents(cwd);

  // Step 3: Start the dev server with watch mode
  const prepDuration = Date.now() - totalStartTime;
  console.log("");
  console.log(chalk.cyan("🚀") + ` Starting server... ${chalk.gray(`(prepared in ${prepDuration}ms)`)}`);
  console.log("");

  const mainPath = path.join(cwd, "src/main.ts");
  const mainFile = Bun.file(mainPath);
  
  if (!(await mainFile.exists())) {
    console.error(chalk.red("✖ No src/main.ts found."));
    process.exit(1);
  }

  // Set environment variables
  const env: Record<string, string | undefined> = {
    ...process.env,
    NODE_ENV: "development",
    HARPY_STATIC_DIR: staticDir,
  };

  if (options.port) {
    env.PORT = String(options.port);
  }

  if (options.host) {
    env.HOST = options.host;
  }

  // Run bun with watch mode
  const bunProcess = spawn("bun", ["--watch", "run", "src/main.ts"], {
    cwd,
    stdio: "inherit",
    env,
  });

  bunProcess.on("error", (error) => {
    console.error(chalk.red("✖ Failed to start dev server:"), error.message);
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

/**
 * Build CSS with Tailwind
 */
async function buildCss(cwd: string, inputPath: string, outputDir: string): Promise<void> {
  const cssStartTime = Date.now();
  console.log(chalk.cyan("⚡") + " Building Tailwind CSS...");
  
  const outputPath = path.join(outputDir, "styles.css");
  
  try {
    await Bun.$`bunx @tailwindcss/cli -i ${inputPath} -o ${outputPath} --minify`.quiet().cwd(cwd);
    const cssDuration = Date.now() - cssStartTime;
    console.log(chalk.green("✓") + ` CSS built in ${chalk.cyan(cssDuration + "ms")} → ${chalk.gray(STATIC_DIR + "/styles.css")}`);
  } catch (error) {
    console.log(chalk.yellow("⚠") + " CSS build failed, continuing without styles...");
  }
}

/**
 * Watch CSS files for changes
 */
function watchCss(cwd: string, inputPath: string, outputDir: string): void {
  const srcAssetsDir = path.join(cwd, "src/assets");
  const srcDir = path.join(cwd, "src");
  
  // Watch for CSS and TSX/JSX file changes (Tailwind needs to scan them)
  const watcher = watch([
    path.join(srcAssetsDir, "**/*.css"),
    path.join(srcDir, "**/*.tsx"),
    path.join(srcDir, "**/*.jsx"),
  ], {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  });

  let rebuildTimeout: NodeJS.Timeout | null = null;

  const rebuildCss = () => {
    if (rebuildTimeout) {
      clearTimeout(rebuildTimeout);
    }
    rebuildTimeout = setTimeout(async () => {
      const cssStartTime = Date.now();
      const outputPath = path.join(outputDir, "styles.css");
      
      try {
        await Bun.$`bunx @tailwindcss/cli -i ${inputPath} -o ${outputPath} --minify`.quiet().cwd(cwd);
        const cssDuration = Date.now() - cssStartTime;
        console.log(chalk.green("✓") + ` CSS rebuilt in ${chalk.cyan(cssDuration + "ms")}`);
      } catch {
        // Silently ignore CSS rebuild errors in watch mode
      }
    }, 100);
  };

  watcher.on("change", rebuildCss);
  watcher.on("add", rebuildCss);
}

/**
 * Build hydration chunks for client components
 */
async function buildHydration(cwd: string): Promise<void> {
  const hydrationStartTime = Date.now();
  console.log(chalk.cyan("⚡") + " Building hydration chunks...");
  
  try {
    const hydrationScript = path.join(cwd, "node_modules/@harpy-js/core/scripts/build-hydration.ts");
    await Bun.$`bun ${hydrationScript}`.quiet().cwd(cwd);
    
    const hydrationDuration = Date.now() - hydrationStartTime;
    console.log(chalk.green("✓") + ` Hydration chunks built in ${chalk.cyan(hydrationDuration + "ms")}`);
  } catch (error) {
    console.log(chalk.yellow("⚠") + " No client components found or hydration build failed");
  }
}

/**
 * Watch for component changes and rebuild hydration chunks
 */
function watchComponents(cwd: string): void {
  const watcher = watch(path.join(cwd, "src/**/*.{ts,tsx}"), {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });

  let rebuildTimeout: Timer | null = null;
  
  const rebuildHydration = () => {
    if (rebuildTimeout) clearTimeout(rebuildTimeout);
    rebuildTimeout = setTimeout(async () => {
      try {
        const hydrationScript = path.join(cwd, "node_modules/@harpy-js/core/scripts/build-hydration.ts");
        await Bun.$`bun ${hydrationScript}`.quiet().cwd(cwd);
        console.log(chalk.green("✓") + " Hydration chunks rebuilt");
      } catch {
        // Silently ignore hydration rebuild errors in watch mode
      }
    }, 100);
  };

  watcher.on("change", rebuildHydration);
  watcher.on("add", rebuildHydration);
}

/**
 * Ensure .harpy is in .gitignore
 */
async function ensureGitignore(cwd: string): Promise<void> {
  const gitignorePath = path.join(cwd, ".gitignore");
  const gitignoreFile = Bun.file(gitignorePath);
  
  try {
    if (await gitignoreFile.exists()) {
      const content = await gitignoreFile.text();
      if (!content.includes(".harpy")) {
        await Bun.write(gitignorePath, content + "\n# Harpy build output\n.harpy\n");
      }
    } else {
      await Bun.write(gitignorePath, "# Harpy build output\n.harpy\nnode_modules\n");
    }
  } catch {
    // Ignore errors with .gitignore
  }
}
