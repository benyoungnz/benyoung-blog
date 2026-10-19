// Imports posts from the old blog into EmDash.
//
//   node scripts/import.ts [--url http://localhost:4321] [--all | slug ...]
//
// Local dev authenticates through EmDash's dev bypass. Against a deployed site, pass
// EMDASH_TOKEN (an API token from admin → Settings → API tokens).
// Idempotent: posts are matched by slug and updated; uploaded images are cached in
// scripts/.cache/media-<host>.json so reruns don't upload them again.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { EmDashClient } from "emdash/client";
import { markdownToPortableText } from "./lib/md-to-pt.ts";
import { localImagePath, readLegacyPosts, type LegacyPost } from "./lib/legacy.ts";

// A spread of the edge cases the full migration has to handle
export const PILOT = [
	"the-orthodontist-who-gets-it-and-the-colleagues-who-dont-ransomware", // recent opinion, custom slug, hero image
	"mcp-backdoor-ai-supply-chain-vulnerability-security-tricks", // custom slug, code
	"japans-new-active-cyber-defense-bill-a-dual-track-strategy", // empty slug in frontmatter
	"api-changes-in-veeam-backup-for-office365-v5", // long API post, broken inline code
	"creating-a-christmas-cracker-alarm-dashboard-for-veeamone", // unbalanced code fences
	"introducing-the-veeam100-vlog-i-need-your-help", // video post with lost embeds
	"setting-up-a-kubernetes-cluster-with-k3s-and-k3os-via-cloud-init", // code-heavy
	"synology-hat5300-enterprise-sata-performance-benchmark", // image/table heavy
	"carplay-or-android-auto-veeam-dashboard-concept", // iframe/embed
	"8-cool-things-you-do-with-the-veeam-one-api", // unfenced indented code
];

const args = process.argv.slice(2);
const urlFlag = args.indexOf("--url");
const baseUrl = urlFlag >= 0 ? args[urlFlag + 1] : "http://localhost:4321";
const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--url");
const wanted = args.includes("--all") ? null : new Set(positional.length ? positional : PILOT);

const token = process.env.EMDASH_TOKEN;
const client = new EmDashClient(token ? { baseUrl, token } : { baseUrl, devBypass: true });
// The typed client doesn't expose publishedAt or bylines on create/update yet; use its
// (TS-private) JSON request helper for those calls. Returns the unwrapped `data`.
const api = <T = unknown>(method: string, path: string, body?: unknown): Promise<T> =>
	(client as unknown as { request: (m: string, p: string, b?: unknown) => Promise<T> }).request(method, path, body);

const cacheDir = join(import.meta.dirname, ".cache");
const cacheFile = join(cacheDir, `media-${new URL(baseUrl).host.replace(/[^a-z0-9]+/gi, "_")}.json`);
mkdirSync(cacheDir, { recursive: true });
const mediaCache: Record<string, { id: string; key: string; width?: number; height?: number; mimeType: string; filename: string }> =
	existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, "utf8")) : {};

async function upload(src: string, alt: string) {
	const cached = mediaCache[src];
	if (cached?.key) return cached;
	if (cached) {
		// Older cache entries predate storing the storage key; look it up rather than re-upload
		const item = (await client.mediaGet(cached.id)) as unknown as { storageKey?: string; key?: string };
		cached.key = item.storageKey ?? item.key ?? "";
		writeFileSync(cacheFile, JSON.stringify(mediaCache, null, 2));
		return cached;
	}
	let bytes: Uint8Array;
	let filename: string;
	if (/^https?:\/\//.test(src)) {
		// External hero images (old Unsplash links): copy them in so the site doesn't hotlink
		const res = await fetch(src);
		if (!res.ok) return null;
		bytes = new Uint8Array(await res.arrayBuffer());
		const ext = (res.headers.get("content-type") ?? "image/jpeg").split("/")[1].split(";")[0].replace("jpeg", "jpg");
		filename = `${new URL(src).pathname.split("/").filter(Boolean).pop() ?? "image"}.${ext}`;
	} else {
		const file = localImagePath(src);
		if (!file || !existsSync(file)) return null;
		bytes = readFileSync(file);
		filename = basename(file);
	}
	const item = await client.mediaUpload(bytes, filename, { alt });
	// The upload response names it storageKey (the typed MediaItem still says key)
	const key = (item as unknown as { storageKey?: string }).storageKey ?? item.key;
	mediaCache[src] = { id: item.id, key, width: item.width, height: item.height, mimeType: item.mimeType, filename: item.filename };
	writeFileSync(cacheFile, JSON.stringify(mediaCache, null, 2));
	return mediaCache[src];
}

const report: { slug: string; status: string; warnings: string[] }[] = [];

