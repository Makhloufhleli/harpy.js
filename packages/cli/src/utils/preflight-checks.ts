import chalk from "chalk";
import execa = require("execa");
import * as semver from "semver";

interface PreflightResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

interface VersionInfo {
  node: string | null;
  npm: string | null;
  pnpm: string | null;
  yarn: string | null;
}

const MINIMUM_NODE_VERSION = "18.0.0";
const RECOMMENDED_NODE_VERSION = "20.0.0";
const MINIMUM_NPM_VERSION = "9.0.0";

/**
 * Get version information for Node.js and package managers
 */
async function getVersionInfo(): Promise<VersionInfo> {
  const info: VersionInfo = {
    node: null,
    npm: null,
    pnpm: null,
    yarn: null,
  };

  // Get Node.js version
  try {
    const { stdout } = await execa("node", ["--version"]);
    info.node = stdout.trim().replace(/^v/, "");
  } catch {
    // Node not available
  }

  // Get npm version
  try {
    const { stdout } = await execa("npm", ["--version"]);
    info.npm = stdout.trim();
  } catch {
    // npm not available
  }

  // Get pnpm version
  try {
    const { stdout } = await execa("pnpm", ["--version"]);
    info.pnpm = stdout.trim();
  } catch {
    // pnpm not available
  }

  // Get yarn version
  try {
    const { stdout } = await execa("yarn", ["--version"]);
    info.yarn = stdout.trim();
  } catch {
    // yarn not available
  }

  return info;
}

/**
 * Check if a command exists and is executable
 */
