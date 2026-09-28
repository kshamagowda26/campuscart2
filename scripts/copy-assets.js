import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[Post-Build] Ensuring static assets are in dist directory...');

// 1. Copy images, js, css to dist
copyDirRecursive(path.join(rootDir, 'images'), path.join(distDir, 'images'));
copyDirRecursive(path.join(rootDir, 'js'), path.join(distDir, 'js'));
copyDirRecursive(path.join(rootDir, 'css'), path.join(distDir, 'css'));

// 2. Ensure all HTML files are in dist
const htmlFiles = [
  'index.html',
  'products.html',
  'product-details.html',
  'cart.html',
  'checkout.html',
  'success.html',
  'about.html',
];

for (const htmlFile of htmlFiles) {
  const destHtml = path.join(distDir, htmlFile);
  const srcHtml = path.join(rootDir, htmlFile);
  if (!fs.existsSync(destHtml) && fs.existsSync(srcHtml)) {
    fs.copyFileSync(srcHtml, destHtml);
    console.log(`[Post-Build] Copied fallback ${htmlFile} to dist`);
  }
}

console.log('[Post-Build] Successfully synced all assets to dist/');
