#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const command = process.argv[2];
const args = process.argv.slice(3);

const scripts: Record<string, string> = {
  'build-hydration': path.join(__dirname, '../scripts/build-hydration.ts'),
  'auto-wrap': path.join(__dirname, '../scripts/auto-wrap-exports.ts'),
  'build-styles': path.join(__dirname, '../scripts/build-page-styles.ts'),
  'dev': path.join(__dirname, '../scripts/dev.ts'),
};

if (!command || !scripts[command]) {
  console.error('Usage: harpy <command>');
  console.error('Commands: build-hydration, auto-wrap, build-styles, dev');
  process.exit(1);
}

const scriptPath = scripts[command];

// Find tsx in node_modules - check multiple possible locations
const findTsx = (): string => {
  const fs = require('fs');
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', '.bin', 'tsx'),
    path.join(process.cwd(), 'apps', 'test-app', 'node_modules', '.bin', 'tsx'),
    path.join(__dirname, '../../node_modules', '.bin', 'tsx'),
    path.join(__dirname, '../../../node_modules', '.bin', 'tsx'),
    path.join(__dirname, '../../../../node_modules', '.bin', 'tsx'),
  ];
  
  for (const tsxPath of possiblePaths) {
    if (fs.existsSync(tsxPath)) {
      return tsxPath;
    }
  }
  
  // If tsx not found anywhere, throw error with helpful message
  throw new Error('tsx not found. Please install tsx in your project: npm install -D tsx');
};

const tsxCmd = findTsx();

// Handle "node --import" or "node --loader" commands
let execCommand: string;
let cmdArgs: string[];

if (tsxCmd.startsWith('node ')) {
  // Split node command and its flags
  const parts = tsxCmd.split(' ');
  execCommand = parts[0]; // 'node'
  cmdArgs = [...parts.slice(1), scriptPath, ...args];
} else {
  // Direct tsx binary
  execCommand = tsxCmd;
  cmdArgs = [scriptPath, ...args];
}

const proc = spawn(execCommand, cmdArgs, {
  stdio: 'inherit',
  shell: false,
});

proc.on('exit', (code: number | null) => {
  process.exit(code || 0);
});
