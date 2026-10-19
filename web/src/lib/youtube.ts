// Videos from Ben's YouTube channel (@benyoungrambles), for the /videos/ section.
//
// Source today: the channel's public RSS feed, which carries the latest 15 uploads and
// needs no key. Pages are edge-cached (routeRules in astro.config.mjs), so YouTube sees
// one request per cache refresh, not one per visitor.
//
// Later: add a `fromApi()` source using the YouTube Data API v3 (channel's uploads
// playlist, paged) when YOUTUBE_API_KEY is set, and pick it in `getVideos()`.
// Everything else (pages, cards) only depends on the `Video` shape below.

export const CHANNEL = {
	id: 'UCdHU76kSi4Rj5X9PrMU2aug',
	handle: '@benyoungrambles',
	url: 'https://www.youtube.com/@benyoungrambles',
};

export interface Video {
	id: string;
	title: string;
	description: string;
	published: Date;
	thumbnail: string;
	views?: number;
	/** YouTube Shorts (vertical); the feed links these as /shorts/<id> */
	short: boolean;
	url: string;
}

export const videoHref = (id: string) => `/videos/${id}/`;

export async function getVideos(): Promise<{ videos: Video[]; error?: string }> {
	try {
		return { videos: await fromRss() };
	} catch (err) {
		// A YouTube hiccup shouldn't take the page down; the page shows a link to the channel instead
		console.error('[videos] feed failed:', err);
		return { videos: [], error: err instanceof Error ? err.message : String(err) };
	}
}

async function fromRss(): Promise<Video[]> {
	const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL.id}`, {
		signal: AbortSignal.timeout(5000),
		headers: { 'User-Agent': 'benyoung.blog' },
	});
	if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);
	const xml = await res.text();

	return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
		.map(([, entry]) => {
			const tag = (name: string) => decode(entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '');
			const attr = (name: string, a: string) => entry.match(new RegExp(`<${name}[^>]*\\s${a}="([^"]*)"`))?.[1];
			const id = tag('yt:videoId');
			const link = attr('link', 'href') ?? `https://www.youtube.com/watch?v=${id}`;
			const views = attr('media:statistics', 'views');
			return {
				id,
				title: tag('title'),
				description: tag('media:description'),
				published: new Date(tag('published')),
				// The feed's hqdefault is 4:3 with letterboxing; mqdefault is a true 16:9 frame
				thumbnail: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
				views: views ? Number(views) : undefined,
				short: link.includes('/shorts/'),
				url: link,
			};
		})
		.filter((v) => v.id)
		.sort((a, b) => +b.published - +a.published);
}

function decode(s: string) {
	return s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, '&');
}

export const formatViews = (n?: number) =>
	n === undefined ? undefined : `${n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : n} ${n === 1 ? 'view' : 'views'}`;
