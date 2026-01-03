import chalk from "chalk";

/**
 * Result of Bun installation check
 */
export interface BunCheckResult {
  installed: boolean;
  version?: string;
  error?: string;
}

/**
 * Check if Bun is installed on the system
 */
export async function checkBunInstallation(): Promise<BunCheckResult> {
  try {
    const result = await Bun.$`bun --version`.quiet();
    return {
      installed: true,
      version: result.text().trim(),
    };
  } catch (error: any) {
    return {
      installed: false,
      error: error.message || "Bun command failed",
    };
  }
}

/**
 * Display Bun requirement message and exit if not installed
 */
export async function requireBun(): Promise<void> {
  const check = await checkBunInstallation();

  if (!check.installed) {
    console.log("");
    console.log(chalk.red("╔═══════════════════════════════════════════════════════════════════════╗"));
    console.log(chalk.red("║") + chalk.bold.red("                        Bun is Required                              ") + chalk.red("║"));
    console.log(chalk.red("╠═══════════════════════════════════════════════════════════════════════╣"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("║") + "  Harpy.js requires " + chalk.cyan("Bun") + " as its runtime environment.                  " + chalk.red("║"));
    console.log(chalk.red("║") + "  Bun is a fast JavaScript runtime, bundler, and package manager.     " + chalk.red("║"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("║") + "  " + chalk.bold("To install Bun, run one of the following commands:") + "              " + chalk.red("║"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("║") + "  " + chalk.yellow("macOS / Linux:") + "                                                    " + chalk.red("║"));
    console.log(chalk.red("║") + "    " + chalk.cyan("curl -fsSL https://bun.sh/install | bash") + "                        " + chalk.red("║"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("║") + "  " + chalk.yellow("Windows (WSL recommended):") + "                                        " + chalk.red("║"));
    console.log(chalk.red("║") + "    " + chalk.cyan("powershell -c \"irm bun.sh/install.ps1 | iex\"") + "                    " + chalk.red("║"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("║") + "  " + chalk.yellow("Homebrew (macOS):") + "                                                 " + chalk.red("║"));
    console.log(chalk.red("║") + "    " + chalk.cyan("brew install oven-sh/bun/bun") + "                                      " + chalk.red("║"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("║") + "  For more info, visit: " + chalk.underline("https://bun.sh") + "                               " + chalk.red("║"));
    console.log(chalk.red("║") + "                                                                       " + chalk.red("║"));
    console.log(chalk.red("╚═══════════════════════════════════════════════════════════════════════╝"));
    console.log("");
    process.exit(1);
  }

  // Bun is installed, show version
  console.log(chalk.green("✓") + ` Bun ${chalk.cyan(check.version)} detected`);
}
