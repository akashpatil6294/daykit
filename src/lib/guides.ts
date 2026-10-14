import fs from 'node:fs';
import { marked } from 'marked';
export interface Guide {
  slug: string;
  title: string;
  summary: string;
  author: string;
  published: string;
  updated: string;
  body: string;
  html: string;
  headings: { id: string; text: string }[];
  faq: { question: string; answer: string }[];
  links: string[];
}
export function readGuides(): Guide[] {
  if (!fs.existsSync('content/guides')) return [];
  return fs
    .readdirSync('content/guides')
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(`content/guides/${file}`, 'utf8');
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (!match) throw new Error(`Invalid guide metadata: ${file}`);
      const meta = JSON.parse(match[1]);
      const body = match[2];
      const headings: { id: string; text: string }[] = [];
      let html = marked.parse(body, { async: false }) as string;
      html = html.replace(/<h2>(.*?)<\/h2>/g, (_, text) => {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        headings.push({ id, text });
        return `<h2 id="${id}">${text}</h2>`;
      });
      return {
        ...meta,
        slug: file.replace(/\.md$/, ''),
        body,
        html,
        headings,
        links: [...body.matchAll(/\]\((\/[^)]+)\)/g)].map((m) => m[1]),
      };
    });
}
export const guides = readGuides();
