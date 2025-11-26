import chalk from 'chalk';
import * as fs from 'fs-extra';
import ora from 'ora';
import * as path from 'path';
import prompts from 'prompts';
import execa = require('execa');

interface CreateOptions {
  packageManager?: 'npm' | 'pnpm' | 'yarn';
}

export async function createCommand(projectName: string, options: CreateOptions) {
  const spinner = ora();
  
  try {
    console.log('');
    console.log(chalk.green('🦅  Harpy CLI'));
    console.log('');
    
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
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager would you like to use?',
        choices: [
          { title: 'pnpm (recommended)', value: 'pnpm' },
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' }
        ],
        initial: 0
      });
      packageManager = response.packageManager;
    }
    
    if (!packageManager) {
      console.error(chalk.red('\n✖ Package manager selection cancelled'));
      process.exit(1);
    }
    
    // Step 1: Create NestJS project
    console.log(chalk.gray('CREATE Creating NestJS project...'));
    await execa('npx', ['@nestjs/cli', 'new', projectName, '--package-manager', packageManager, '--skip-git'], {
      stdio: 'inherit'
    });
    console.log(chalk.green('✔ NestJS project created'));
    
    // Step 2: Install React and Harpy dependencies
    console.log(chalk.gray('INSTALL Installing React, Harpy, and other dependencies...'));
    const installCmd = packageManager === 'yarn' ? 'add' : 'install';
    await execa(packageManager, [
      installCmd,
      'react@^19.0.0',
      'react-dom@^19.0.0',
      '@types/react@^19.0.0',
      '@types/react-dom@^19.0.0',
      '@hepta-solutions/harpy-core@latest',
      '@fastify/static@^8.0.0',
      '@fastify/cookie@^11.0.0',
      '@types/node'
    ], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    console.log(chalk.green('✔ React and Harpy dependencies installed'));
    
    // Step 3: Install @nestjs/platform-fastify and reflect-metadata
    console.log(chalk.gray('INSTALL Installing @nestjs/platform-fastify and reflect-metadata...'));
    await execa(packageManager, [installCmd, '@nestjs/platform-fastify', 'reflect-metadata'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    console.log(chalk.green('✔ @nestjs/platform-fastify and reflect-metadata installed'));
    
    // Step 4: Install Tailwind CSS and build tools
    console.log(chalk.gray('INSTALL Installing Tailwind CSS and build tools...'));
    await execa(packageManager, [
      installCmd,
      '-D',
      'fastify@^5.2.0',
      'tailwindcss@^4.0.0',
      'postcss@^8.4.0',
      '@tailwindcss/postcss@^4.0.0',
      'postcss-cli@^11.0.0',
      'cssnano@^7.0.0',
      'tsx@^4.0.0',
      'esbuild@^0.24.0'
    ], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    console.log(chalk.green('✔ Tailwind CSS and build tools installed'));
    
    // Step 5: Copy template files
    console.log(chalk.gray('CREATE Setting up project structure...'));
    const templatePath = path.join(__dirname, '../../templates/app');
    
    // Copy src directory
    fs.copySync(path.join(templatePath, 'src'), path.join(projectPath, 'src'));
    
    // Copy config files
    fs.copyFileSync(
      path.join(templatePath, 'tailwind.config.js'),
      path.join(projectPath, 'tailwind.config.js')
    );
    fs.copyFileSync(
      path.join(templatePath, 'postcss.config.js'),
      path.join(projectPath, 'postcss.config.js')
    );
    fs.copyFileSync(
      path.join(templatePath, 'swc-client-component-plugin.js'),
      path.join(projectPath, 'swc-client-component-plugin.js')
    );
    
    // Replace default NestJS README with Harpy README
    const readmePath = path.join(templatePath, 'README.md');
    if (fs.existsSync(readmePath)) {
      fs.copyFileSync(
        readmePath,
        path.join(projectPath, 'README.md')
      );
    }
    
    // Copy I18N_GUIDE.md if exists
    const i18nGuidePath = path.join(templatePath, 'I18N_GUIDE.md');
    if (fs.existsSync(i18nGuidePath)) {
      fs.copyFileSync(
        i18nGuidePath,
        path.join(projectPath, 'I18N_GUIDE.md')
      );
    }
    
    console.log(chalk.green('✔ Project structure created'));
    
    // Remove default NestJS boilerplate files
    const filesToRemove = [
      path.join(projectPath, 'src/app.controller.ts'),
      path.join(projectPath, 'src/app.service.ts'),
      path.join(projectPath, 'src/app.controller.spec.ts')
    ];
    
    filesToRemove.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    // Step 6: Update package.json scripts
    console.log(chalk.gray('UPDATE Updating package.json...'));
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = fs.readJsonSync(packageJsonPath);
    
    packageJson.scripts = {
      ...packageJson.scripts,
      'build': 'nest build && harpy build-hydration && harpy auto-wrap && harpy build-styles',
      'build:hydration': 'harpy build-hydration',
      'auto-wrap': 'harpy auto-wrap',
      'build:styles': 'harpy build-styles',
      'start': 'node dist/main',
      'dev': 'harpy dev',
      'start:prod': 'node dist/main'
    };
    
    fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.green('✔ package.json updated'));
    
    // Step 6.5: Update tsconfig.json for JSX support
    console.log(chalk.gray('UPDATE Configuring TypeScript for JSX...'));
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    const tsconfig = fs.readJsonSync(tsconfigPath);
    
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      jsx: 'react-jsx',
      jsxImportSource: 'react'
    };
    
    fs.writeJsonSync(tsconfigPath, tsconfig, { spaces: 2 });
    console.log(chalk.green('✔ TypeScript configured for JSX'));
    
    // Step 6.6: Update .gitignore to include dist folder
    console.log(chalk.gray('UPDATE Updating .gitignore...'));
    const gitignorePath = path.join(projectPath, '.gitignore');
    
    // Check if .gitignore exists, if not create it
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    }
    
    // Add dist to gitignore if not already there
    if (!gitignoreContent.includes('dist')) {
      gitignoreContent += '\n# Build outputs\ndist\n*.js.map\n';
      fs.writeFileSync(gitignorePath, gitignoreContent);
    }
    console.log(chalk.green('✔ .gitignore updated'));
    
    // Step 7: Initialize git
    console.log(chalk.gray('GIT Initializing git repository...'));
    await execa('git', ['init'], { cwd: projectPath });
    await execa('git', ['add', '.'], { cwd: projectPath });
    await execa('git', ['commit', '-m', 'Initial commit from harpy-cli'], { cwd: projectPath });
    console.log(chalk.green('✔ Git repository initialized'));
    
    // Success message
    console.log('');
    console.log(chalk.green('✔ Project created successfully!'));
    console.log('');
    console.log('Get started with the following commands:');
    console.log('');
    console.log(chalk.cyan(`$ cd ${projectName}`));
    console.log(chalk.cyan(`$ ${packageManager} dev`));
    console.log('');
    console.log(`Your app will be available at ${chalk.green('http://localhost:3000')}`);
    console.log('');
    
  } catch (error: any) {
    console.log('');
    console.error(chalk.red('✖ Failed to create project'));
    console.error(chalk.red(`✖ Error: ${error.message}`));
    console.log('');
    process.exit(1);
  }
}