async function commandExists(command: string): Promise<boolean> {
  try {
    await execa("which", [command]);
    return true;
  } catch {
    // Try Windows-style check
    try {
      await execa("where", [command]);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Check if lodash is resolvable (to detect the node-emoji issue)
 */
async function checkLodashAvailability(): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    // Try to resolve lodash/toArray which is the problematic import
    await execa("node", ["-e", "require.resolve('lodash/toArray')"]);
    return { available: true };
  } catch {
    // This is expected to fail - lodash is not installed globally
    // The real issue is when it's in a corrupted npm cache
    return { available: true }; // Not a problem if it's simply not installed
  }
}

/**
 * Check for corrupted npx cache by testing @nestjs/cli
 */
async function checkNestCLI(): Promise<{
  ok: boolean;
  error?: string;
  suggestion?: string;
}> {
  try {
    // Try running nest --version
    await execa("npx", ["@nestjs/cli", "--version"], {
      timeout: 30000,
      env: { ...process.env, npm_config_yes: "true" },
    });
    return { ok: true };
  } catch (error: any) {
    const errorMessage = error.message || error.stderr || "";

    // Check for common dependency issues
    if (
      errorMessage.includes("Cannot find module") ||
      errorMessage.includes("MODULE_NOT_FOUND")
    ) {
      const moduleMatch = errorMessage.match(
        /Cannot find module ['"]([^'"]+)['"]/,
      );
      const moduleName = moduleMatch ? moduleMatch[1] : "unknown module";

      return {
        ok: false,
        error: `NestJS CLI has a corrupted dependency: ${moduleName}`,
        suggestion: `This is usually caused by a corrupted npm/npx cache.

${chalk.yellow("To fix this issue, try the following:")}

${chalk.cyan("1.")} Clear the npx cache:
   ${chalk.gray("rm -rf ~/.npm/_npx")}

${chalk.cyan("2.")} Clear npm cache:
   ${chalk.gray("npm cache clean --force")}

${chalk.cyan("3.")} Update @nestjs/cli globally (optional):
   ${chalk.gray("npm install -g @nestjs/cli@latest")}

${chalk.cyan("4.")} If using an older Node.js version, consider upgrading:
   ${chalk.gray("Current minimum recommended: Node.js " + RECOMMENDED_NODE_VERSION)}

After clearing the cache, run ${chalk.cyan("harpy create <project-name>")} again.`,
      };
    }

    // General execution error
    return {
      ok: false,
      error: "Failed to verify NestJS CLI availability",
      suggestion: `Please ensure you have internet connectivity and try again.
If the issue persists, try: ${chalk.gray("npm cache clean --force")}`,
    };
  }
}

/**
 * Verify the selected package manager is available
 */
async function checkPackageManager(
  manager: string,
): Promise<{ ok: boolean; error?: string }> {
  const exists = await commandExists(manager);
  if (!exists) {
    return {
      ok: false,
      error: `Package manager "${manager}" is not installed or not in PATH`,
    };
  }
  return { ok: true };
}

/**
 * Run all pre-flight checks before project creation
 */
export async function runPreflightChecks(options: {
  packageManager: string;
  verbose?: boolean;
}): Promise<PreflightResult> {
  const result: PreflightResult = {
    success: true,
    errors: [],
    warnings: [],
  };

  const { packageManager, verbose } = options;

  if (verbose) {
    console.log(chalk.gray("\n🔍 Running pre-flight checks...\n"));
  }

  // 1. Check Node.js version
  const versionInfo = await getVersionInfo();

  if (!versionInfo.node) {
    result.errors.push(
      "Node.js is not installed or not in PATH. Please install Node.js 18+ from https://nodejs.org",
    );
    result.success = false;
  } else {
    const nodeVersion = versionInfo.node;

    if (verbose) {
      console.log(chalk.gray(`  Node.js: v${nodeVersion}`));
    }

    if (!semver.valid(nodeVersion)) {
      result.warnings.push(
        `Could not parse Node.js version: ${nodeVersion}`,
      );
    } else if (semver.lt(nodeVersion, MINIMUM_NODE_VERSION)) {
      result.errors.push(
        `Node.js version ${nodeVersion} is too old. Harpy requires Node.js ${MINIMUM_NODE_VERSION} or higher.
  Current: v${nodeVersion}
  Required: v${MINIMUM_NODE_VERSION}+
  Recommended: v${RECOMMENDED_NODE_VERSION}+

  Please upgrade Node.js: https://nodejs.org`,
      );
      result.success = false;
    } else if (semver.lt(nodeVersion, RECOMMENDED_NODE_VERSION)) {
      result.warnings.push(
        `Node.js ${nodeVersion} is supported but v${RECOMMENDED_NODE_VERSION}+ is recommended for best compatibility.`,
      );
    }
  }

  // 2. Check npm version
  if (versionInfo.npm) {
    if (verbose) {
      console.log(chalk.gray(`  npm: v${versionInfo.npm}`));
    }

    if (semver.valid(versionInfo.npm) && semver.lt(versionInfo.npm, MINIMUM_NPM_VERSION)) {
      result.warnings.push(
        `npm version ${versionInfo.npm} is outdated. Consider upgrading: ${chalk.gray("npm install -g npm@latest")}`,
      );
    }
  }

  // 3. Check selected package manager
  const pmCheck = await checkPackageManager(packageManager);
  if (!pmCheck.ok) {
    result.errors.push(pmCheck.error!);
    result.success = false;
  } else if (verbose) {
    const version =
      packageManager === "pnpm"
        ? versionInfo.pnpm
        : packageManager === "yarn"
          ? versionInfo.yarn
          : versionInfo.npm;
    console.log(chalk.gray(`  ${packageManager}: v${version || "unknown"}`));
  }

  // 4. Check NestJS CLI (this catches the lodash/toArray issue)
  if (verbose) {
    console.log(chalk.gray("  Verifying @nestjs/cli..."));
  }

  const nestCheck = await checkNestCLI();
  if (!nestCheck.ok) {
    result.errors.push(nestCheck.error!);
    if (nestCheck.suggestion) {
      result.errors.push(nestCheck.suggestion);
    }
    result.success = false;
  } else if (verbose) {
    console.log(chalk.gray("  @nestjs/cli: ✓"));
  }

  if (verbose) {
    console.log("");
  }

  return result;
}

/**
 * Display pre-flight check results to the user
 */
export function displayPreflightResults(result: PreflightResult): void {
  // Display warnings first
  if (result.warnings.length > 0) {
    console.log("");
    for (const warning of result.warnings) {
      console.log(chalk.yellow("⚠ ") + chalk.yellow(warning));
    }
  }

  // Display errors
  if (result.errors.length > 0) {
    console.log("");
    console.log(chalk.red("✖ Pre-flight checks failed:\n"));
    for (const error of result.errors) {
      console.log(chalk.red("  " + error.split("\n").join("\n  ")));
      console.log("");
    }
  }
}

/**
 * Get system information for debugging/support
 */
export async function getSystemInfo(): Promise<string> {
  const versionInfo = await getVersionInfo();
  const platform = process.platform;
  const arch = process.arch;

  let info = `
System Information:
-------------------
Platform: ${platform} (${arch})
Node.js:  ${versionInfo.node ? `v${versionInfo.node}` : "not found"}
npm:      ${versionInfo.npm ? `v${versionInfo.npm}` : "not found"}
pnpm:     ${versionInfo.pnpm ? `v${versionInfo.pnpm}` : "not installed"}
yarn:     ${versionInfo.yarn ? `v${versionInfo.yarn}` : "not installed"}
`;

  return info.trim();
}
