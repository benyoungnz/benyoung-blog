import type { APIRoute } from 'astro';
import { getSiteSettings } from 'emdash';
import { allPosts, postHref, terms } from '@lib/content';

// Same path as the old site's feed, so existing subscribers keep working
export const GET: APIRoute = async (ctx) => {
	const site = (ctx.site ?? ctx.url).origin;
	const settings = await getSiteSettings();
	const entries = (await allPosts(ctx as never)).slice(0, 50);

	const items = entries
		.filter((e) => e.data.publishedAt)
		.map((e) => {
			const link = `${site}${postHref(e.id)}`;
			const cats = terms(e, 'tag').map((t) => `      <category>${esc(t.label)}</category>`).join('\n');
			return `    <item>
      <title>${esc(e.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(e.data.publishedAt).toUTCString()}</pubDate>
      <description>${esc(e.data.description ?? '')}</description>
${cats}
    </item>`;
		})
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(settings?.title || 'Ben Young')}</title>
    <description>${esc(settings?.tagline || '')}</description>
    <link>${site}/</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-nz</language>
${items}
  </channel>
</rss>`,
		{ headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
	);
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
