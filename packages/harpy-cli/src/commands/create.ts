import chalk from "chalk";
import * as fs from "fs-extra";
import ora from "ora";
import * as path from "path";
import prompts from "prompts";
import execa = require("execa");

interface CreateOptions {
  packageManager?: "npm" | "pnpm" | "yarn";
  includeI18n?: boolean;
  examples?: boolean;
  skipInstall?: boolean;
  skipGit?: boolean;
}

export async function createCommand(
  projectName: string,
  options: CreateOptions,
) {
  const spinner = ora();

  try {
    console.log("");
    console.log(chalk.green("🦅  Harpy CLI"));
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

    // Step 1: Create NestJS project
    console.log(chalk.gray("CREATE Creating NestJS project..."));
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
        stdio: "inherit",
      },
    );
    console.log(chalk.green("✔ NestJS project created"));

    // Step 2: Install React and Harpy dependencies
    console.log(
      chalk.gray("INSTALL Installing React, Harpy, and other dependencies..."),
    );
    const installCmd = packageManager === "yarn" ? "add" : "install";
    const baseDeps = [
      "react@^19.0.0",
      "react-dom@^19.0.0",
      "@types/react@^19.0.0",
      "@types/react-dom@^19.0.0",
      "@hepta-solutions/harpy-core@latest",
      "@fastify/static@^8.0.0",
      "@fastify/cookie@^11.0.0",
      "@types/node",
    ];

    if (includeI18n) {
      baseDeps.push("@hepta-solutions/harpy-i18n@latest");
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
    console.log(chalk.green("✔ React and Harpy dependencies installed"));

    // Step 3: Install @nestjs/platform-fastify and reflect-metadata
    console.log(
      chalk.gray(
        "INSTALL Installing @nestjs/platform-fastify and reflect-metadata...",
      ),
    );
    await execa(
      packageManager,
      [installCmd, "@nestjs/platform-fastify", "reflect-metadata"],
      {
        cwd: projectPath,
        stdio: "pipe",
      },
    );
    console.log(
      chalk.green("✔ @nestjs/platform-fastify and reflect-metadata installed"),
    );

    // Step 4: Install Tailwind CSS and build tools
    console.log(
      chalk.gray("INSTALL Installing Tailwind CSS and build tools..."),
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
    console.log(chalk.green("✔ Tailwind CSS and build tools installed"));

    // Step 5: Copy template files
    console.log(chalk.gray("CREATE Setting up project structure..."));
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

    console.log(chalk.green("✔ Project structure created"));

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
        const homeController = `import { JsxRender } from '@hepta-solutions/harpy-core';
import { Controller, Get } from '@nestjs/common';
import Homepage, { type PageProps } from './views/homepage';
import { HomeService } from './home.service';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @JsxRender(Homepage)
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

type Props = { items?: string[] };

export default function Homepage({ items = [] }: Props) {
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
    console.log(chalk.gray("UPDATE Updating package.json..."));
    const packageJsonPath = path.join(projectPath, "package.json");
    const packageJson = fs.readJsonSync(packageJsonPath);

    packageJson.scripts = {
      ...packageJson.scripts,
      build:
        "nest build && harpy build-hydration && harpy auto-wrap && harpy build-styles",
      "build:hydration": "harpy build-hydration",
      "auto-wrap": "harpy auto-wrap",
      "build:styles": "harpy build-styles",
      start: "node dist/main",
      dev: "harpy dev",
      "start:prod": "node dist/main",
    };

    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green("✔ package.json updated"));

    // Step 6.5: Update tsconfig.json for JSX support
    console.log(chalk.gray("UPDATE Configuring TypeScript for JSX..."));
    const tsconfigPath = path.join(projectPath, "tsconfig.json");
    const tsconfig = fs.readJsonSync(tsconfigPath);

    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      jsx: "react-jsx",
      jsxImportSource: "react",
    };

    fs.writeJsonSync(tsconfigPath, tsconfig, { spaces: 2 });
    console.log(chalk.green("✔ TypeScript configured for JSX"));

    // Step 6.6: Update .gitignore to include dist folder
    console.log(chalk.gray("UPDATE Updating .gitignore..."));
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
    console.log(chalk.green("✔ .gitignore updated"));

    // Post-process templates depending on i18n selection
    const appModulePath = path.join(projectPath, "src", "app.module.ts");
    if (includeI18n) {
      // If i18n is included as a separate package, update imports in
      // `app.module.ts` and `src/i18n/i18n.config.ts` to point to the new
      // package `@hepta-solutions/harpy-i18n` instead of `harpy-core`.
      try {
        if (fs.existsSync(appModulePath)) {
          let appModuleContent = fs.readFileSync(appModulePath, "utf-8");
          appModuleContent = appModuleContent.replace(
            /from '\@hepta-solutions\/harpy-core'/g,
            "from '@hepta-solutions/harpy-i18n'",
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
            /from '\@hepta-solutions\/harpy-core'/g,
            "from '@hepta-solutions/harpy-i18n'",
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
      console.log(chalk.gray("GIT Initializing git repository..."));
      await execa("git", ["init"], { cwd: projectPath });
      await execa("git", ["add", "."], { cwd: projectPath });
      await execa("git", ["commit", "-m", "Initial commit from harpy-cli"], {
        cwd: projectPath,
      });
      console.log(chalk.green("✔ Git repository initialized"));
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
