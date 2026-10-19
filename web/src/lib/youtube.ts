// Videos for the /videos/ section, read from the EmDash `videos` collection.
// The youtube-sync plugin (src/plugins/youtube-sync.ts) fills that collection from the
// channel feed every hour, so pages never call YouTube and videos never drop off.

import { getEmDashCollection } from 'emdash';
import type { ContentEntry } from 'emdash';
export { CHANNEL } from './youtube-feed';

export interface Video {
	/** EmDash slug, generated from the title: /videos/<slug>/ */
	slug: string;
	/** YouTube video id */
	id: string;
	title: string;
	description: string;
	published: Date;
	thumbnail: string;
	short: boolean;
	url: string;
	/** Post slugs picked by the post-ai plugin / scripts/interlink.ts */
	relatedPosts: string[];
}

type CacheTarget = { cache?: { enabled?: boolean; set(hint: unknown): void } };
type VideoEntry = ContentEntry<Record<string, any>>;

export const videoHref = (slug: string) => `/videos/${slug}/`;

export function toVideo(entry: VideoEntry): Video {
	const d = entry.data;
	const id = String(d.youtube_id);
	return {
		slug: entry.id,
		id,
		title: d.title,
		description: d.description ?? '',
		// Custom datetime fields come back as ISO strings; system dates are Dates
		published: new Date(d.published_on ?? d.publishedAt ?? d.createdAt),
		// mqdefault is a true 16:9 frame (hqdefault is letterboxed 4:3)
		thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
		short: Boolean(d.is_short),
		url: d.is_short ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`,
		relatedPosts: Array.isArray(d.related_posts) ? d.related_posts : [],
	};
}

/** Every published video, newest upload first. */
export async function getVideos(Astro: CacheTarget): Promise<Video[]> {
	const out: VideoEntry[] = [];
	let cursor: string | undefined;
	do {
		const res = await getEmDashCollection('videos', { limit: 100, cursor });
		if (Astro.cache?.enabled) Astro.cache.set(res.cacheHint);
		out.push(...(res.entries as VideoEntry[]));
		cursor = res.nextCursor;
	} while (cursor);
	return out.map(toVideo).sort((a, b) => +b.published - +a.published);
}