async function importPost(p: LegacyPost, bylineId: string | undefined) {
	const warnings: string[] = [];

	// Upload body images first, then convert with real media references
	const imageSrcs = [...p.body.matchAll(/!\[([^\]]*)\]\(([^)\s]+)/g)].map((m) => ({ alt: m[1], src: m[2] }));
	const uploaded = new Map<string, Awaited<ReturnType<typeof upload>>>();
	for (const { src, alt } of imageSrcs) {
		if (uploaded.has(src)) continue;
		const media = src.startsWith("/") ? await upload(src, alt) : null;
		if (src.startsWith("/") && !media) warnings.push(`missing image ${src}`);
		uploaded.set(src, media);
	}

	const content = markdownToPortableText(p.body, {
		warn: (w) => warnings.push(w),
		imageAsset: (src) => {
			const media = uploaded.get(src);
			return media ? { _ref: media.id, url: `/_emdash/api/media/file/${media.key}`, width: media.width, height: media.height } : { _ref: "", url: src };
		},
	});
	// Width/height belong on the block for Astro's image service
	for (const b of content) {
		const asset = b.asset as { width?: number; height?: number } | undefined;
		if (b._type === "image" && asset?.width) Object.assign(b, { width: asset.width, height: asset.height });
	}

	let featured_image: Record<string, unknown> | undefined;
	if (p.heroImage) {
		const media = await upload(p.heroImage, p.title);
		if (media) {
			featured_image = { provider: "local", id: media.id, alt: "", width: media.width, height: media.height, mimeType: media.mimeType, filename: media.filename, meta: { storageKey: media.key } };
		} else {
			warnings.push(`hero image not uploaded: ${p.heroImage}`);
		}
	}

	const data = {
		title: p.title,
		description: p.description,
		content,
		...(featured_image ? { featured_image } : {}),
		...(p.updatedDate ? { updated_date: p.updatedDate.toISOString() } : {}),
		legacy_path: `/blog/${p.slug}/`,
	};
	const taxonomies = { category: p.category ? [p.category.slug] : [], tag: p.tags.map((t) => t.slug) };

	const existing = await client.get("posts", p.slug).catch(() => null);
	if (existing) {
		await api("PUT", `/content/posts/${encodeURIComponent(existing.id)}`, {
			data,
			taxonomies,
			publishedAt: p.pubDate.toISOString(),
			...(bylineId ? { bylines: [{ bylineId }] } : {}),
		});
		await client.publish("posts", existing.id);
		report.push({ slug: p.slug, status: "updated", warnings });
	} else {
		const res = await api<{ item: { id: string } }>("POST", "/content/posts", {
			data,
			slug: p.slug,
			taxonomies,
			publishedAt: p.pubDate.toISOString(),
			...(bylineId ? { bylines: [{ bylineId }] } : {}),
		});
		await client.publish("posts", res.item.id);
		report.push({ slug: p.slug, status: "created", warnings });
	}
}

async function ensureTerms(posts: LegacyPost[]) {
	const existing = new Set((await client.terms("tag", { limit: 500 })).items.map((t) => t.slug));
	const tags = new Map(posts.flatMap((p) => p.tags).map((t) => [t.slug, t.label]));
	for (const [slug, label] of tags) {
		if (!existing.has(slug)) await client.createTerm("tag", { slug, label });
	}
}

const posts = readLegacyPosts().filter((p) => !wanted || wanted.has(p.slug));
if (wanted && posts.length !== wanted.size) {
	const found = new Set(posts.map((p) => p.slug));
	console.warn("Not found:", [...wanted].filter((s) => !found.has(s)));
}

const bylines = await api<{ items?: { id: string; slug: string }[] }>("GET", "/admin/bylines?limit=50").catch(() => null);
const bylineId = bylines?.items?.find((b) => b.slug === "ben-young")?.id;
if (!bylineId) console.warn("No ben-young byline found; posts will have no byline");

await ensureTerms(posts);
for (const p of posts) {
	try {
		await importPost(p, bylineId);
		console.log(`✓ ${p.slug}`);
	} catch (err) {
		report.push({ slug: p.slug, status: `failed: ${err instanceof Error ? err.message : err}`, warnings: [] });
		console.error(`✗ ${p.slug}:`, err);
	}
}

writeFileSync(join(cacheDir, "import-report.json"), JSON.stringify(report, null, 2));
const failed = report.filter((r) => r.status.startsWith("failed"));
console.log(`\n${report.length - failed.length}/${report.length} imported. Warnings: ${report.reduce((n, r) => n + r.warnings.length, 0)}. Report: scripts/.cache/import-report.json`);
if (failed.length) process.exit(1);
