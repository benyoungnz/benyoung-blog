// Interlinking pass over the whole site. Two steps, like takeaways.ts:
//
//   node scripts/interlink.ts           # analyse → scripts/interlink-report.md (+ .cache JSON)
//   node scripts/interlink.ts --apply   # write related lists + link suggestions into EmDash
//
// What it does:
//   1. Embeds every post (OpenRouter text-embedding-3-small, 256 dims) and pushes the vectors to
//      the post-ai plugin, so saves made in the admin can find similar posts from then on.
//   2. Related: the 3 most similar posts for every post, and for every video.
//   3. Link suggestions: for posts whose link_suggestions field is empty, AI picks phrases in the
//      text worth linking to a similar post. These are suggestions for you to add by hand.
//   4. Report: orphans (no other post links to them) and posts with no internal links.
//
// Rerun it whenever you like; it's cheap. Same --url / EMDASH_TOKEN options as import.ts.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EmDashClient } from "emdash/client";
import { embed, embedText, formatLinkSuggestions, linkHrefs, nearest, NO_SUGGESTIONS, plainText, suggestLinks, type LinkSuggestion } from "../src/lib/ai.ts";

const root = join(import.meta.dirname, "..");
const env = Object.fromEntries(
	(existsSync(join(root, ".env")) ? readFileSync(join(root, ".env"), "utf8") : "")
		.split("\n")
		.filter((l) => /^[A-Z_]+=/.test(l))
		.map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const cfg = { apiKey: process.env.OPENROUTER_API_KEY ?? env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL ?? env.OPENROUTER_MODEL };

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const urlFlag = args.indexOf("--url");
const baseUrl = urlFlag >= 0 ? args[urlFlag + 1] : "http://localhost:4321";
const token = process.env.EMDASH_TOKEN;
const client = new EmDashClient(token ? { baseUrl, token } : { baseUrl, devBypass: true });
const api = <T = unknown>(method: string, path: string, body?: unknown): Promise<T> =>
	(client as unknown as { request: (m: string, p: string, b?: unknown) => Promise<T> }).request(method, path, body);

const cacheDir = join(import.meta.dirname, ".cache");
const planFile = join(cacheDir, "interlink.json");
const reportFile = join(import.meta.dirname, "interlink-report.md");
mkdirSync(cacheDir, { recursive: true });

interface Plan {
	posts: { id: string; slug: string; title: string; related: string[]; links?: LinkSuggestion[] }[];
	videos: { id: string; slug: string; title: string; related: string[] }[];
}

async function listAll(collection: string) {
	const out: Awaited<ReturnType<typeof client.list>>["items"] = [];
	let cursor: string | undefined;
	do {
		const page = await client.list(collection, { limit: 100, cursor });
		out.push(...page.items);
		cursor = page.nextCursor;
	} while (cursor);
	return out;
}

async function publishIfLive(collection: string, id: string, wasPublished: boolean) {
	if (wasPublished) await client.publish(collection, id);
}

if (apply) {
	const plan: Plan = JSON.parse(readFileSync(planFile, "utf8"));
	const live = new Map([...(await listAll("posts")), ...(await listAll("videos"))].map((i) => [i.id, i.status === "published"]));
	for (const p of plan.posts) {
		const data: Record<string, unknown> = { related: p.related };
		// "No suggestions" is stored as text so the save hook doesn't ask again on every save
		if (p.links) data.link_suggestions = p.links.length ? formatLinkSuggestions(p.links) : NO_SUGGESTIONS;
		await api("PUT", `/content/posts/${encodeURIComponent(p.id)}`, { data });
		await publishIfLive("posts", p.id, live.get(p.id) ?? false);
	}
	for (const v of plan.videos) {
		await api("PUT", `/content/videos/${encodeURIComponent(v.id)}`, { data: { related_posts: v.related } });
		await publishIfLive("videos", v.id, live.get(v.id) ?? false);
	}
	console.log(`Applied: ${plan.posts.length} posts, ${plan.videos.length} videos.`);
	process.exit(0);
}

if (!cfg.apiKey) throw new Error("OPENROUTER_API_KEY is not set (web/.env)");

// 1. Load posts with their bodies, and embed them
const items = (await listAll("posts")).filter((i) => i.status === "published");
const posts = [];
for (const item of items) {
	const full = await client.get("posts", item.id, { raw: true });
	const content = (full.data.content as unknown[]) ?? [];
	posts.push({
		id: item.id,
		slug: item.slug ?? item.id,
		title: String(full.data.title),
		description: String(full.data.description ?? ""),
		content,
		text: plainText(content),
		hasSuggestions: Boolean(String(full.data.link_suggestions ?? "").trim()),
		storedSuggestions: String(full.data.link_suggestions ?? "").trim(),
	});
}
console.log(`Embedding ${posts.length} posts…`);
const vectors: number[][] = [];
for (let i = 0; i < posts.length; i += 50) vectors.push(...(await embed(cfg, posts.slice(i, i + 50).map((p) => embedText(p)))));
const pool = posts.map((p, i) => ({ key: p.id, slug: p.slug, title: p.title, description: p.description, v: vectors[i] }));

await api("POST", "/plugins/post-ai/vectors", { items: pool.map(({ key, ...rest }) => ({ id: key, ...rest })) });

// 2. Related posts for posts and videos
const plan: Plan = { posts: [], videos: [] };
for (const p of pool) plan.posts.push({ id: p.key, slug: p.slug, title: p.title, related: nearest(p.v, pool, 3, p.key).map((r) => r.item.slug) });

const videos = await listAll("videos");
const videoVecs = await embed(cfg, videos.map((v) => `${v.data.title}\n${String(v.data.description ?? "")}`));
videos.forEach((v, i) => plan.videos.push({ id: v.id, slug: v.slug ?? v.id, title: String(v.data.title), related: nearest(videoVecs[i], pool, 3).map((r) => r.item.slug) }));

// 3. Link suggestions where the field is empty
const todo = posts.filter((p) => !p.hasSuggestions && p.text.length >= 1500);
console.log(`Suggesting links for ${todo.length} posts…`);
const queue = [...todo];
await Promise.all(
	Array.from({ length: 4 }, async () => {
		for (let p = queue.shift(); p; p = queue.shift()) {
			const me = pool.find((x) => x.key === p.id)!;
			const candidates = nearest(me.v, pool, 12, p.id, 0.35).map((r) => r.item);
			try {
				const links = await suggestLinks(cfg, { title: p.title, text: p.text, existingHrefs: linkHrefs(p.content) }, candidates);
				plan.posts.find((x) => x.id === p.id)!.links = links;
				console.log(`${links.length ? "✓" : "–"} ${p.slug} (${links.length})`);
			} catch (err) {
				console.error(`✗ ${p.slug}: ${err instanceof Error ? err.message : err}`);
			}
		}
	}),
);

// 4. Orphans and dead ends, from links already in the posts
const slugs = new Set(posts.map((p) => p.slug));
const inbound = new Map(posts.map((p) => [p.slug, 0]));
const outbound = new Map<string, number>();
for (const p of posts) {
	const targets = new Set(
		linkHrefs(p.content)
			// Canonical /blog/<slug>/ links, plus Ghost-era /<slug>/ ones that still resolve via redirects
			.map((h) => h.match(/^(?:https?:\/\/(?:www\.)?benyoung\.blog)?\/(?:blog\/)?([a-z0-9-]+)\/?(?:#.*)?$/i)?.[1]?.toLowerCase())
			.filter((s): s is string => Boolean(s && slugs.has(s) && s !== p.slug)),
	);
	outbound.set(p.slug, targets.size);
	for (const t of targets) inbound.set(t, (inbound.get(t) ?? 0) + 1);
}
const orphans = posts.filter((p) => !inbound.get(p.slug));
const deadEnds = posts.filter((p) => !outbound.get(p.slug));

writeFileSync(planFile, JSON.stringify(plan, null, 2));
const titleOf = new Map(posts.map((p) => [p.slug, p.title]));
const withLinks = plan.posts.filter((p) => p.links?.length);
// Suggestions already in EmDash from earlier runs or saves (not regenerated, so not in the plan)
const stored = posts.filter((p) => p.storedSuggestions && !p.storedSuggestions.startsWith(NO_SUGGESTIONS));
const storedCount = stored.reduce((n, p) => n + p.storedSuggestions.split("\n").length, 0);
writeFileSync(
	reportFile,
	`# Interlinking report

Generated by \`node scripts/interlink.ts\`. Apply related lists and suggestions with \`node scripts/interlink.ts --apply\`. Suggestions land in each post's "Internal link suggestions" field in the admin; nothing is linked automatically.

- Posts: ${posts.length}. Videos: ${videos.length}.
- **Orphans** (no other post links to them): ${orphans.length}
- **No internal links out**: ${deadEnds.length}
- New link suggestions this run: ${withLinks.length} posts (${withLinks.reduce((n, p) => n + p.links!.length, 0)} suggestions)
- Suggestions already in the admin, not yet acted on: ${stored.length} posts (${storedCount} suggestions)

## New link suggestions

${withLinks.map((p) => `### [${p.title}](/blog/${p.slug}/)\n\n${p.links!.map((l) => `- "${l.phrase}" → [${l.title}](/blog/${l.slug}/). ${l.why}`).join("\n")}\n`).join("\n") || "None this run.\n"}
## Suggestions in the admin

Each post's "Internal link suggestions" field. Add the links you like, then clear the field.

${stored.map((p) => `### [${p.title}](/blog/${p.slug}/)\n\n${p.storedSuggestions.split("\n").map((l) => `- ${l}`).join("\n")}\n`).join("\n")}
## Related posts

| Post | Related |
|---|---|
${plan.posts.map((p) => `| [${p.title}](/blog/${p.slug}/) | ${p.related.map((s) => `[${titleOf.get(s)}](/blog/${s}/)`).join("<br>")} |`).join("\n")}

## Related posts for videos

| Video | Related posts |
|---|---|
${plan.videos.map((v) => `| [${v.title}](/videos/${v.slug}/) | ${v.related.map((s) => `[${titleOf.get(s)}](/blog/${s}/)`).join("<br>") || "–"} |`).join("\n")}

## Orphans

${orphans.map((p) => `- [${p.title}](/blog/${p.slug}/)`).join("\n")}
`,
);
console.log(`\nReport: scripts/interlink-report.md. ${orphans.length} orphans, ${deadEnds.length} with no links out, ${withLinks.length} posts with suggestions.`);
