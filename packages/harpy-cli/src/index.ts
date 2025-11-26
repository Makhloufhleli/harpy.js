#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read version from package.json
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);

const program = new Command();

program
  .name('harpy')
  .description(
    'Harpy CLI - Create and manage Harpy projects with React/JSX support',
  )
  .version(packageJson.version);

program
  .command('create')
  .description('Create a new Harpy project with React/JSX support')
  .argument('<project-name>', 'Name of the project')
  .option(
    '-p, --package-manager <manager>',
    'Package manager to use (npm, yarn, pnpm)',
    'pnpm',
  )
  .option('--skip-git', 'Skip git repository initialization')
  .option('--skip-install', 'Skip dependency installation')
  .action(createCommand);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
