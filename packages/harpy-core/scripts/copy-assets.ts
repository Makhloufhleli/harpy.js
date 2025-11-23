import * as fs from 'fs';
import * as path from 'path';

const src = 'public';
const dest = path.join('dist', 'public');

if (!fs.existsSync(src)) {
  console.log('No public folder to copy');
  process.exit(0);
}

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true });
}

const copy = (source: string, target: string): void => {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source)) {
    const srcPath = path.join(source, entry);
    const destPath = path.join(target, entry);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copy(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

copy(src, dest);

console.log('Assets copied successfully');
