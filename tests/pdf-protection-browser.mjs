import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,headless:true});
try{const context=await browser.newContext();const page=await context.newPage();
await context.addInitScript(()=>localStorage.setItem('daykit:consent:v1',JSON.stringify({version:1,optional:false,timestamp:Date.now()})));
for(const slug of ['merge-pdf','compress-pdf']){await page.goto(`http://127.0.0.1:4321/tools/${slug}/`);await page.locator('input[type=file]').setInputFiles('tests/fixtures/encrypted.pdf');await page.getByRole('button',{name:'Create download',exact:true}).click();await page.getByRole('alert').waitFor();assert.match(await page.getByRole('alert').textContent(),/password-protected/);console.log(`${slug}: encrypted input rejected with clear message`);}
}finally{await browser.close();}
