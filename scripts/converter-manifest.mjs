// Fetch compiled renderer modules before offline use, but evaluate them only on demand.
import fs from 'node:fs';
const names=fs.readdirSync('dist/_astro');
const entry=names.find(name=>name.startsWith('pdf-render.') && name.endsWith('.js'));
if(!entry)throw new Error('PDF renderer bundle missing');
const visited=new Set();
function walk(name){
 if(visited.has(name))return;visited.add(name);
 const code=fs.readFileSync(`dist/_astro/${name}`,'utf8');
 for(const match of code.matchAll(/["'](?:\.\/)?([\w.-]+\.m?js)["']/g))if(names.includes(match[1]))walk(match[1]);
}
walk(entry);
fs.writeFileSync('dist/converter-assets.json',JSON.stringify({renderer:[...visited].map(name=>`/_astro/${name}`),data:'/pdf-assets/offline.zip'}));
