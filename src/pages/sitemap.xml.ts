import type { APIRoute } from 'astro';
import { routes } from '../data/site';
export const GET: APIRoute = ({ site }) => {
  const escape = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes
      .map((path) => `<url><loc>${escape(new URL(path, site).href)}</loc></url>`)
      .join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
