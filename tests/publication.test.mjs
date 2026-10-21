import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import { newPdfPages } from '../src/i18n/pdf-new-pages.ts';

const state=JSON.parse(fs.readFileSync('dist/publication.json','utf8'));
const files=fs.readdirSync('dist',{recursive:true}).filter(f=>f.endsWith('.html'));

test('published tools have 600 words and at least four specific FAQs',()=>{
 const seen=new Map();
 for(const file of files.filter(f=>f.replaceAll('\\','/').startsWith('tools/'))) {
  const d=parseHTML(fs.readFileSync(`dist/${file}`,'utf8')).document;
  const a=d.querySelector('[data-guide]'); if(!a)continue;
  assert.ok(a.textContent.split(/\s+/).filter(Boolean).length>=600,file);
  assert.ok(a.querySelectorAll('details').length>=4,file);
  assert.ok(d.querySelector('time[datetime="2026-10-21"]'),file);
  for(const p of a.querySelectorAll('p')) {
   const text=p.textContent.trim(); if(text.length<150)continue;
   assert.ok(!seen.has(text),`Repeated paragraph: ${file} and ${seen.get(text)}`);seen.set(text,file);
  }
 }
});

test('remote conversion tools meet content floor even before being published',()=>{
 const reviews=JSON.parse(fs.readFileSync('src/data/tool-review.json','utf8'));
 const remoteTools=['pdf-to-word','pdf-to-powerpoint','pdf-to-excel','word-to-pdf','powerpoint-to-pdf','excel-to-pdf'];
 for(const slug of remoteTools) {
  const page=newPdfPages[slug];
  assert.ok(page,`Missing definition for ${slug}`);
  const review=reviews[slug];
  assert.ok(review,`Missing review content for ${slug}`);
  const intro=page.intro||'';
  const reviewText=review.heading+' '+review.paragraphs.join(' ')+' '+review.question+' '+review.answer;
  const sections=(page.sections||[]).map(s=>s.heading+' '+s.text).join(' ');
  const steps=(page.steps||[]).join(' ');
  const faqs=(page.faq||[]).map(f=>f.question+' '+f.answer).join(' ');
  const allText=[intro,reviewText,sections,steps,faqs].join(' ');
  const words=allText.split(/\s+/).filter(Boolean).length;
  const faqCount=(page.faq?page.faq.length:0)+1;
  assert.ok(words>=600,`${slug} word count is ${words}, required >= 600`);
  assert.ok(faqCount>=4,`${slug} has ${faqCount} FAQs, required >= 4`);
 }
});

test('publication excludes unavailable tools and unverified exam links',()=>{
 const excluded=[...state.excludedTools,...state.noindex];
 for(const route of state.excludedTools) assert.ok(!fs.existsSync(`dist${route}index.html`));
 for(const file of files) {
  const d=parseHTML(fs.readFileSync(`dist/${file}`,'utf8')).document;
  for(const a of d.querySelectorAll('a[href]')) assert.ok(!excluded.includes(a.getAttribute('href')),`${file}: ${a.getAttribute('href')}`);
  assert.ok(!d.querySelector('script[src*="adsbygoogle"]'));
  assert.equal(d.querySelector('link[rel=canonical]').href.startsWith('https://pdf-converter.me/'),true);
  for(const nav of [d.querySelector('header nav'),d.querySelector('footer nav')]) {
   for(const href of ['/','/tools/','/guides/','/about/','/contact/','/privacy/','/terms/']) assert.ok(nav.querySelector(`a[href="${href}"]`),file+href);
  }
 }
});
