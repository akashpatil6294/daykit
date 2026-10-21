import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH, headless:true});
try {
  const context = await browser.newContext();
  // Hold real worker results at the delivery boundary. This makes the ordering
  // deterministic without replacing the production worker or processing code.
  await context.addInitScript(() => {
    const NativeWorker = window.Worker;
    const nativeClear = window.clearTimeout.bind(window);
    window.clearedTimers = [];
    window.clearTimeout = id => { window.clearedTimers.push(id); nativeClear(id); };
    window.heldResults = [];
    window.Worker = class extends NativeWorker {
      set onmessage(handler) {
        this.deliver = data => handler(new MessageEvent('message', {data}));
        super.onmessage = event => {
          if(event.data.type === 'result') window.heldResults.push({worker:this, data:event.data});
          else handler(event);
        };
      }
      postMessage(message, ...rest) {
        if(message.type === 'process') window.currentImageJob = message.jobId;
        super.postMessage(message, ...rest);
      }
    };
  });
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.BASE_URL || 'http://127.0.0.1:4321')+'/tools/resize-image-kb/');
  await page.getByText('Ready · works offline in this tab',{exact:true}).waitFor();
  await context.setOffline(true);
  async function select(name,color,width,height) {
    await page.evaluate(async ({name,color,width,height})=>{
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,width,height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      const dt=new DataTransfer();dt.items.add(new File([blob],name,{type:'image/png'}));
      const input=document.querySelector('input[type=file]');input.files=dt.files;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    },{name,color,width,height});
    await page.locator('.image-workspace img').waitFor();
  }
  await select('cancelled-red.png','#ee0000',800,600);
  await page.getByRole('button',{name:'Resize image',exact:true}).click();
  await page.waitForFunction(()=>window.heldResults.length===1);
  await page.getByRole('button',{name:'Cancel and clear image',exact:true}).click();
  await select('current-blue.png','#0022ee',400,300);
  const preview=await page.locator('.image-workspace img').getAttribute('src');
  await page.getByRole('button',{name:'Resize image',exact:true}).click();
  await page.waitForFunction(()=>window.heldResults.length===2);
  const delivery = await page.evaluate(()=>{
    const old=window.heldResults[0];
    const before=window.clearedTimers.length;
    old.worker.deliver(old.data);
    old.worker.deliver({type:'error',jobId:old.data.jobId,code:'decode'});
    old.worker.deliver({type:'loaded',jobId:old.data.jobId,width:800,height:600,preview:old.data.blob});
    old.worker.deliver({type:'progress',jobId:old.data.jobId,value:99});
    return {before,after:window.clearedTimers.length};
  });
  assert.equal(delivery.after,delivery.before,'Stale messages must not clear B’s timer');
  assert.equal(await page.getByRole('link',{name:'Download image'}).count(),0);
  assert.equal(await page.getByRole('alert').count(),0);
  assert.equal(await page.getByRole('button',{name:'Cancel and clear image',exact:true}).isVisible(),true);
  assert.equal(await page.locator('.image-workspace img').getAttribute('src'),preview);
  await page.evaluate(()=>{const current=window.heldResults[1];current.worker.deliver(current.data);});
  const link=page.getByRole('link',{name:'Download image'});
  await link.waitFor();
  assert.equal(await link.getAttribute('download'),'current-blue-size.jpg');
  const result=await page.evaluate(async()=>{
    const blob=await fetch(document.querySelector('a[download]').href).then(r=>r.blob());
    const bitmap=await createImageBitmap(blob);
    const canvas=new OffscreenCanvas(bitmap.width,bitmap.height),ctx=canvas.getContext('2d');
    ctx.drawImage(bitmap,0,0);
    const result={width:bitmap.width,height:bitmap.height,pixel:[...ctx.getImageData(200,150,1,1).data]};
    bitmap.close();return result;
  });
  assert.equal(result.width,400);assert.equal(result.height,300);
  assert.ok(result.pixel[2]>180 && result.pixel[0]<50);
  assert.deepEqual(errors,[]);
  const unsupported = await browser.newContext();
  let intercepted=false;
  await unsupported.route('**/image.worker-*.js', async route => {
    intercepted=true;
    const response=await route.fetch();
    await route.fulfill({response,body:'self.OffscreenCanvas = undefined;\n'+await response.text()});
  });
  const unsupportedPage=await unsupported.newPage();
  await unsupportedPage.goto((process.env.BASE_URL || 'http://127.0.0.1:4321')+'/tools/resize-image-kb/');
  await unsupportedPage.getByRole('alert').waitFor({timeout:15000});
  assert.ok(intercepted,'Unsupported-engine check must alter the real worker');
  assert.ok(await unsupportedPage.getByRole('alert').textContent());
  await unsupported.close();
  fs.writeFileSync('qa-image-cancellation.json',JSON.stringify({checkedAt:new Date().toISOString(),passed:true,offline:true,staleReplies:['result','error','loaded','progress'],timerPreserved:true,unsupportedEngineShowsError:true,result},null,2));
  console.log('PASS: real delayed A replies rejected while B is busy; timer, preview, output and offline operation verified.');
} finally { await browser.close(); }
