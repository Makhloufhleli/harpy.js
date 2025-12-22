import chalk from "chalk";
import {
  runPreflightChecks,
  displayPreflightResults,
  getSystemInfo,
} from "../utils/preflight-checks";

interface DoctorOptions {
  verbose?: boolean;
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  console.log("");
  console.log(chalk.hex("#f59e0b")("    __  __                           "));
  console.log(chalk.hex("#f97316")("   / / / /___ __________  __  __     "));
  console.log(chalk.hex("#fb923c")("  / /_/ / __ `/ ___/ __ \\/ / / /     "));
  console.log(chalk.hex("#f97316")(" / __  / /_/ / /  / /_/ / /_/ /      "));
  console.log(chalk.hex("#ef4444")("/_/ /_/\\__,_/_/  / .___/\\__, /       "));
  console.log(
    chalk.hex("#dc2626")("                /_/    /____/        ") +
      chalk.gray(" Doctor"),
  );
  console.log("");

  console.log(chalk.cyan("🔍 Diagnosing your system...\n"));

  // Show system info
  if (options.verbose) {
    const systemInfo = await getSystemInfo();
    console.log(chalk.gray(systemInfo));
    console.log("");
  }

  // Run checks for all package managers
  const packageManagers = ["pnpm", "npm", "yarn"];

  console.log(chalk.bold("Checking system requirements:\n"));

  for (const pm of packageManagers) {
    console.log(chalk.gray(`  Checking with ${pm}...`));
  }

  // Run preflight checks with pnpm (default)
  const result = await runPreflightChecks({
    packageManager: "pnpm",
    verbose: options.verbose,
  });

  if (result.success && result.warnings.length === 0) {
    console.log(chalk.green("\n✔ All checks passed! Your system is ready to use Harpy CLI.\n"));
  } else if (result.success) {
    console.log(chalk.yellow("\n⚠ Checks passed with warnings:\n"));
    displayPreflightResults(result);
  } else {
    displayPreflightResults(result);
  }

  // Provide additional helpful info
  console.log(chalk.bold("\nUseful commands:"));
  console.log("");
  console.log(
    chalk.gray("  Clear npx cache:     ") + chalk.cyan("rm -rf ~/.npm/_npx"),
  );
  console.log(
    chalk.gray("  Clear npm cache:     ") + chalk.cyan("npm cache clean --force"),
  );
  console.log(
    chalk.gray("  Update npm:          ") + chalk.cyan("npm install -g npm@latest"),
  );
  console.log(
    chalk.gray("  Update NestJS CLI:   ") +
      chalk.cyan("npm install -g @nestjs/cli@latest"),
  );
  console.log("");

  // Show system info in non-verbose mode with hint
  if (!options.verbose) {
    console.log(
      chalk.gray("Run ") +
        chalk.cyan("harpy doctor --verbose") +
        chalk.gray(" for detailed system information."),
    );
    console.log("");
  }

  process.exit(result.success ? 0 : 1);
}
