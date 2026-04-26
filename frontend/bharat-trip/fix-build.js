import fs from 'fs';
import path from 'path';

const clientDir = path.join(process.cwd(), 'dist', 'client');
const assetsDir = path.join(clientDir, 'assets');

// Find the main index-*.js file
const files = fs.readdirSync(assetsDir);
const mainJs = files.find(f => f.startsWith('index-') && f.endsWith('.js') && !f.includes('DmXK5ndi')); // Exclude other index files if necessary
// Actually, let's just find the largest index file or look for the one that is the entry point
// In your case it was BxmEjKxu.js

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

fs.writeFileSync(path.join(clientDir, 'index.html'), html);
console.log('Generated index.html with entry point:', entryFile);
