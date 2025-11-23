#!/usr/bin/env node

import { spawn } from 'child_process';
import * as fs from 'fs';

let nestProcess: any = null;
let isRebuilding = false;

async function runCommand(cmd: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function buildHydration(): Promise<void> {
  console.log('🔧 Building hydration...');
  try {
    await runCommand('pnpm', ['build:hydration']);
    console.log('✅ Hydration built');
  } catch (error) {
    console.error('❌ Hydration build failed:', error);
    throw error;
  }
}

async function autoWrap(): Promise<void> {
  console.log('🔄 Auto-wrapping client components...');
  try {
    await runCommand('pnpm', ['auto-wrap']);
    console.log('✅ Auto-wrap complete');
  } catch (error) {
    console.error('❌ Auto-wrap failed:', error);
    throw error;
  }
}

async function buildStyles(): Promise<void> {
  console.log('🎨 Building styles...');
  try {
    await runCommand('pnpm', ['build:styles']);
    console.log('✅ Styles built');
  } catch (error) {
    console.error('❌ Styles build failed:', error);
    throw error;
  }
}

async function startNestServer(): Promise<void> {
  return new Promise((resolve) => {
    console.log('🚀 Starting NestJS server from compiled dist...');
    // Run compiled dist/main.js instead of using ts-node
    // This ensures auto-wrapped components are used
    nestProcess = spawn('node', ['--watch', 'dist/main.js'], {
      stdio: 'pipe',
      shell: false,
      cwd: process.cwd(),
    });

    let resolved = false;
    let isFirstStart = true;

    // Capture output to detect when server is ready
    nestProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      process.stdout.write(output);

      // Detect when NestJS application successfully started
      if (output.includes('Nest application successfully started')) {
        if (!resolved && isFirstStart) {
          // First start - resolve the promise
          resolved = true;
          isFirstStart = false;
          resolve();
        } else if (!isFirstStart && !isRebuilding) {
          // Subsequent restarts - rebuild assets
          setTimeout(async () => {
            if (isRebuilding) return;
            isRebuilding = true;
            console.log('\n🔄 NestJS rebuild detected, rebuilding assets...');
            try {
              await buildHydration();
              await autoWrap();
              await buildStyles();
              console.log('✅ Assets rebuilt\n');
            } catch (error) {
              console.error('❌ Asset rebuild failed:', error);
            } finally {
              isRebuilding = false;
            }
          }, 100);
        }
      }
    });

    nestProcess.stderr?.on('data', (data: Buffer) => {
      process.stderr.write(data);
    });

    // Fallback timeout in case the detection fails
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        isFirstStart = false;
        resolve();
      }
    }, 8000);
  });
}

function watchSourceChanges(): void {
  console.log('👀 Watching source files for changes...');

  let debounceTimer: NodeJS.Timeout | null = null;
  const watchedFiles = new Set<string>();

  // Watch src for CSS changes only (TS/TSX changes are handled by NestJS watch + stdout detection)
  fs.watch('src', { recursive: true }, async (eventType, filename) => {
    if (!filename || isRebuilding) return;

    // Ignore .hydration-entries changes
    if (filename.includes('.hydration-entries')) {
      return;
    }

    // Only watch CSS files (TS/TSX changes trigger nest rebuild which we catch above)
    if (!filename.endsWith('.css')) return;

    // Skip if we just rebuilt for this file (avoid duplicate rebuilds)
    if (watchedFiles.has(filename)) {
      return;
    }

    watchedFiles.add(filename);

    // Debounce: wait 1000ms after last change before rebuilding
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      isRebuilding = true;
      console.log(`\n📝 CSS file changed: ${filename}`);

      try {
        await buildStyles();
        console.log('✅ Styles rebuilt\n');
      } catch (error) {
        console.error('Build error:', error);
      } finally {
        watchedFiles.delete(filename);
        isRebuilding = false;
      }
    }, 1000);
  });
}

let tscProcess: any = null;

async function startTypeScriptWatch(): Promise<void> {
  return new Promise((resolve) => {
    console.log('⚙️  Starting TypeScript compiler in watch mode...');
    tscProcess = spawn('pnpm', ['nest', 'build', '--watch'], {
      stdio: 'pipe',
      shell: true,
    });

    let resolved = false;

    tscProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      process.stdout.write(output);

      // Resolve once first compilation is done
      if (output.includes('Found 0 errors. Watching') && !resolved) {
        resolved = true;
        resolve();
      }
    });

    tscProcess.stderr?.on('data', (data: Buffer) => {
      process.stderr.write(data);
    });
  });
}

async function main(): Promise<void> {
  try {
    console.log('📦 Initializing development environment...\n');

    // First: Start TypeScript compiler in watch mode
    await startTypeScriptWatch();

    // Build initial assets after first compilation
    console.log('\n🔧 Building hydration assets...');
    await buildHydration();
    await autoWrap();
    await buildStyles();

    // Now start the node server with compiled dist files
    await startNestServer();

    console.log('\n✅ Development server ready!\n');

    // Watch for source changes
    watchSourceChanges();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping development server...');
      if (tscProcess) tscProcess.kill();
      if (nestProcess) nestProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n\n🛑 Stopping development server...');
      if (tscProcess) tscProcess.kill();
      if (nestProcess) nestProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
