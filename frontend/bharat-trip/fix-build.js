import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const clientDir = path.join(distDir, 'client');
const assetsDir = path.join(clientDir, 'assets');

// Find the main index-*.js file
const files = fs.readdirSync(assetsDir);
const entryFile = files.find(f => f.startsWith('index-') && f.endsWith('.js') && fs.statSync(path.join(assetsDir, f)).size > 500000);

if (!entryFile) {
    console.error('Could not find main index JS file');
    process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GoTripo</title>
    <link rel="stylesheet" href="/assets/${files.find(f => f.startsWith('styles-') && f.endsWith('.css'))}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" async src="/assets/${entryFile}"></script>
  </body>
</html>`;

// Write index.html to BOTH locations just to be safe
fs.writeFileSync(path.join(clientDir, 'index.html'), html);
fs.writeFileSync(path.join(distDir, 'index.html'), html);

// Copy assets up to dist/assets so Vercel finds them at /assets/
const targetAssetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(targetAssetsDir)) {
    fs.mkdirSync(targetAssetsDir);
}

files.forEach(file => {
    fs.copyFileSync(path.join(assetsDir, file), path.join(targetAssetsDir, file));
});

console.log('Successfully flattened build and generated index.html');
