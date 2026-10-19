// EmDash plugin: copies new uploads from Ben's YouTube channel into the `videos`
// collection. Runs hourly on EmDash's scheduler (driven by the Worker cron), and on
// demand via POST /_emdash/api/plugins/youtube-sync/sync (admin only).
//
// It only ever adds: videos already in EmDash are never changed or removed, so
// edits made in the admin stick, and unpublishing a video hides it for good.

import { definePlugin } from 'emdash';
import type { PluginContext } from 'emdash';
import { fetchChannelFeed } from '../lib/youtube-feed';

const SEEN_KEY = 'seen-ids';

async function sync(ctx: PluginContext) {
	const content = ctx.content as Required<NonNullable<PluginContext['content']>>;
	const feed = await fetchChannelFeed(ctx.http!.fetch.bind(ctx.http));

	// Every id ever imported, including ones since unpublished or deleted in the admin
	const seen = new Set<string>((await ctx.kv.get<string[]>(SEEN_KEY)) ?? []);
	if (seen.size === 0) {
		// First run (or lost KV): rebuild from the collection so nothing is duplicated
		let cursor: string | undefined;
		do {
			const page = await content.list('videos', { limit: 100, cursor });
			for (const item of page.items) seen.add(String(item.data.youtube_id));
			cursor = page.hasMore ? page.cursor : undefined;
		} while (cursor);
	}

	const added: string[] = [];
	for (const v of feed.sort((a, b) => +a.published - +b.published)) {
		if (seen.has(v.youtubeId)) continue;
		// EmDash derives the slug (the /videos/<slug>/ URL) from the title
		const created = await content.create('videos', {
			title: v.title,
			youtube_id: v.youtubeId,
			description: v.description,
			published_on: v.published.toISOString(),
			is_short: v.short,
		});
		const current = await content.getVersioned('videos', created.id);
		if (current) await content.publish('videos', created.id, { _rev: current._rev });
		seen.add(v.youtubeId);
		added.push(v.title);
	}

	await ctx.kv.set(SEEN_KEY, [...seen]);
	if (added.length) ctx.log.info(`Added ${added.length} video(s)`, { added });
	return { checked: feed.length, added };
}

export function createPlugin() {
	return definePlugin({
		id: 'youtube-sync',
		version: '1.0.0',
		capabilities: ['content:write', 'content:publish', 'network:request'],
		allowedHosts: ['www.youtube.com'],
		hooks: {
			'plugin:activate': async (_event, ctx) => {
				await ctx.cron!.schedule('youtube-sync', { schedule: '0 * * * *' });
			},
			cron: async (event, ctx) => {
				if (event.name === 'youtube-sync') await sync(ctx);
			},
		},
		routes: {
			sync: { handler: async (ctx) => sync(ctx) },
		},
	});
}

export default createPlugin;
