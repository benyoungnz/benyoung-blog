import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts } from '@data/posts';
import { site } from '@data/site';

export function GET(context: APIContext) {
  return rss({
    title: site.name,
    description: site.tagline,
    site: context.site!,
    items: [...posts]
      .sort((a, b) => +b.pubDate - +a.pubDate)
      .map((p) => ({ title: p.title, description: p.description, pubDate: p.pubDate, link: `/blog/${p.slug}/`, categories: p.tags })),
  });
}
