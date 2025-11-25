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
    console.log(chalk.bold.cyan('\n🚀 Creating Harpy project...\n'));
    
    const projectPath = path.resolve(process.cwd(), projectName);
    
    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      console.error(chalk.red(`❌ Directory ${projectName} already exists!`));
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
      console.error(chalk.red('❌ Package manager selection cancelled'));
      process.exit(1);
    }
    
    // Step 1: Create NestJS project
    spinner.start('Creating NestJS project...');
    await execa('npx', ['@nestjs/cli', 'new', projectName, '--package-manager', packageManager, '--skip-git'], {
      stdio: 'inherit'
    });
    spinner.succeed('NestJS project created');
    
    // Step 2: Install React and Harpy dependencies
    spinner.start('Installing React, Harpy, and other dependencies...');
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
    spinner.succeed('React and Harpy dependencies installed');
    
    // Step 3: Install @nestjs/platform-fastify
    spinner.start('Installing @nestjs/platform-fastify...');
    await execa(packageManager, [installCmd, '@nestjs/platform-fastify'], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    spinner.succeed('@nestjs/platform-fastify installed');
    
    // Step 4: Install Tailwind CSS and build tools
    spinner.start('Installing Tailwind CSS and build tools...');
    await execa(packageManager, [
      installCmd,
      '-D',
      'fastify@^5.2.0',
      'tailwindcss@^4.0.0',
      'postcss@^8.4.0',
      '@tailwindcss/postcss@^4.0.0',
      'postcss-cli@^11.0.0',
      'tsx@^4.0.0',
      'esbuild@^0.24.0'
    ], {
      cwd: projectPath,
      stdio: 'pipe'
    });
    spinner.succeed('Tailwind CSS and build tools installed');
    
    // Step 5: Copy template files
    spinner.start('Setting up project structure...');
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
    
    spinner.succeed('Project structure created');
    
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
    spinner.start('Updating package.json...');
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
    spinner.succeed('package.json updated');
    
    // Step 6.5: Update tsconfig.json for JSX support
    spinner.start('Configuring TypeScript for JSX...');
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    const tsconfig = fs.readJsonSync(tsconfigPath);
    
    tsconfig.compilerOptions = {
      ...tsconfig.compilerOptions,
      jsx: 'react',
      jsxFactory: 'React.createElement',
      jsxFragmentFactory: 'React.Fragment'
    };
    
    fs.writeJsonSync(tsconfigPath, tsconfig, { spaces: 2 });
    spinner.succeed('TypeScript configured for JSX');
    
    // Step 6.6: Update .gitignore to include dist folder
    spinner.start('Updating .gitignore...');
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
    spinner.succeed('.gitignore updated');
    
    // Step 7: Initialize git
    spinner.start('Initializing git repository...');
    await execa('git', ['init'], { cwd: projectPath });
    await execa('git', ['add', '.'], { cwd: projectPath });
    await execa('git', ['commit', '-m', 'Initial commit from harpy-cli'], { cwd: projectPath });
    spinner.succeed('Git repository initialized');
    
    // Success message
    console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
    console.log(chalk.cyan('To get started:\n'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  ${packageManager} dev`));
    console.log(chalk.cyan('\nYour app will be available at http://localhost:3000\n'));
    
  } catch (error: any) {
    spinner.fail('Failed to create project');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}
