import fs from 'node:fs';
for (const folder of ['standard_fonts', 'cmaps', 'wasm'])
  fs.cpSync(`node_modules/pdfjs-dist/${folder}`, `public/pdf-assets/${folder}`, {
    recursive: true,
  });
fs.copyFileSync('node_modules/pdfjs-dist/LICENSE', 'public/licenses/pdfjs-LICENSE.txt');
fs.copyFileSync('node_modules/pdf-lib/LICENSE.md', 'public/licenses/pdf-lib-LICENSE.md');
