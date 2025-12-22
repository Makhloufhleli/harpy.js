import chalk from "chalk";
import * as fs from "fs-extra";
import ora from "ora";
import * as path from "path";
import prompts from "prompts";
import execa = require("execa");
import {
  runPreflightChecks,
  displayPreflightResults,
} from "../utils/preflight-checks";

interface CreateOptions {
  packageManager?: "npm" | "pnpm" | "yarn";
  includeI18n?: boolean;
  examples?: boolean;
  skipInstall?: boolean;
  skipGit?: boolean;
  skipPreflight?: boolean;
}

export async function createCommand(
  projectName: string,
  options: CreateOptions,
) {
  const spinner = ora();

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

    const projectPath = path.resolve(process.cwd(), projectName);

    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      console.error(chalk.red(`\n✖ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    // Detect or ask for package manager
    let packageManager = options.packageManager;
    if (!packageManager) {
      const response = await prompts({
        type: "select",
        name: "packageManager",
        message: "Which package manager would you like to use?",
        choices: [
          { title: "pnpm (recommended)", value: "pnpm" },
          { title: "npm", value: "npm" },
          { title: "yarn", value: "yarn" },
        ],
        initial: 0,
      });
      packageManager = response.packageManager;
    }

    if (!packageManager) {
      console.error(chalk.red("\n✖ Package manager selection cancelled"));
      process.exit(1);
    }

    // Run pre-flight checks before proceeding (unless skipped)
    if (!options.skipPreflight) {
      console.log(chalk.gray("Verifying system requirements..."));
      const preflightResult = await runPreflightChecks({
        packageManager,
        verbose: false,
      });

      if (!preflightResult.success) {
        displayPreflightResults(preflightResult);
        console.log(
          chalk.gray(
            "\nTo skip pre-flight checks, use: " +
              chalk.cyan("harpy create <project-name> --skip-preflight"),
          ),
        );
        console.log(
          chalk.gray(
            "To diagnose issues, run: " + chalk.cyan("harpy doctor --verbose"),
          ),
        );
        console.log("");
        process.exit(1);
      }

      // Display warnings if any (but continue)
      if (preflightResult.warnings.length > 0) {
        displayPreflightResults(preflightResult);
      }
    } else {
      console.log(chalk.yellow("⚠ Skipping pre-flight checks (--skip-preflight)"));
    }

    // Decide whether to include i18n: prefer CLI option, otherwise ask interactively
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

    // Decide whether to include example pages: prefer CLI option, otherwise ask interactively
    let includeExamples = true;
    if (typeof options.examples === "boolean") {
      includeExamples = options.examples;
    } else {
      const examplesResponse = await prompts({
        type: "confirm",
        name: "includeExamples",
        message: "Include example pages and features in the generated project?",
        initial: true,
      });
      includeExamples = Boolean(examplesResponse.includeExamples);
    }

    // Step 1: Create NestJS project (silently)
    console.log(chalk.green("[CREATE]") + " " + projectName);
    await execa(
      "npx",
      [
        "@nestjs/cli",
        "new",
        projectName,
        "--package-manager",
        packageManager,
        "--skip-git",
      ],
      {
        stdio: "pipe",
      },
    );

    // Step 2: Install React and Harpy dependencies
    console.log(chalk.green("[INSTALL]") + " React, Harpy, and other dependencies");
    const installCmd = packageManager === "yarn" ? "add" : "install";
    const baseDeps = [
      "react@^19.0.0",
      "react-dom@^19.0.0",
      "@types/react@^19.0.0",
      "@types/react-dom@^19.0.0",
      "@harpy-js/core@latest",
      "@fastify/static@^8.0.0",
      "@fastify/cookie@^11.0.0",
      "@types/node",
    ];

    if (includeI18n) {
      baseDeps.push("@harpy-js/i18n@latest");
    }

    if (!options.skipInstall) {
      await execa(packageManager, [installCmd, ...baseDeps], {
        cwd: projectPath,
        stdio: "pipe",
      });
    } else {
      console.log(
        chalk.yellow("⚠ Skipping dependency installation (--skip-install)"),
      );
    }

    // Step 3: Install @nestjs/platform-fastify and reflect-metadata
    console.log(
      chalk.green("[INSTALL]") + " @nestjs/platform-fastify and reflect-metadata",
    );
    await execa(
      packageManager,
      [installCmd, "@nestjs/platform-fastify", "reflect-metadata"],
      {
        cwd: projectPath,
        stdio: "pipe",
      },
    );

    // Step 4: Install Tailwind CSS and build tools
    console.log(
      chalk.green("[INSTALL]") + " Tailwind CSS and build tools",
    );
    await execa(
      packageManager,
      [
        installCmd,
        "-D",
        "fastify@^5.2.0",
        "tailwindcss@^4.0.0",
        "postcss@^8.4.0",
        "@tailwindcss/postcss@^4.0.0",
        "postcss-cli@^11.0.0",
        "cssnano@^7.0.0",
        "tsx@^4.0.0",
        "esbuild@^0.24.0",
      ],
      {
        cwd: projectPath,
        stdio: "pipe",
      },
    );

    // Step 5: Copy template files
    console.log(chalk.green("[CREATE]") + " Project structure");
    const templatePath = path.join(__dirname, "../../templates/app");

    // Copy src directory
    fs.copySync(path.join(templatePath, "src"), path.join(projectPath, "src"));

    // Copy config files
    fs.copyFileSync(
      path.join(templatePath, "tailwind.config.js"),
      path.join(projectPath, "tailwind.config.js"),
    );
    fs.copyFileSync(
      path.join(templatePath, "postcss.config.js"),
      path.join(projectPath, "postcss.config.js"),
    );
    fs.copyFileSync(
      path.join(templatePath, "swc-client-component-plugin.js"),
      path.join(projectPath, "swc-client-component-plugin.js"),
    );

    // Replace default NestJS README with Harpy README
    const readmePath = path.join(templatePath, "README.md");
    if (fs.existsSync(readmePath)) {
      fs.copyFileSync(readmePath, path.join(projectPath, "README.md"));
    }

    // Copy I18N_GUIDE.md if exists
    const i18nGuidePath = path.join(templatePath, "I18N_GUIDE.md");
    if (fs.existsSync(i18nGuidePath)) {
      fs.copyFileSync(i18nGuidePath, path.join(projectPath, "I18N_GUIDE.md"));
    }

    // If the user opted out of example pages, replace the features folder
    if (!includeExamples) {
      try {
        const featuresDir = path.join(projectPath, "src", "features");
        if (fs.existsSync(featuresDir)) {
          fs.removeSync(featuresDir);
        }

        const homeDir = path.join(projectPath, "src", "features", "home");
        fs.mkdirpSync(homeDir);

        // home.module.ts
        const homeModule = `import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}`;
        fs.writeFileSync(
          path.join(homeDir, "home.module.ts"),
          homeModule,
          "utf-8",
        );

        // home.service.ts
        const homeService = `import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  getItems() {
    return ['Item A', 'Item B'];
  }
}`;
        fs.writeFileSync(
          path.join(homeDir, "home.service.ts"),
          homeService,
          "utf-8",
        );

        // home.controller.ts
        const homeController = `import { JsxRender } from '@harpy-js/core';
import type { PageProps } from '@harpy-js/core';
import { Controller, Get } from '@nestjs/common';
import HomePage from './views/homepage';
import { HomeService } from './home.service';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @JsxRender(HomePage)
  async homepage(): Promise<PageProps> {
    return { items: this.homeService.getItems() };
  }
}`;
        fs.writeFileSync(
          path.join(homeDir, "home.controller.ts"),
          homeController,
          "utf-8",
        );

        // views/homepage.tsx
        const viewsDir = path.join(homeDir, "views");
        fs.mkdirpSync(viewsDir);
        const homepageView = `import React from 'react';
