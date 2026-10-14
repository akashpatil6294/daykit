import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { parseHTML } from 'linkedom';
import { languages, normalize, isText } from './locale-config.mjs';
export const englishFiles = () =>
  fs
    .readdirSync('dist', { recursive: true })
    .filter(
      (file) => file.endsWith('.html') && !Object.keys(languages).includes(file.split(/[\\/]/)[0]),
    );
export function inventory() {
  const all = new Set(),
    ui = new Set();
  function add(value, set = all) {
    if (typeof value === 'string') {
      const key = normalize(value);
      if (key && isText(key)) {
        set.add(key);
        all.add(key);
      }
    }
  }
  function collect(value, set = all) {
    if (typeof value === 'string') add(value, set);
    else if (typeof value === 'function') {
      try {
        collect(value('__ARG0__'), set);
      } catch {}
    } else if (value && typeof value === 'object')
      Object.values(value).forEach((v) => collect(v, set));
  }
  for (const file of fs.readdirSync('src/i18n')) {
    if (!file.endsWith('.ts') || ['index.ts', 'runtime.ts'].includes(file)) continue;
    const source = ts.transpileModule(fs.readFileSync(path.join('src/i18n', file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exports = {};
    vm.runInNewContext(source, { exports, require: () => ({ localize: (x) => x }) });
    collect(
      exports,
      ['en.ts', 'image-tools.ts', 'exams.ts', 'calculators.ts', 'pdf-tools.ts'].includes(file)
        ? ui
        : all,
    );
  }
  for (const file of englishFiles()) {
    const { document } = parseHTML(fs.readFileSync(path.join('dist', file), 'utf8'));
    function visit(node) {
      if (node.nodeType === 3) {
        add(node.textContent);
        return;
      }
      if (node.nodeType !== 1) return;
      if (
        ['SCRIPT', 'STYLE', 'SVG', 'CODE', 'PRE'].includes(node.tagName) ||
        node.hasAttribute('data-no-translate') ||
        node.hasAttribute('data-guide-body')
      )
        return;
      for (const attr of ['title', 'alt', 'aria-label', 'placeholder'])
        if (node.hasAttribute(attr)) add(node.getAttribute(attr));
      if (
        node.tagName === 'META' &&
        ['description', 'og:title', 'og:description'].includes(
          node.getAttribute('name') || node.getAttribute('property'),
        )
      )
        add(node.getAttribute('content'));
      for (const child of node.childNodes) visit(child);
    }
    visit(document.documentElement);
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const obj = JSON.parse(script.textContent);
        const walk = (value) => {
          if (Array.isArray(value)) value.forEach(walk);
          else if (value && typeof value === 'object')
            for (const [key, item] of Object.entries(value)) {
              if (['name', 'text', 'headline', 'description'].includes(key)) add(item);
              else if (typeof item === 'object') walk(item);
            }
        };
        walk(obj);
      } catch {}
    }
  }
  for (const item of ['Language', 'Machine-translated draft. Human review pending.']) {
    all.add(item);
    ui.add(item);
  }
  return { all: [...all].sort(), ui: [...ui].sort() };
}
if (process.argv[1]?.endsWith('translation-inventory.mjs')) {
  fs.mkdirSync('src/i18n/machine', { recursive: true });
  const result = inventory();
  fs.writeFileSync('src/i18n/machine/source-inventory.json', JSON.stringify(result, null, 2));
  console.log({ strings: result.all.length, ui: result.ui.length });
}
