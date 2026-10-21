// EmDash plugin: AI help for posts and videos, all at save time (never while rendering).
//
// Posts (content:beforeSave, same write as the editor's save):
//   - key_takeaways: written when the field is empty. Edit freely; clear and save to regenerate.
//   - related: the 3 most similar posts, recomputed on every save from stored embeddings.
//   - link_suggestions: internal links worth adding by hand, written when the field is empty.
// Videos: related_posts, from the video's title and description.
//
// Embeddings live in this plugin's KV ("vec:<entry id>"). The save hook keeps a post's own vector
// current; scripts/interlink.ts backfills every post in bulk through the `vectors` route.
// Stubs under ~1,500 characters aren't summarised, and a failed AI call never blocks a save.
//
// Needs OPENROUTER_API_KEY (optionally OPENROUTER_MODEL) as Worker secrets / in web/.env.

import { env } from 'cloudflare:workers';
import { definePlugin } from 'emdash';
import type { PluginContext } from 'emdash';
import {
	type AiConfig,
	embed,
	embedText,
	formatLinkSuggestions,
	formatTakeaways,
	generateTakeaways,
	linkHrefs,
	nearest,
	NO_SUGGESTIONS,
	plainText,
	suggestLinks,
} from '../lib/ai';

const MIN_CHARS = 1500;

export interface StoredVector {
	slug: string;
	title: string;
	description?: string;
	v: number[];
}

const vars = () => env as unknown as { OPENROUTER_API_KEY?: string; OPENROUTER_MODEL?: string };
const aiConfig = (ctx: PluginContext): AiConfig | null => {
	const { OPENROUTER_API_KEY, OPENROUTER_MODEL } = vars();
	return OPENROUTER_API_KEY ? { apiKey: OPENROUTER_API_KEY, model: OPENROUTER_MODEL, fetch: ctx.http!.fetch.bind(ctx.http) } : null;
};

async function postVectors(ctx: PluginContext) {
	const rows = await ctx.kv.list('vec:');
	return rows.map(({ key, value }) => ({ key: key.slice(4), ...(value as StoredVector) }));
}

const isBlank = (v: unknown) => !(typeof v === 'string' && v.trim());

// Vectors computed in beforeSave, picked up by afterSave (which knows the saved id and slug)
const pending = new Map<string, number[]>();

async function beforeSavePost(draft: Record<string, unknown>, id: string | undefined, ctx: PluginContext) {
	const cfg = aiConfig(ctx);
	// Partial updates (e.g. scripts writing only the AI fields) carry no body: nothing to do
	if (!cfg || !Array.isArray(draft.content)) return;
	const text = plainText(draft.content);
	const title = String(draft.title ?? '');
	const description = String(draft.description ?? '');
	const out: Record<string, unknown> = {};

	const stored = id ? await ctx.content?.get('posts', id) : null;
	const current = (field: string) => (draft[field] !== undefined ? draft[field] : stored?.data[field]);

	const work: Promise<void>[] = [];

	if (isBlank(current('key_takeaways')) && text.length >= MIN_CHARS) {
		work.push(
			generateTakeaways(cfg, { title, description, text }).then((items) => {
				if (items.length) out.key_takeaways = formatTakeaways(items);
			}),
		);
	}

	work.push(
		(async () => {
			const [v] = await embed(cfg, [embedText({ title, description, text })]);
			pending.set(title, v);
			const pool = await postVectors(ctx);
			out.related = nearest(v, pool, 3, id).map((r) => r.item.slug);

			if (isBlank(current('link_suggestions')) && text.length >= MIN_CHARS) {
				const candidates = nearest(v, pool, 12, id, 0.35).map((r) => r.item);
				const links = await suggestLinks(cfg, { title, text, existingHrefs: linkHrefs(draft.content as unknown[]) }, candidates);
				out.link_suggestions = links.length ? formatLinkSuggestions(links) : NO_SUGGESTIONS;
			}
		})(),
	);

	const results = await Promise.allSettled(work);
	for (const r of results) if (r.status === 'rejected') ctx.log.warn('AI step failed; saving without it', { error: String(r.reason) });
	return Object.keys(out).length ? { ...draft, ...out } : undefined;
}

async function beforeSaveVideo(draft: Record<string, unknown>, ctx: PluginContext) {
	const cfg = aiConfig(ctx);
	if (!cfg || typeof draft.title !== 'string') return;
	try {
		const [v] = await embed(cfg, [`${draft.title}\n${String(draft.description ?? '')}`]);
		const related = nearest(v, await postVectors(ctx), 3, undefined, 0.3).map((r) => r.item.slug);
		return { ...draft, related_posts: related };
	} catch (err) {
		ctx.log.warn('Video related posts failed', { error: String(err) });
	}
}

export function createPlugin() {
	return definePlugin({
		id: 'post-ai',
		version: '1.1.0',
		// content:write is what lets a beforeSave hook change the saved data
		capabilities: ['content:write', 'network:request'],
		allowedHosts: ['openrouter.ai'],
		hooks: {
			'content:beforeSave': {
				timeout: 40000,
				errorPolicy: 'continue',
				handler: async (event, ctx) => {
					if (event.collection === 'posts') return beforeSavePost(event.content, event.id, ctx);
					if (event.collection === 'videos') return beforeSaveVideo(event.content, ctx);
				},
			},
			'content:afterSave': {
				errorPolicy: 'continue',
				handler: async (event, ctx) => {
					if (event.collection !== 'posts') return;
					const c = event.content as { id?: string; slug?: string; title?: string; description?: string };
					const v = c.title ? pending.get(c.title) : undefined;
					if (!c.id || !c.slug || !v) return;
					pending.delete(c.title!);
					await ctx.kv.set(`vec:${c.id}`, { slug: c.slug, title: c.title!, description: c.description, v } satisfies StoredVector);
				},
			},
		},
		routes: {
			// Bulk upsert from scripts/interlink.ts: { items: [{ id, slug, title, description, v }] }
			vectors: {
				handler: async (ctx) => {
					const { items } = (ctx.input ?? {}) as { items?: (StoredVector & { id: string })[] };
					for (const { id, ...rest } of items ?? []) await ctx.kv.set(`vec:${id}`, rest);
					return { stored: items?.length ?? 0 };
				},
			},
		},
	});
}

export default createPlugin;
