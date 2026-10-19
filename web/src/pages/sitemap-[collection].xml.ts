import type { APIRoute } from 'astro';

// Old and alternate sitemap URLs: the previous site's /sitemap-index.xml and /sitemap-0.xml,
// and EmDash's per-collection /sitemap-<collection>.xml. All point at the single /sitemap.xml.
export const GET: APIRoute = ({ redirect }) => redirect('/sitemap.xml', 301);
