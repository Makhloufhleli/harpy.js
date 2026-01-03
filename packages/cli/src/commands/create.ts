import chalk from "chalk";
import prompts from "prompts";
import { requireBun } from "../utils/bun-check";
import { createBunProject } from "./create-bun";

/**
 * Check if a path exists using Bun API
 */
async function pathExists(filePath: string): Promise<boolean> {
  const file = Bun.file(filePath);
  return file.exists();
}

interface CreateOptions {
  includeI18n?: boolean;
  examples?: boolean;
  skipInstall?: boolean;
  skipGit?: boolean;
}

export async function createCommand(
  projectName: string,
  options: CreateOptions,
) {
  try {
    console.log("");
    // ASCII art logo with gradient colors (orange to red)
    console.log(chalk.hex("#f59e0b")("    __  __                           "));
    console.log(chalk.hex("#f97316")("   / / / /___ __________  __  __     "));
    console.log(chalk.hex("#fb923c")("  / /_/ / __ `/ ___/ __ \\/ / / /     "));
    console.log(chalk.hex("#f97316")(" / __  / /_/ / /  / /_/ / /_/ /      "));
    console.log(chalk.hex("#ef4444")("/_/ /_/\\__,_/_/  / .___/\\__, /       "));
    console.log(chalk.hex("#dc2626")("                /_/    /____/        ") + chalk.gray(" CLI"));
    console.log("");

    // Check if Bun is installed - required for Harpy.js
    await requireBun();
    console.log("");

    const projectPath = `${process.cwd()}/${projectName}`;

    // Check if directory exists
    if (await pathExists(projectPath)) {
      console.error(chalk.red(`\n✖ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    console.log(chalk.cyan("Creating Harpy.js project with Bun..."));
    console.log("");

    // Ask about i18n if not specified
    let includeI18n = Boolean(options.includeI18n);
    if (options.includeI18n === undefined) {
      const i18nResponse = await prompts({
        type: "confirm",
        name: "includeI18n",
        message: "Would you like to include internationalization (i18n)?",
        initial: true,
      });
      includeI18n = Boolean(i18nResponse.includeI18n);
    }

    await createBunProject(projectName, projectPath, {
      packageManager: "bun",
      includeI18n,
      examples: options.examples !== false,
      skipInstall: options.skipInstall,
      skipGit: options.skipGit,
    });

    // Success message
    console.log("");
    console.log(chalk.green("✔ Project created successfully!"));
    console.log("");
    console.log("Get started with the following commands:");
    console.log("");
    console.log(chalk.cyan(`$ cd ${projectName}`));
    console.log(chalk.cyan(`$ bun dev`));
    console.log("");
    console.log(
      `Your app will be available at ${chalk.green("http://localhost:3000")}`,
    );
    console.log("");
  } catch (error: any) {
    console.log("");
    console.error(chalk.red("✖ Failed to create project"));
    console.error(chalk.red(`✖ Error: ${error.message}`));
    console.log("");
    process.exit(1);
  }
}
