// The one adapter between EmDash and the site-kit components.
// Pages query EmDash, map entries through here, and hand the kit plain `Post`s.

import type { ContentEntry, PortableTextBlock } from 'emdash';
import { getEmDashCollection } from 'emdash';
import type { Post } from '@data/types';
import { getReadingTime } from '../utils/reading-time';

type Term = { slug: string; label: string };
type PostEntry = ContentEntry<Record<string, any>>;

export const postHref = (slug: string) => `/blog/${slug}/`;
export const tagHref = (slug: string) => `/tags/${slug}/`;
export const categoryHref = (slug: string) => `/categories/${slug}/`;

export function terms(entry: PostEntry, taxonomy: 'tag' | 'category'): Term[] {
	return (entry.data.terms?.[taxonomy] ?? []) as Term[];
}

export function toPost(entry: PostEntry): Post {
	const d = entry.data;
	const content = (d.content ?? []) as PortableTextBlock[];
	return {
		slug: entry.id,
		title: d.title,
		description: d.description ?? '',
		pubDate: d.publishedAt ?? d.createdAt,
		updatedDate: d.updated_date ?? undefined,
		tags: terms(entry, 'tag').map((t) => t.slug),
		image: d.featured_image?.id ? d.featured_image : null,
		coverTitle: d.cover_title || undefined,
		readingMinutes: content.length ? getReadingTime(content) : undefined,
	};
}

/**
 * Every published post, newest first. The blog is ~120 posts, so listing pages load the lot
 * and filter client-side (PostBrowser); pages are edge-cached, so D1 sees this once per publish.
 */
export async function allPosts(Astro: { cache?: { enabled?: boolean; set(hint: unknown): void } }) {
	const out: PostEntry[] = [];
	let cursor: string | undefined;
	do {
		const res = await getEmDashCollection('posts', { orderBy: { published_at: 'desc' }, limit: 100, cursor });
		if (Astro.cache?.enabled) Astro.cache.set(res.cacheHint);
		out.push(...(res.entries as PostEntry[]));
		cursor = res.nextCursor;
	} while (cursor);
	return out;
}

/** h2/h3 headings with stable ids, for the table of contents and heading anchors. */
export function headingsOf(content: PortableTextBlock[] | undefined) {
	const seen = new Map<string, number>();
	const out: { depth: number; slug: string; text: string; key: string }[] = [];
	for (const block of content ?? []) {
		const b = block as { _type: string; _key: string; style?: string; children?: { text?: string }[] };
		if (b._type !== 'block' || (b.style !== 'h2' && b.style !== 'h3')) continue;
		const text = (b.children ?? []).map((c) => c.text ?? '').join('').trim();
		if (!text) continue;
		let slug = slugify(text);
		const n = seen.get(slug) ?? 0;
		seen.set(slug, n + 1);
		if (n) slug = `${slug}-${n}`;
		out.push({ depth: Number(b.style.slice(1)), slug, text, key: b._key });
	}
	return out;
}

export function slugify(s: string) {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

export interface TermSummary {
	slug: string;
	label: string;
	count: number;
	latest: Post;
}

/** Terms in use on published posts, most-used first, with their newest post. */
export function termIndex(entries: PostEntry[], taxonomy: 'tag' | 'category'): TermSummary[] {
	const map = new Map<string, TermSummary>();
	for (const e of entries) {
		for (const t of terms(e, taxonomy)) {
			const cur = map.get(t.slug);
			if (cur) cur.count++;
			else map.set(t.slug, { slug: t.slug, label: t.label, count: 1, latest: toPost(e) });
		}
	}
	return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function postsWithTerm(entries: PostEntry[], taxonomy: 'tag' | 'category', slug: string) {
	return entries.filter((e) => terms(e, taxonomy).some((t) => t.slug === slug));
}
