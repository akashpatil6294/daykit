// Download code into the HTTP cache without evaluating PDF.js on the initial page.
// This keeps first interaction responsive while retaining same-tab offline conversion.
let preparing:Promise<void>|undefined;
export function prepareRenderer(){
 return preparing ??= (async()=>{
  if(import.meta.env.DEV){await(await import('../pdf-render')).preparePdf();return;}
  const response=await fetch('/converter-assets.json');if(!response.ok)throw new Error('failed');
  const manifest:{renderer:string[];data:string}=await response.json();
  const urls=[...manifest.renderer,manifest.data];
  // Bounded parallelism prevents asset downloads monopolizing the connection.
  for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{
   if(!url.startsWith('/_astro/') && url!=='/pdf-assets/offline.zip')throw new Error('failed');
   const result=await fetch(url,{cache:'force-cache'});if(!result.ok)throw new Error('failed');await result.arrayBuffer();
  }));
 })().catch(e=>{preparing=undefined;throw e;});
}
