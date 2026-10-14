// Download self-hosted, script-subset variable fonts at authoring time.
import fs from 'node:fs';
const groups = [
  { id: 'devanagari', name: 'Noto Sans Devanagari', start: 0x900, locales: ['hi', 'mr'] },
  { id: 'kannada', name: 'Noto Sans Kannada', start: 0xc80, locales: ['kn'] },
  { id: 'tamil', name: 'Noto Sans Tamil', start: 0xb80, locales: ['ta'] },
  { id: 'telugu', name: 'Noto Sans Telugu', start: 0xc00, locales: ['te'] },
  { id: 'bengali', name: 'Noto Sans Bengali', start: 0x980, locales: ['bn'] },
];
fs.mkdirSync('public/fonts', { recursive: true });
for (const group of groups) {
  const text =
    Array.from({ length: 128 }, (_, i) => String.fromCodePoint(group.start + i)).join('') +
    '\u200c\u200d';
  const url = new URL('https://fonts.googleapis.com/css2');
  url.search = new URLSearchParams({
    family: `${group.name}:wght@400..700`,
    display: 'swap',
    text,
  });
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36' },
  });
  if (!response.ok) throw new Error(`Font CSS ${response.status}`);
  const css = await response.text();
  const source = css.match(/url\((https:[^)]+)\)/)?.[1];
  if (!source) throw new Error(css);
  const file = await fetch(source);
  if (!file.ok) throw new Error(`Font ${file.status}`);
  fs.writeFileSync(`public/fonts/${group.id}.woff2`, new Uint8Array(await file.arrayBuffer()));
  const fontCss = `@font-face{font-family:DaykitIndic;src:url('/fonts/${group.id}.woff2') format('woff2');font-weight:400 700;font-style:normal;font-display:swap;unicode-range:U+${group.start.toString(16)}-${(group.start + 127).toString(16)},U+200C-200D}html body{font-family:DaykitIndic,'Nirmala UI','Segoe UI',sans-serif}`;
  for (const locale of group.locales) fs.writeFileSync(`public/fonts/${locale}.css`, fontCss);
  const license = await fetch(
    `https://raw.githubusercontent.com/google/fonts/main/ofl/notosans${group.id}/OFL.txt`,
  );
  if (license.ok) fs.writeFileSync(`public/fonts/${group.id}-OFL.txt`, await license.text());
  console.log(`${group.id}: ${fs.statSync(`public/fonts/${group.id}.woff2`).size} bytes`);
}