import type { PageProps } from '@harpy-js/core';

interface HomePageProps extends PageProps {
  items?: string[];
}

export default function HomePage({ items = [] }: HomePageProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <ul>
        {items.map(it => <li key={it}>{it}</li>)}
      </ul>
    </div>
  );
}
`;
        fs.writeFileSync(
          path.join(viewsDir, "homepage.tsx"),
          homepageView,
          "utf-8",
        );
      } catch (err) {
        console.warn(chalk.yellow("⚠ Failed to create minimal home feature."));
      }
    }

    // Remove default NestJS boilerplate files
    const filesToRemove = [
      path.join(projectPath, "src/app.controller.ts"),
      path.join(projectPath, "src/app.service.ts"),
      path.join(projectPath, "src/app.controller.spec.ts"),
    ];

    filesToRemove.forEach((file) => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    // Step 6: Update package.json scripts
    console.log(chalk.green("[UPDATE]") + " package.json");
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = fs.readJsonSync(packageJsonPath);

    // Keep only specific NestJS scripts that don't conflict with Harpy
    const scriptsToKeep = {
      format: packageJson.scripts.format,
      lint: packageJson.scripts.lint,
      test: packageJson.scripts.test,
      "test:watch": packageJson.scripts["test:watch"],
      "test:cov": packageJson.scripts["test:cov"],
      "test:debug": packageJson.scripts["test:debug"],
      "test:e2e": packageJson.scripts["test:e2e"],
    };

    packageJson.scripts = {
      ...scriptsToKeep,
      build: "harpy build",
      start: "harpy start",
      dev: "harpy dev",
    };

    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });

    // Step 6.5: Update tsconfig.json for JSX support
    console.log(chalk.green("[UPDATE]") + " TypeScript configuration for JSX");
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    const tsconfig = fs.readJsonSync(tsconfigPath);

    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      jsx: "react-jsx",
      jsxImportSource: "react",
    };

    fs.writeJsonSync(tsconfigPath, tsconfig, { spaces: 2 });

    // Step 6.6: Update .gitignore to include dist folder
    console.log(chalk.green("[UPDATE]") + " .gitignore");
    const gitignorePath = path.join(projectPath, ".gitignore");

    // Check if .gitignore exists, if not create it
    let gitignoreContent = "";
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
    }

    // Add dist to gitignore if not already there
    if (!gitignoreContent.includes("dist")) {
      gitignoreContent += "\n# Build outputs\ndist\n*.js.map\n";
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }

    // Post-process templates depending on i18n selection
    const appModulePath = path.join(projectPath, "src", "app.module.ts");
    if (includeI18n) {
      // If i18n is included as a separate package, update imports in
      // `app.module.ts` and `src/i18n/i18n.config.ts` to point to the new
      // package `@harpy-js/i18n` instead of `harpy-core`.
      try {
        if (fs.existsSync(appModulePath)) {
          let appModuleContent = fs.readFileSync(appModulePath, "utf-8");
          // Only replace I18nModule import, not all @harpy-js/core imports
          appModuleContent = appModuleContent.replace(
            /import\s*\{\s*I18nModule\s*\}\s*from\s*['"]@harpy-js\/core['"]/g,
            "import { I18nModule } from '@harpy-js/i18n'",
          );
          fs.writeFileSync(appModulePath, appModuleContent, "utf-8");
        }

        const i18nConfigPath = path.join(
          projectPath,
          "src",
          "i18n",
          "i18n.config.ts",
        );
        if (fs.existsSync(i18nConfigPath)) {
          let i18nContent = fs.readFileSync(i18nConfigPath, "utf-8");
          i18nContent = i18nContent.replace(
            /from '\@harpy-js\/core'/g,
            "from '@harpy-js/i18n'",
          );
          fs.writeFileSync(i18nConfigPath, i18nContent, "utf-8");
        }
      } catch (err) {
        // Non-fatal: proceed without blocking project creation
        console.warn(
          chalk.yellow("⚠ Failed to adjust i18n imports automatically."),
        );
      }
    } else {
      // Remove i18n template files and references from AppModule
      try {
        const i18nDir = path.join(projectPath, "src", "i18n");
        if (fs.existsSync(i18nDir)) {
          fs.removeSync(i18nDir);
        }

        // Remove I18N guide if present
        const i18nGuideTarget = path.join(projectPath, "I18N_GUIDE.md");
        if (fs.existsSync(i18nGuideTarget)) {
          fs.unlinkSync(i18nGuideTarget);
        }

        // Remove dictionaries folder
        const dictionariesDir = path.join(projectPath, "src", "dictionaries");
        if (fs.existsSync(dictionariesDir)) {
          fs.removeSync(dictionariesDir);
        }

        // Remove language-switcher component
        const languageSwitcherPath = path.join(
          projectPath,
          "src",
          "components",
          "language-switcher.tsx",
        );
        if (fs.existsSync(languageSwitcherPath)) {
          fs.unlinkSync(languageSwitcherPath);
        }

        // Update layout.tsx to remove LanguageSwitcher import and usage
        const layoutPath = path.join(
          projectPath,
          "src",
          "layouts",
          "layout.tsx",
        );
        if (fs.existsSync(layoutPath)) {
          let layoutContent = fs.readFileSync(layoutPath, "utf-8");
          // Remove import line for LanguageSwitcher
          layoutContent = layoutContent.replace(
            /import\s+\{[^}]*LanguageSwitcher[^}]*\}[^;]*;\s*/g,
            "",
          );
          // Remove <LanguageSwitcher /> usage
          layoutContent = layoutContent.replace(
            /<LanguageSwitcher\s*\/>/g,
            "",
          );
          fs.writeFileSync(layoutPath, layoutContent, "utf-8");
        }

        // Update homepage.tsx to remove i18n usage
        const homepagePath = path.join(
          projectPath,
          "src",
          "features",
          "home",
          "views",
          "homepage.tsx",
        );
        if (fs.existsSync(homepagePath)) {
          let homepageContent = fs.readFileSync(homepagePath, "utf-8");
          // Remove getDictionary import
          homepageContent = homepageContent.replace(
            /import\s+\{[^}]*getDictionary[^}]*\}[^;]*;\s*/g,
            "",
          );
          // Replace interface with simpler version
          homepageContent = homepageContent.replace(
            /interface HomePageProps extends PageProps \{[^}]*\}/s,
            "interface HomePageProps extends PageProps {}",
          );
          // Replace function body to use static content
          homepageContent = homepageContent.replace(
            /export default function HomePage\([^)]*\) \{[\s\S]*?return \(/s,
            `export default function HomePage({}: HomePageProps) {
  return (`,
          );
          // Replace translation references with static text
          homepageContent = homepageContent.replace(
            /\{t\.hero\.title\}/g,
            "Harpy.js",
          );
          homepageContent = homepageContent.replace(
            /\{t\.hero\.subtitle\}/g,
            "Full-Stack NestJS Framework with React SSR",
          );
          homepageContent = homepageContent.replace(
            /\{t\.hero\.description\}/g,
            "Build powerful full-stack applications leveraging the NestJS ecosystem with server-side React rendering and automatic client-side hydration.",
          );
          homepageContent = homepageContent.replace(
            /\{t\.hero\.cta\.getStarted\}/g,
            "Get Started",
          );
          homepageContent = homepageContent.replace(
            /\{t\.hero\.cta\.viewDocs\}/g,
            "GitHub",
          );
          fs.writeFileSync(homepagePath, homepageContent, "utf-8");
        }

        // Update home.controller.ts to remove i18n usage
        const homeControllerPath = path.join(
          projectPath,
          "src",
          "features",
          "home",
          "home.controller.ts",
        );
        if (fs.existsSync(homeControllerPath)) {
          let controllerContent = fs.readFileSync(homeControllerPath, "utf-8");
          // Remove CurrentLocale import
          controllerContent = controllerContent.replace(
            /import\s+\{[^}]*CurrentLocale[^}]*\}[^;]*;\s*/g,
            "",
          );
          // Remove getDictionary import
          controllerContent = controllerContent.replace(
            /import\s+\{[^}]*getDictionary[^}]*\}[^;]*;\s*/g,
            "",
          );
          // Replace homepage method - use literal string replacement for exact match
          const oldMethod = `async homepage(@CurrentLocale() locale: string): Promise<PageProps> {
    const translations = await getDictionary(locale);
    return { translations };
  }`;
          const newMethod = `async homepage(): Promise<PageProps> {
    return {};
  }`;
          controllerContent = controllerContent.replace(oldMethod, newMethod);
          fs.writeFileSync(homeControllerPath, controllerContent, "utf-8");
        }

        if (fs.existsSync(appModulePath)) {
          let appModuleContent = fs.readFileSync(appModulePath, "utf-8");
          // Remove import lines for I18nModule and i18nConfig
          appModuleContent = appModuleContent.replace(
            /import\s+\{[^}]*I18nModule[^}]*\}[^;]*;\s*/g,
            "",
          );
          appModuleContent = appModuleContent.replace(
            /import\s+\{[^}]*i18nConfig[^}]*\}[^;]*;\s*/g,
            "",
          );
          // Remove the I18nModule.forRoot(...) entry from the imports array
          appModuleContent = appModuleContent.replace(
            /\s*I18nModule\.forRoot\([^)]*\),?/g,
            "",
          );
          fs.writeFileSync(appModulePath, appModuleContent, "utf-8");
        }
      } catch (err) {
        console.warn(
          chalk.yellow("⚠ Failed to strip i18n templates automatically."),
        );
      }
    }

    // Step 7: Initialize git
    if (!options.skipGit) {
      console.log(chalk.green("[GIT]") + " Initializing repository");
      await execa("git", ["init"], { cwd: projectPath });
      await execa("git", ["add", "."], { cwd: projectPath });
      await execa("git", ["commit", "-m", "Initial commit from harpy-cli"], {
        cwd: projectPath,
      });
    } else {
      console.log(chalk.yellow("⚠ Skipping git initialization (--skip-git)"));
    }

    // Success message
    console.log("");
    console.log(chalk.green("✔ Project created successfully!"));
    console.log("");
    console.log("Get started with the following commands:");
    console.log("");
    console.log(chalk.cyan(`$ cd ${projectName}`));
    console.log(chalk.cyan(`$ ${packageManager} dev`));
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
