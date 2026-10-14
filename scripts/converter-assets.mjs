// Authoring-time download; browsers only request fonts from this site's origin.
import fs from 'node:fs';
const fonts = [
  'NotoSans',
  'NotoSansDevanagari',
  'NotoSansKannada',
  'NotoSansTamil',
  'NotoSansTelugu',
  'NotoSansBengali',
  'NotoSansArabic',
  'NotoSansHebrew',
];
fs.mkdirSync('public/fonts/pdf', { recursive: true });
fs.mkdirSync('public/licenses', { recursive: true });
for (const name of fonts) {
  const path = `public/fonts/pdf/${name}.ttf`;
  if (fs.existsSync(path)) continue;
  const response = await fetch(
    `https://raw.githubusercontent.com/notofonts/noto-fonts/main/hinted/ttf/${name}/${name}-Regular.ttf`,
  );
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  fs.writeFileSync(path, new Uint8Array(await response.arrayBuffer()));
  console.log(name);
}
const response = await fetch('https://raw.githubusercontent.com/notofonts/noto-fonts/main/LICENSE');
if (!response.ok) throw new Error('Font license download failed');
fs.writeFileSync('public/licenses/Noto-PDF-OFL.txt', await response.text());
const packages = [
  'docx',
  'pptxgenjs',
  'exceljs',
  'mammoth',
  '@pdf-lib/fontkit',
  'fast-xml-parser',
  'fast-xml-validator',
];
for (const name of packages) {
  const root = `node_modules/${name}`;
  const file = fs.readdirSync(root).find((f) => /^licen[sc]e(?:\.md|\.txt)?$/i.test(f));
  const target = `public/licenses/${name.replaceAll('/', '-').replace('@', '')}.txt`;
  if (file) fs.copyFileSync(`${root}/${file}`, target);
  else if (name === '@pdf-lib/fontkit') {
    // This package declares MIT in package.json and README but omits a LICENSE file.
    const meta = JSON.parse(fs.readFileSync(`${root}/package.json`, 'utf8'));
    const mit = fs.readFileSync('public/licenses/docx.txt', 'utf8');
    const terms = mit.slice(mit.indexOf('Permission is hereby granted'));
    if (!terms.startsWith('Permission')) throw new Error('MIT license terms missing');
    fs.writeFileSync(
      target,
      `@pdf-lib/fontkit ${meta.version}\nMIT (as declared in the distributed package)\nAuthor: ${meta.author}\nContributors: ${meta.contributors.join(', ')}\nUpstream: https://github.com/Hopding/fontkit\nCopyright notices in the distributed library remain applicable.\n\n${terms}`,
    );
  } else throw new Error(`License missing: ${name}`);
}
const notice =
  'Daykit converter dependencies\n\n' +
  packages
    .map((p) => `${p}: see /licenses/${p.replaceAll('/', '-').replace('@', '')}.txt`)
    .join('\n') +
  '\nNoto fonts: SIL Open Font License, see /licenses/Noto-PDF-OFL.txt\nPDF.js, pdf-lib and fflate notices are also distributed in /licenses/.\n\n' + fs.readFileSync('public/licenses/HEIC-NOTICE.txt','utf8');
fs.writeFileSync('NOTICE.txt', notice);
fs.writeFileSync('public/licenses/NOTICE.txt', notice);
