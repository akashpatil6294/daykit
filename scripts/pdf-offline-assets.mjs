import fs from 'node:fs';
import { zipSync } from 'fflate';
const entries={};
for(const dir of ['cmaps','standard_fonts','wasm']) for(const name of fs.readdirSync(`public/pdf-assets/${dir}`)) {
 const path=`public/pdf-assets/${dir}/${name}`;
 if(fs.statSync(path).isFile())entries[`${dir}/${name}`]=new Uint8Array(fs.readFileSync(path));
}
fs.writeFileSync('public/pdf-assets/offline.zip',zipSync(entries,{level:6}));
