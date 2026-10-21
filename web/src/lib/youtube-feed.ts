// Reads Ben's YouTube channel feed. Shared by the sync plugin (writes new videos into
// EmDash) and nothing else: pages read the EmDash `videos` collection, never YouTube.
//
// The RSS feed lists the latest 15 uploads and needs no key. To backfill older uploads,
// swap in the YouTube Data API (channel uploads playlist, paged) behind the same shape.

export const CHANNEL = {
	id: 'UCdHU76kSi4Rj5X9PrMU2aug',
	handle: '@benyoungrambles',
	url: 'https://www.youtube.com/@benyoungrambles',
};

export interface FeedVideo {
	youtubeId: string;
	title: string;
	description: string;
	published: Date;
	/** YouTube Shorts; the feed links these as /shorts/<id> */
	short: boolean;
}

export async function fetchChannelFeed(fetchImpl: (url: string, init?: RequestInit) => Promise<Response> = fetch): Promise<FeedVideo[]> {
	const res = await fetchImpl(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL.id}`, {
		headers: { 'User-Agent': 'benyoung.blog' },
	});
	if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);
	const xml = await res.text();

	return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
		.map(([, entry]) => {
			const tag = (name: string) => decode(entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '');
			const link = entry.match(/<link[^>]*\shref="([^"]*)"/)?.[1] ?? '';
			return {
				youtubeId: tag('yt:videoId'),
				title: tag('title'),
				description: tag('media:description'),
				published: new Date(tag('published')),
				short: link.includes('/shorts/'),
			};
		})
		.filter((v) => v.youtubeId);
}

function decode(s: string) {
	return s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');
}
