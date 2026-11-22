import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const srcDir = join(root, 'web-public');
const destDir = join(root, 'dist');

if (!existsSync(destDir)) {
  console.error('dist/ missing — run expo export first');
  process.exit(1);
}
if (!existsSync(srcDir)) {
  console.error('web-public/ missing');
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
for (const name of ['manifest.json', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
  cpSync(join(srcDir, name), join(destDir, name));
}
console.log('Copied PWA assets into dist/');
