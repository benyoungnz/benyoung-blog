import type { APIRoute } from 'astro';
import { allPosts, categoryHref, postHref, tagHref, termIndex } from '@lib/content';
import { getVideos, videoHref } from '@lib/youtube';

// One sitemap for the whole site (a few hundred URLs), replacing EmDash's posts-only one.
// URLs use the canonical origin and trailing slashes, matching each page's <link rel="canonical">.
export const GET: APIRoute = async (ctx) => {
	const origin = (ctx.site ?? ctx.url).origin;
	const [entries, videos] = await Promise.all([allPosts(ctx as never), getVideos(ctx as never)]);

	const newest = (dates: (Date | undefined)[]) => dates.filter(Boolean).sort((a, b) => +b! - +a!)[0];
	const latestPost = newest(entries.map((e) => e.data.updatedAt ?? e.data.publishedAt));
	const latestVideo = newest(videos.map((v) => v.published));

	const urls: { loc: string; lastmod?: Date }[] = [
		{ loc: '/', lastmod: newest([latestPost, latestVideo]) },
		{ loc: '/blog/', lastmod: latestPost },
		{ loc: '/videos/', lastmod: latestVideo },
		{ loc: '/tags/', lastmod: latestPost },
		{ loc: '/categories/', lastmod: latestPost },
		{ loc: '/about/' },
		...entries.map((e) => ({ loc: postHref(e.id), lastmod: e.data.updatedAt ?? e.data.publishedAt })),
		...videos.map((v) => ({ loc: videoHref(v.slug), lastmod: v.published })),
		...termIndex(entries, 'tag').map((t) => ({ loc: tagHref(t.slug), lastmod: t.latest.pubDate })),
		...termIndex(entries, 'category').map((t) => ({ loc: categoryHref(t.slug), lastmod: t.latest.pubDate })),
	];

	const body = urls
		.map(({ loc, lastmod }) => `  <url><loc>${origin}${loc}</loc>${lastmod ? `<lastmod>${new Date(lastmod).toISOString()}</lastmod>` : ''}</url>`)
		.join('\n');

	return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
};
