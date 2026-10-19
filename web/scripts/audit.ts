// Audits every post in the old blog (repo root src/content/blog) before import.
//
//   node web/scripts/audit.ts            lint only, writes audit-report.md/.json
//   node web/scripts/audit.ts --fetch    also recover lost embeds from the live site and the
//                                        Wayback Machine's Ghost-era copy (cached, ~1 req/s)
//   node web/scripts/audit.ts --fix      also apply the mechanical fixes to the .md files
//
// Recovered embeds are kept in recovered-embeds.json and applied fixes in audit-fixes.json,
// both next to this script, so the report can be rebuilt without the network and still shows
// what an earlier --fix pass changed. Never renames files or touches slugs.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Nodes, Code, Html, Link, Image, Text, InlineCode } from "mdast";
import { LEGACY_POSTS, LEGACY_ROOT, localImagePath, readLegacyPosts, termSlug, type LegacyPost } from "./lib/legacy.ts";

const HERE = import.meta.dirname;
const CACHE = join(HERE, ".cache/audit");
const EMBEDS_FILE = join(HERE, "recovered-embeds.json");
const FIXES_FILE = join(HERE, "audit-fixes.json");
const REPORT_MD = join(HERE, "audit-report.md");
const REPORT_JSON = join(HERE, "audit-report.json");

const args = process.argv.slice(2);
const FETCH = args.includes("--fetch");
const FIX = args.includes("--fix");

// ── Types ──────────────────────────────────────────────────────────────────────

type IssueType =
	| "unbalanced-fence"
	| "broken-inline-code"
	| "indented-code"
	| "indented-prose"
	| "code-stray-indent"
	| "broken-emphasis"
	| "html-entity"
	| "raw-html"
	| "truncated-description"
	| "missing-image"
	| "external-image"
	| "dead-internal-link"
	| "ghost-root-link"
	| "blank-line-run"
	| "video-no-embed"
	| "lost-embed";

interface Issue {
	type: IssueType;
	line?: number;
	detail: string;
}

interface Embed {
	kind: "youtube" | "iframe" | "gist" | "tweet";
	url: string;
	/** Visible text just before the embed on the Ghost page, used to place it in the Markdown */
	anchor: string;
	source: string;
}

interface EmbedRecord {
	slug: string;
	checked: string[];
	embeds: Embed[];
	note?: string;
}

interface FixLog {
	[slug: string]: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const parse = (md: string) => unified().use(remarkParse).use(remarkGfm).parse(md) as Root;

function walk(node: Nodes, fn: (n: Nodes, parents: Nodes[]) => void, parents: Nodes[] = []) {
	fn(node, parents);
	if ("children" in node) for (const c of node.children as Nodes[]) walk(c, fn, [...parents, node]);
}

const ENTITIES: Record<string, string> = {
	lt: "<", gt: ">", amp: "&", quot: '"', apos: "'", nbsp: " ", mdash: "—", ndash: "–",
	minus: "−", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", copy: "©", reg: "®",
	trade: "™", times: "×", bull: "•", middot: "·",
};
const ENTITY_RE = /&(#\d+|#x[0-9a-f]+|[a-z]+);/gi;
const decodeEntity = (ent: string): string | undefined => {
	const name = ent.slice(1, -1);
	if (name[0] === "#") {
		const cp = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
		return Number.isFinite(cp) ? String.fromCodePoint(cp) : undefined;
	}
	return ENTITIES[name.toLowerCase()];
};

/** Letters and digits only, for fuzzy matching text across HTML and Markdown */
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fenceRe = /^(\s*)(`{3,}|~{3,})/;

/** Inline tags that are plausibly real HTML in a post; anything else inline is a pseudo-tag in prose */
const INLINE_HTML = new Set(["br", "sup", "sub", "kbd", "b", "i", "em", "strong", "u", "s", "mark", "small", "span", "code", "a", "img", "del", "ins", "abbr"]);

/** Line numbers (0-based, in body) that are inside or on a fenced block, by a simple line scan */
function fencedLines(lines: string[]) {
	const inside = new Set<number>();
	let open: string | null = null;
	lines.forEach((l, i) => {
		const m = l.match(fenceRe);
		if (m && m[1].length < 4) {
			if (!open) open = m[2][0];
			else if (m[2][0] === open) {
				inside.add(i);
				open = null;
				return;
			}
		}
		if (open) inside.add(i);
	});
	return inside;
}

// ── Site map of the old blog: what URLs it served ──────────────────────────────

function oldSiteRoutes(posts: LegacyPost[]) {
	const slugs = new Set(posts.map((p) => p.slug));
	const tags = new Set<string>();
	const categories = new Set<string>();
	for (const p of posts) {
		p.tags.forEach((t) => tags.add(t.slug));
		if (p.category) categories.add(p.category.slug);
	}
	const redirects = new Map<string, string>();
	for (const line of readFileSync(join(LEGACY_ROOT, "public/_redirects"), "utf8").split("\n")) {
		const m = line.trim().match(/^(\/\S*)\s+(\/\S*)/);
		if (m) redirects.set(m[1].replace(/\/$/, ""), m[2]);
	}
	return { slugs, tags, categories, redirects };
}
type Routes = ReturnType<typeof oldSiteRoutes>;

// ── Checks ─────────────────────────────────────────────────────────────────────

const VIDEOISH = /\b(videos?|youtube|vlogs?|iframes?|gists?|tweets?|vimeo|webinar)\b/i;
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

interface Audit {
	issues: Issue[];
	tool: string[];
	suggestedDescription?: string;
}

function auditPost(post: LegacyPost, body: string, lineOffset: number, routes: Routes): Audit {
	const issues: Issue[] = [];
	const tool = new Set<string>();
	const lines = body.split("\n");
	const at = (offset: number) => body.slice(0, offset).split("\n").length + lineOffset;
	const lineAt = (l: number) => l + lineOffset;
	const tree = parse(body);
	const fenced = fencedLines(lines);

	// Fences: odd count of real fences, or ``` lines that sit inside an indented block (Ghost cascade)
	const realFences = lines.map((l, i) => [l.match(fenceRe), i] as const).filter(([m]) => m && m[1].length < 4);
	if (realFences.length % 2) issues.push({ type: "unbalanced-fence", line: lineAt(realFences.at(-1)![1] + 1), detail: `${realFences.length} fence lines (odd)` });
	// Fence markers that ended up inside another block render as literal ``` (Ghost cascade, indented closers)
	walk(tree, (n) => {
		const v = n.type === "code" ? (n as Code).value : n.type === "text" ? (n as Text).value : "";
		if (/^\s*(```|~~~)/m.test(v)) issues.push({ type: "unbalanced-fence", line: at(n.position!.start.offset!), detail: "fence marker rendered as literal text inside another block" });
	});

	let videoText = "";
	let hasEmbed = false;
	const codeLangs: { lang: string; lines: number }[] = [];
	const proseText: string[] = [];

	walk(tree, (node, parents) => {
		const pos = node.position?.start.offset ?? 0;
		switch (node.type) {
			case "text": {
				const t = (node as Text).value;
				proseText.push(t);
				videoText += " " + t;
				if (t.includes("`")) issues.push({ type: "broken-inline-code", line: at(pos), detail: `stray backtick: “${snippet(t, t.indexOf("`"))}”` });
				if (/\*\*|__/.test(t)) issues.push({ type: "broken-emphasis", line: at(pos), detail: `literal ** or __: “${snippet(t, t.search(/\*\*|__/))}”` });
				else if (/(^|\s)[*_]\S[^*_]*\S\s+[*_](\s|$|[.,;:!?)])/.test(t) || /(^|\s)[*_]\s+\S[^*_]*[*_](\s|$)/.test(t))
					issues.push({ type: "broken-emphasis", line: at(pos), detail: `literal * or _: “${snippet(t, t.search(/[*_]/))}”` });
				break;
			}
			case "code": {
				const c = node as Code;
				const src = body.slice(c.position!.start.offset, c.position!.end.offset);
				const isFenced = /^\s*(```|~~~)/.test(src);
				const n = c.value.split("\n").length;
				codeLangs.push({ lang: (c.lang ?? "").toLowerCase(), lines: n });
				if (!isFenced) {
					// Prose that ended up indented (e.g. after a Ghost code card) reads as sentences
					const words = c.value.split(/\s+/).filter(Boolean).length;
					const sentences = (c.value.match(/[a-z]{3,}[.!?](\s|$)/gi) ?? []).length;
					const prose = words > 25 && sentences >= 2 && !/[{};=<>]|^\s*[$#>]/m.test(c.value);
					issues.push({ type: prose ? "indented-prose" : "indented-code", line: at(pos), detail: `${n} line(s)${prose ? ", reads like prose" : ""}: “${c.value.split("\n")[0].trim().slice(0, 50)}”` });
				} else {
					const indents = c.value.split("\n").filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
					const min = indents.length ? Math.min(...indents) : 0;
					if (min >= 2) issues.push({ type: "code-stray-indent", line: at(pos), detail: `every line indented ${min}+ spaces` });
				}
				if (YOUTUBE_RE.test(c.value)) break;
				for (const m of c.value.matchAll(ENTITY_RE))
					if (decodeEntity(m[0])) issues.push({ type: "html-entity", line: at(pos), detail: `${m[0]} inside code (renders literally; may be genuine)` });
				break;
			}
			case "inlineCode": {
				const v = (node as InlineCode).value;
				for (const m of v.matchAll(ENTITY_RE))
					if (decodeEntity(m[0])) issues.push({ type: "html-entity", line: at(pos), detail: `${m[0]} inside inline code (renders literally; may be genuine)` });
				break;
			}
			case "html": {
				const h = (node as Html).value.trim();
				if (/^<!--[\s\S]*-->$/.test(h)) break;
				if (/<iframe/i.test(h)) hasEmbed = true;
				const tags = [...new Set([...h.matchAll(/<([a-z][a-z0-9]*)/gi)].map((m) => m[1].toLowerCase()))];
				const pseudo = parents.at(-1)?.type !== "root" && /^<\/?([A-Za-z][\w.:-]*)\s*\/?>$/.test(h) && !INLINE_HTML.has(tags[0] ?? "");
				if (tags.length) issues.push({ type: "raw-html", line: at(pos), detail: `<${tags.slice(0, 5).join("> <")}>${pseudo ? " (pseudo-tag in prose, vanishes)" : ""}` });
				for (const m of h.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) checkUrl(m[1], at(pos), /src=/i.test(m[0]));
				break;
			}
			case "link": {
				const l = node as Link;
				if (YOUTUBE_RE.test(l.url)) hasEmbed = true;
				checkUrl(l.url, at(pos), false);
				break;
			}
			case "image":
				checkUrl((node as Image).url, at(pos), true);
				break;
		}
	});

	// Double-escaped entities (&amp;lt;) survive parsing as literal text
	for (const t of proseText) for (const m of t.matchAll(ENTITY_RE)) issues.push({ type: "html-entity", detail: `${m[0]} double-escaped in text` });
	{
		// remark already decodes entities in text nodes; look at the source for anything outside code/html
		const skip = codeAndHtmlRanges(tree);
		for (const m of body.matchAll(ENTITY_RE)) {
			if (skip.some(([s, e]) => m.index! >= s && m.index! < e)) continue;
			if (!decodeEntity(m[0]) || /^&(lt|gt|amp|#60|#62|#38);$/i.test(m[0])) continue;
			issues.push({ type: "html-entity", line: at(m.index!), detail: `${m[0]} in prose` });
		}
	}

	// Plain YouTube URLs on their own line count as embeds (the converter turns them into one)
	if (lines.some((l) => YOUTUBE_RE.test(l.trim()) && /^\S+$/.test(l.trim()))) hasEmbed = true;

	// Runs of blank lines (outside fenced code): where Ghost cards used to be
	let run = 0;
	lines.forEach((l, i) => {
		if (!l.trim() && !fenced.has(i)) run++;
		else {
			if (run >= 2 && i - run > 0) issues.push({ type: "blank-line-run", line: lineAt(i - run + 1), detail: `${run} blank lines` });
			run = 0;
		}
	});

	const vm = videoText.match(VIDEOISH);
	if (vm && !hasEmbed) issues.push({ type: "video-no-embed", detail: `mentions “${vm[0]}” but has no embed` });

	// Hero image
	if (post.heroImage) checkUrl(post.heroImage, undefined, true);

	// Description cut off mid-sentence (Ghost excerpts were the first N characters of the body)
	let suggestedDescription: string | undefined;
	const desc = post.description.replace(/\s+/g, " ").trim();
	if (desc && !/[.!?…:)"'”’]$/.test(desc)) {
		const plain = plainText(tree);
		const i = plain.indexOf(desc.slice(0, Math.min(40, desc.length)));
		const looksExcerpt = i >= 0 && i < 20;
		if (looksExcerpt || desc.length >= 120) {
			const rest = plain.slice(i >= 0 ? i + desc.length : 0);
			const end = rest.search(/[.!?](\s|$)/);
			if (i >= 0 && end >= 0 && desc.length + end < 260) suggestedDescription = (plain.slice(i, i + desc.length) + rest.slice(0, end + 1)).trim();
			issues.push({ type: "truncated-description", detail: `ends “…${desc.slice(-30)}”` });
		}
	}

	// Tool candidate: links one of Ben's repos, or ships a reusable script/helper
	for (const m of body.matchAll(/(?<!gist\.)github\.com\/benyoungnz\/([\w.-]+)/gi)) if (!/^(benyoungnz)?$/i.test(m[1])) tool.add(`repo: ${m[1].replace(/\.git$/, "")}`);
	for (const m of body.matchAll(/gist\.github\.com\/benyoungnz\/(\w+)/gi)) tool.add(`gist: ${m[1].slice(0, 8)}`);
	for (const m of body.matchAll(/hub\.docker\.com\/r\/(benyoung\/[\w.-]+)|docker (?:run|pull)[^\n]*?\b(benyoung\/[\w.-]+)/gi)) tool.add(`docker: ${m[1] ?? m[2]}`);
	const scriptLang = /^(powershell|ps1|pwsh|python|py|bash|sh|shell|javascript|js|typescript|ts|csharp|c#|go)$/;
	const bigScript = codeLangs.find((c) => scriptLang.test(c.lang) && c.lines >= 20);
	if (bigScript) tool.add(`script: ${bigScript.lang}, ${bigScript.lines} lines`);
	if (/\bcalculator\b/i.test(videoText)) tool.add("calculator");
	if (/\b(powershell )?(module|function|helper|wrapper|cmdlet)s?\b[^.]{0,60}\b(api|rest)\b/i.test(videoText) && codeLangs.length) tool.add("API helper");

	return { issues: dedupe(issues), tool: [...tool], suggestedDescription };

	function checkUrl(url: string, line: number | undefined, isImage: boolean) {
		if (!url || url.startsWith("#") || /^(mailto|tel|data):/i.test(url)) return;
		let path: string | undefined;
		const abs = url.match(/^https?:\/\/(?:www\.)?benyoung\.blog(\/[^?#]*)?/i);
		if (abs) path = abs[1] || "/";
		else if (url.startsWith("/")) path = url.split(/[?#]/)[0];
		if (!path) {
			if (isImage && /^https?:/i.test(url)) issues.push({ type: "external-image", line, detail: url.slice(0, 90) });
			return;
		}
		if (isImage || path.startsWith("/content/")) {
			const local = localImagePath(path);
			if (!local || !existsSync(local)) issues.push({ type: "missing-image", line, detail: path });
			return;
		}
		const p = path.replace(/\/+$/, "") || "/";
		const seg = p.split("/").filter(Boolean);
		if (p === "/" || ["/blog", "/about", "/tags", "/categories", "/rss.xml"].includes(p)) return;
		if (seg[0] === "blog" && seg.length === 2) {
			if (!routes.slugs.has(seg[1])) issues.push({ type: "dead-internal-link", line, detail: `${path} (no such post)` });
			return;
		}
		if (seg[0] === "tags" && seg.length === 2) {
			if (!routes.tags.has(termSlug(seg[1]))) issues.push({ type: "dead-internal-link", line, detail: `${path} (no such tag)` });
			return;
		}
		if (seg[0] === "categories" && seg.length === 2) {
			if (!routes.categories.has(termSlug(seg[1]))) issues.push({ type: "dead-internal-link", line, detail: `${path} (no such category)` });
			return;
		}
		if (seg.length === 1 && (routes.redirects.has(p) || routes.slugs.has(seg[0]))) {
			const target = routes.redirects.get(p) ?? `/blog/${seg[0]}`;
			const ok = routes.slugs.has(target.split("/").filter(Boolean)[1] ?? "");
			issues.push(
				ok
					? { type: "ghost-root-link", line, detail: `${path} → /blog/${target.split("/").filter(Boolean)[1]}/` }
					: { type: "dead-internal-link", line, detail: `${path} (redirect target missing)` },
			);
			return;
		}
		if (seg[0] === "tag" && seg.length === 2) {
			const t = termSlug(seg[1]);
			issues.push({ type: "dead-internal-link", line, detail: `${path} (Ghost tag URL${routes.tags.has(t) ? `; /tags/${t}/ exists` : ""})` });
			return;
		}
		issues.push({ type: "dead-internal-link", line, detail: path });
	}
}

function codeAndHtmlRanges(tree: Root) {
	const ranges: [number, number][] = [];
	walk(tree, (n) => {
		if ((n.type === "code" || n.type === "inlineCode" || n.type === "html") && n.position)
			ranges.push([n.position.start.offset!, n.position.end.offset!]);
	});
	return ranges;
}

function plainText(tree: Root) {
	const parts: string[] = [];
	walk(tree, (n) => {
		if (n.type === "text" || n.type === "inlineCode") parts.push((n as Text).value);
		if (n.type === "paragraph" || n.type === "heading") parts.push(" ");
	});
	return parts.join("").replace(/\s+/g, " ").trim();
}

const snippet = (t: string, i: number) => t.slice(Math.max(0, i - 20), i + 20).replace(/\s+/g, " ").trim();

function dedupe(issues: Issue[]) {
	const seen = new Set<string>();
	return issues.filter((i) => {
		const k = `${i.type}|${i.line}|${i.detail}`;
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

// ── Embed recovery ─────────────────────────────────────────────────────────────

let lastRequest = 0;
async function politeFetch(url: string, cacheName: string): Promise<string | null> {
	const file = join(CACHE, cacheName);
	if (existsSync(file)) return readFileSync(file, "utf8");
	for (let attempt = 0; attempt < 4; attempt++) {
		const wait = lastRequest + 1100 - Date.now();
		if (wait > 0) await sleep(wait);
		lastRequest = Date.now();
		try {
			const res = await fetch(url, { headers: { "User-Agent": "benyoung.blog migration audit (ben@benyoung.blog)" }, redirect: "follow" });
			if (res.status === 404) {
				writeFileSync(file, "");
				return "";
			}
			if (res.status === 429 || res.status >= 500) {
				await sleep(5000 * (attempt + 1));
				continue;
			}
			const text = await res.text();
			writeFileSync(file, text);
			return text;
		} catch {
			await sleep(3000 * (attempt + 1));
		}
	}
	return null;
}

/** Pulls embeds out of a Ghost (or Astro) post page, each with the text that preceded it */
function extractEmbeds(html: string, source: string): Embed[] {
	// Limit to the article body: Ghost 2–5 themes use post-full-content / gh-content / post-content
	const start = html.search(/class="[^"]*(post-full-content|gh-content|post-content|kg-post|article-content)[^"]*"/);
	const end = html.indexOf("</article>", start);
	const content = start >= 0 ? html.slice(start, end > start ? end : undefined) : html;
	const out: Embed[] = [];
	const re = /<iframe[^>]+src=["']([^"']+)["'][^>]*>|<script[^>]+src=["'](https?:\/\/gist\.github\.com\/[^"']+?)(?:\.js)?["'][^>]*>|<blockquote[^>]+class=["'][^"']*twitter-tweet[^"']*["'][\s\S]*?<\/blockquote>/gi;
	for (const m of content.matchAll(re)) {
		const before = content.slice(Math.max(0, m.index! - 3000), m.index!);
		const anchor = htmlToText(before).slice(-160);
		if (m[1]) {
			const src = m[1].replace(/&amp;/g, "&").replace(/^\/\//, "https://");
			const yt = src.match(YOUTUBE_RE);
			if (yt) out.push({ kind: "youtube", url: `https://www.youtube.com/watch?v=${yt[1]}`, anchor, source });
			else if (!/googletagmanager|disqus|facebook\.com\/plugins/i.test(src)) out.push({ kind: "iframe", url: src, anchor, source });
		} else if (m[2]) out.push({ kind: "gist", url: m[2], anchor, source });
		else {
			const links = [...m[0].matchAll(/href=["'](https?:\/\/(?:mobile\.)?(?:twitter|x)\.com\/[^"']+\/status\/\d+)[^"']*["']/gi)];
			if (links.length) out.push({ kind: "tweet", url: links.at(-1)![1], anchor, source });
		}
	}
	// Some Ghost cards keep only a link to the video (bookmark cards, lazy-loaded embeds)
	for (const m of content.matchAll(/(?:data-src|href)=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)[\w-]{11}[^"']*)["']/gi)) {
		const yt = m[1].match(YOUTUBE_RE)!;
		const url = `https://www.youtube.com/watch?v=${yt[1]}`;
		if (!out.some((e) => e.url === url)) out.push({ kind: "youtube", url, anchor: htmlToText(content.slice(Math.max(0, m.index! - 3000), m.index!)).slice(-160), source });
	}
	return out;
}

function htmlToText(html: string) {
	return html
		.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(ENTITY_RE, (e) => decodeEntity(e) ?? e)
		.replace(/\s+/g, " ")
		.trim();
}

async function recoverEmbeds(posts: LegacyPost[], wanted: Set<string>, existing: Record<string, EmbedRecord>) {
	mkdirSync(CACHE, { recursive: true });
	const out = { ...existing };
	let n = 0;
	for (const post of posts) {
		if (!wanted.has(post.slug) || out[post.slug]) continue;
		n++;
		process.stdout.write(`  [${n}/${wanted.size}] ${post.slug}… `);
		const rec: EmbedRecord = { slug: post.slug, checked: [], embeds: [] };
		const add = (embeds: Embed[]) => {
			for (const e of embeds) if (!rec.embeds.some((x) => x.url === e.url)) rec.embeds.push(e);
		};

		const live = await politeFetch(`https://benyoung.blog/blog/${post.slug}/`, `live-${post.slug}.html`);
		if (live) {
			rec.checked.push("live");
			add(extractEmbeds(live, "live"));
		}

		// Ghost served posts at the root; the Wayback CDX lists every capture of that URL
		const cdx = await politeFetch(
			`https://web.archive.org/cdx/search/cdx?url=benyoung.blog/${post.slug}/&output=json&fl=timestamp,statuscode&filter=statuscode:200&collapse=digest`,
			`cdx-${post.slug}.json`,
		);
		let rows: string[][] = [];
		try {
			rows = cdx ? (JSON.parse(cdx) as string[][]).slice(1) : [];
		} catch {
			rec.note = "CDX response unreadable";
		}
		if (cdx === null) rec.note = "Wayback unreachable";
		else if (!rows.length) rec.note ??= "no Ghost-era capture";
		// Newest capture first (latest Ghost edit), then the oldest as a fallback if the newest is already Astro
		const picks = rows.length ? [...new Set([rows.at(-1)![0], rows[0][0]])] : [];
		for (const ts of picks) {
			const html = await politeFetch(`https://web.archive.org/web/${ts}id_/https://benyoung.blog/${post.slug}/`, `wb-${post.slug}-${ts}.html`);
			if (!html) continue;
			const ghost = /<meta name="generator" content="Ghost/i.test(html);
			rec.checked.push(`wayback ${ts}${ghost ? " (Ghost)" : ""}`);
			add(extractEmbeds(html, `wayback ${ts}`));
			if (ghost) break;
		}
		console.log(rec.embeds.length ? rec.embeds.map((e) => e.kind).join(", ") : rec.note ?? "none");
		out[post.slug] = rec;
		writeFileSync(EMBEDS_FILE, JSON.stringify(out, null, "\t") + "\n");
	}
	return out;
}

// ── Mechanical fixes ───────────────────────────────────────────────────────────

/** Text a reader sees, ignoring emphasis markers and whitespace, to prove a fix changed only markup */
const visible = (md: string) => plainText(parse(md)).replace(/[*_\s]/g, "");
const literalMarkers = (md: string) => {
	let n = 0;
	walk(parse(md), (node) => {
		if (node.type === "text") n += ((node as Text).value.match(/\*\*|__|(^|\s)[*_](?=\S)|(?<=\S)[*_](\s|$)/g) ?? []).length;
	});
	return n;
};

function fixPost(body: string, embeds: Embed[], log: string[], judgement: Issue[]): string {
	// 0. A fence whose closer was indented with its content (``` at 4+ spaces) never closes;
	//    when the post has an odd number of real fences, pull that closer back to column 0
	{
		const lines = body.split("\n");
		const real = lines.filter((l) => (l.match(fenceRe)?.[1].length ?? 9) < 4).length;
		if (real % 2) {
			let open: string | null = null;
			for (let i = 0; i < lines.length; i++) {
				const m = lines[i].match(fenceRe);
				if (!m) continue;
				if (m[1].length < 4) open = open ? null : m[2];
				else if (open && m[2][0] === open[0] && !lines[i].slice(m[0].length).trim()) {
					lines[i] = open.replace(/[^`~]/g, "");
					open = null;
					log.push("closed an unterminated code fence");
				}
			}
			body = lines.join("\n");
		}
	}

	// 0b. Pseudo-tags written as prose (<startTimeFrom>, <changeme>) parse as HTML and vanish; escape them
	{
		const edits: number[] = [];
		walk(parse(body), (n, parents) => {
			if (n.type !== "html" || parents.at(-1)?.type === "root") return;
			const m = (n as Html).value.match(/^<\/?([A-Za-z][\w.:-]*)\s*\/?>$/);
			if (m && !INLINE_HTML.has(m[1].toLowerCase())) edits.push(n.position!.start.offset!);
		});
		for (const at of edits.sort((a, b) => b - a)) body = body.slice(0, at) + "\\" + body.slice(at);
		if (edits.length) log.push(`escaped ${edits.length} pseudo-HTML tag(s) that rendered as nothing`);
	}

	// 1. Entities in prose: decode named ones (&mdash; &minus; …) that are clearly typography.
	//    &lt; &gt; &amp; already render correctly and could turn into markup, so they stay.
	//    Entities inside code are left alone: in this blog they are genuine (HTML templates, API output).
	{
		const skip = codeAndHtmlRanges(parse(body));
		let count = 0;
		body = body.replace(ENTITY_RE, (ent, _n, idx: number) => {
			const dec = decodeEntity(ent);
			if (!dec || skip.some(([s, e]) => idx >= s && idx < e) || /^&(lt|gt|amp|#60|#62|#38);$/i.test(ent)) return ent;
			count++;
			return dec === "\u00a0" ? " " : dec;
		});
		if (count) log.push(`decoded ${count} HTML entit${count === 1 ? "y" : "ies"}`);
	}

	// 2. Broken emphasis: move spaces outside the markers, or add the space a closing ** needs.
	//    Each rewrite is only kept if it removes literal markers without changing visible text, so a
	//    later rule can't re-pair markers an earlier rule already fixed.
	{
		const rules: [RegExp, string][] = [
			[/(?<=^|[\s([{"'“‘>-])(\*\*|__)(\S(?:[^*\n]*?\S)?)(\s+)\1/gu, "$1$2$1$3"], // **word **next → **word** next
			[/(?<=[\p{L}\p{N},.:;!?])(\*\*)\s+(\S(?:[^*\n]*?\S)?)(\s*)\1/gu, " $1$2$1$3"], // you** SHOULD** → you **SHOULD**
			[/(^|\s)(\*\*|__)\s+(\S(?:[^*\n]*?\S)?)\2/gu, "$1$2$3$2"], // ** word** → **word**
			[/(?<![*\\])(\*{1,3})(\S[^*\n]*?(?:(?!\*)\p{P}))\1(?=[\p{L}\p{N}])/gu, "$1$2$1 "], // **Note:**text → **Note:** text
			[/(^|\s)\*(\S(?:[^*\n]*?\S)?)\s+\*(?=[\s.,;:!?)]|$)/g, "$1*$2* "], // *word * → *word*
		];
		const lines = body.split("\n");
		const fenced = fencedLines(lines);
		let fixed = 0;
		for (let i = 0; i < lines.length; i++) {
			if (fenced.has(i) || /^( {4}|\t)/.test(lines[i]) || !/[*_]/.test(lines[i])) continue;
			const orig = lines[i];
			for (const [re, to] of rules) {
				const cur = lines[i];
				const next = cur.replace(re, to).replace(/ +$/, (m) => (orig.endsWith(m) ? m : ""));
				if (next === cur) continue;
				const before = lines.join("\n");
				lines[i] = next;
				const after = lines.join("\n");
				if (visible(after) !== visible(before) || literalMarkers(after) >= literalMarkers(before)) lines[i] = cur;
			}
			if (lines[i] !== orig) fixed++;
		}
		if (fixed) log.push(`fixed broken emphasis on ${fixed} line(s)`);
		body = lines.join("\n");
	}

	// 3. Stray uniform indentation inside top-level fenced code (e.g. every line indented 4 spaces)
	{
		const lines = body.split("\n");
		let blocks = 0;
		for (let i = 0; i < lines.length; i++) {
			const open = lines[i].match(/^(`{3,}|~{3,})/);
			if (!open) continue;
			let j = i + 1;
			while (j < lines.length && !lines[j].startsWith(open[1])) j++;
			if (j >= lines.length) break;
			const content = lines.slice(i + 1, j);
			const indents = content.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
			const min = indents.length ? Math.min(...indents) : 0;
			if (min >= 2) {
				for (let k = i + 1; k < j; k++) lines[k] = lines[k].slice(Math.min(min, lines[k].match(/^ */)![0].length));
				blocks++;
			}
			i = j;
		}
		if (blocks) log.push(`removed stray indentation from ${blocks} code block(s)`);
		body = lines.join("\n");
	}

	// 4. Recovered YouTube embeds: a lone URL line after the paragraph that preceded the embed
	for (const e of embeds) {
		if (e.kind !== "youtube") continue;
		const id = e.url.match(YOUTUBE_RE)![1];
		if (body.includes(id)) continue;
		const at = placeAfterAnchor(body, e.anchor);
		if (at === null) {
			judgement.push({ type: "lost-embed", detail: `${e.url}: could not place it (preceding text “…${e.anchor.slice(-50)}” not found)` });
			continue;
		}
		const head = body.slice(0, at).replace(/\s*$/, "");
		const tail = body.slice(at).replace(/^\s*/, "");
		body = `${head}\n\n${e.url}\n${tail ? `\n${tail}` : ""}`;
		log.push(`restored YouTube embed ${e.url}`);
	}
	return body;
}

/** Offset just after the Markdown block whose text ends the embed's anchor text, or null */
function placeAfterAnchor(body: string, anchor: string): number | null {
	const tree = parse(body);
	const target = norm(anchor);
	if (!target) return 0; // the embed opened the post
	// Try progressively shorter tails of the anchor against each top-level block's visible text
	for (const len of [60, 40, 25, 15]) {
		const tail = target.slice(-len);
		if (tail.length < Math.min(len, target.length)) continue;
		const hits = tree.children.filter((n) => norm(plainText({ type: "root", children: [n] } as Root)).endsWith(tail));
		if (hits.length === 1) return hits[0].position!.end.offset!;
		if (hits.length > 1) return null;
	}
	return null;
}

// ── Report ─────────────────────────────────────────────────────────────────────

const LABEL: Record<IssueType, string> = {
	"unbalanced-fence": "unbalanced code fence",
	"broken-inline-code": "broken inline code (odd backticks)",
	"indented-code": "unfenced indented code",
	"indented-prose": "prose indented into a code block",
	"code-stray-indent": "stray indentation inside fenced code",
	"broken-emphasis": "broken bold/italic",
	"html-entity": "HTML entity",
	"raw-html": "raw HTML",
	"truncated-description": "truncated description",
	"missing-image": "image missing from public/",
	"external-image": "externally hosted image",
	"dead-internal-link": "dead internal link",
	"ghost-root-link": "link to old Ghost root path",
	"blank-line-run": "blank-line run",
	"video-no-embed": "mentions video/embed but has none",
	"lost-embed": "recovered embed needs placing by hand",
};

const PROPOSAL: Record<IssueType, string> = {
	"unbalanced-fence": "hand-repair the fences (Ghost export cascade)",
	"broken-inline-code": "re-pair backticks by hand",
	"indented-code": "fence it (``` + language) when touched; renders as code already",
	"indented-prose": "un-indent back to paragraphs by hand",
	"code-stray-indent": "dedent",
	"broken-emphasis": "check by hand",
	"html-entity": "check: entities inside code look genuine (HTML/API output)",
	"raw-html": "keep as htmlBlock or rewrite as Markdown/table",
	"truncated-description": "complete the sentence (suggestion in JSON)",
	"missing-image": "find the original or drop the image",
	"external-image": "consider copying into media",
	"dead-internal-link": "repoint or remove",
	"ghost-root-link": "rewrite to /blog/{slug}/ (redirects cover it meanwhile)",
	"blank-line-run": "check for a lost embed",
	"video-no-embed": "no embed found in live or Wayback copies; check by hand",
	"lost-embed": "place the embed by hand",
};

function main() {
	return (async () => {
		const posts = readLegacyPosts();
		const routes = oldSiteRoutes(posts);
		let embeds: Record<string, EmbedRecord> = existsSync(EMBEDS_FILE) ? JSON.parse(readFileSync(EMBEDS_FILE, "utf8")) : {};
		const fixLog: FixLog = existsSync(FIXES_FILE) ? JSON.parse(readFileSync(FIXES_FILE, "utf8")) : {};

		if (FETCH) {
			// Every post, not only the video-ish ones: a Ghost embed can sit in any post
			const wanted = new Set(posts.map((p) => p.slug));
			console.log(`Recovering embeds for ${wanted.size - Object.keys(embeds).length} post(s)…`);
			embeds = await recoverEmbeds(posts, wanted, embeds);
		}

		const rows = [];
		for (const post of posts) {
			const raw = readFileSync(join(LEGACY_POSTS, post.file), "utf8");
			const front = raw.slice(0, raw.length - post.body.length);
			const lineOffset = front.split("\n").length - 1;
			let body = post.body;
			const judgement: Issue[] = [];
			const found = embeds[post.slug]?.embeds ?? [];

			if (FIX) {
				const log: string[] = [];
				const fixed = fixPost(body, found, log, judgement);
				if (fixed !== body) {
					writeFileSync(join(LEGACY_POSTS, post.file), front + fixed);
					body = fixed;
					fixLog[post.slug] = [...new Set([...(fixLog[post.slug] ?? []), ...log])];
				}
			} else {
				for (const e of found)
					if (e.kind === "youtube" && !body.includes(e.url.match(YOUTUBE_RE)![1])) judgement.push({ type: "lost-embed", detail: `${e.url} not in the Markdown yet (run --fix)` });
			}

			const a = auditPost(post, body, lineOffset, routes);
			for (const e of found) {
				const g = e.url.match(/gist\.github\.com\/benyoungnz\/(\w+)/);
				if (g && !a.tool.some((t) => t.includes(g[1].slice(0, 8)))) a.tool.push(`gist: ${g[1].slice(0, 8)} (recovered)`);
			}
			// Non-YouTube embeds always need a decision (gist → code block or link, tweet → quote, etc.)
			for (const e of found) if (e.kind !== "youtube" && !body.includes(e.url)) judgement.push({ type: "lost-embed", detail: `${e.kind}: ${e.url}` });
			const issues = [...a.issues, ...judgement];
			// Once an embed has been recovered and restored, "mentions video" is answered
			rows.push({
				slug: post.slug,
				file: post.file,
				issues,
				fixed: fixLog[post.slug] ?? [],
				embeds: found,
				embedSources: embeds[post.slug]?.checked ?? [],
				embedNote: embeds[post.slug]?.note,
				tool: a.tool,
				suggestedDescription: a.suggestedDescription,
			});
		}

		writeFileSync(FIXES_FILE, JSON.stringify(fixLog, null, "\t") + "\n");
		writeFileSync(REPORT_JSON, JSON.stringify({ generated: new Date().toISOString(), posts: rows }, null, "\t") + "\n");
		writeFileSync(REPORT_MD, renderReport(rows));
		console.log(`${rows.length} posts audited → ${REPORT_MD.replace(resolve(LEGACY_ROOT) + "/", "")}`);
	})();
}

type Row = {
	slug: string;
	file: string;
	issues: Issue[];
	fixed: string[];
	embeds: Embed[];
	embedSources: string[];
	embedNote?: string;
	tool: string[];
	suggestedDescription?: string;
};

function renderReport(rows: Row[]) {
	const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
	const counts = new Map<IssueType, { posts: number; total: number }>();
	for (const r of rows)
		for (const t of new Set(r.issues.map((i) => i.type))) {
			const c = counts.get(t) ?? { posts: 0, total: 0 };
			c.posts++;
			c.total += r.issues.filter((i) => i.type === t).length;
			counts.set(t, c);
		}
	const fixCounts = new Map<string, number>();
	for (const r of rows) for (const f of r.fixed) {
		const k = f.replace(/\d+ /, "").replace(/https?:\S+/, "").replace(/entity|entities/, "entities").replace(/\(s\)/, "").trim();
		fixCounts.set(k, (fixCounts.get(k) ?? 0) + 1);
	}
	const recovered = rows.flatMap((r) => r.embeds.map((e) => ({ slug: r.slug, ...e })));

	const out: string[] = [];
	out.push("# Markdown audit: old blog posts", "");
	out.push(
		`Generated by \`node web/scripts/audit.ts\` over ${rows.length} posts in \`src/content/blog/\`. ` +
			"Issues are what is left after the scripted fix pass; the Fixed column lists what that pass (and the hand repairs) changed. " +
			"Line numbers are file lines. Full detail, including suggested descriptions, is in `audit-report.json`.",
		"",
	);
	out.push("## Summary", "");
	out.push("| Issue (remaining) | Posts | Occurrences |", "|---|---:|---:|");
	for (const [t, c] of [...counts].sort((a, b) => b[1].posts - a[1].posts)) out.push(`| ${LABEL[t]} | ${c.posts} | ${c.total} |`);
	out.push("", "| Fix applied | Posts |", "|---|---:|");
	for (const [k, n] of [...fixCounts].sort((a, b) => b[1] - a[1])) out.push(`| ${k} | ${n} |`);
	out.push("", `Tool candidates: **${rows.filter((r) => r.tool.length).length}** posts. Embeds recovered: **${recovered.length}** in ${new Set(recovered.map((e) => e.slug)).size} posts.`, "");

	out.push("## Recovered embeds", "");
	{
		const checked = rows.filter((r) => r.embedSources.length || r.embedNote);
		const ghost = checked.filter((r) => r.embedSources.some((s) => s.includes("(Ghost)")));
		const none = checked.filter((r) => !r.embedSources.some((s) => s.startsWith("wayback")));
		out.push(
			`Checked ${checked.length} posts: the live page on benyoung.blog (Astro, built from the same Markdown) and the Wayback Machine's newest capture of the Ghost-era URL \`benyoung.blog/<slug>/\`. ` +
				`${ghost.length} had a Ghost-era capture. ${none.length} had none${none.length ? ` (${none.map((r) => r.slug).slice(0, 3).join(", ")}…); these were written straight into this repo after the move off Ghost, so their Markdown is the original` : ""}.`,
			"",
		);
	}
	if (recovered.length) {
		out.push("| Post | Kind | URL | Source | Status |", "|---|---|---|---|---|");
		for (const e of recovered) {
			const r = rows.find((x) => x.slug === e.slug)!;
			const placed = r.fixed.some((f) => f.includes(e.url)) || (e.kind === "youtube" && !r.issues.some((i) => i.type === "lost-embed" && i.detail.includes(e.url)));
			out.push(`| ${e.slug} | ${e.kind} | ${e.url} | ${e.source} | ${e.kind === "youtube" && placed ? "restored" : "needs judgement"} |`);
		}
	} else out.push("None recovered yet (run with `--fetch`).");
	out.push("");

	out.push("## Posts", "");
	out.push("| # | Post | Issues | Fixed | Proposed fix / needs judgement | Tool candidate? |", "|---:|---|---|---|---|---|");
	rows.forEach((r, n) => {
		const byType = new Map<IssueType, Issue[]>();
		for (const i of r.issues) byType.set(i.type, [...(byType.get(i.type) ?? []), i]);
		const issues = [...byType].map(([t, is]) => `${LABEL[t]}${is.length > 1 ? ` ×${is.length}` : ""}${is[0].line ? ` (L${is.map((i) => i.line).filter(Boolean).slice(0, 4).join(", L")})` : ""}`).join("<br>") || "—";
		const proposals = [...byType.keys()].filter((t) => t !== "external-image").map((t) => {
			if (t === "lost-embed") return byType.get(t)!.map((i) => `place: ${i.detail}`).join("<br>");
			if (t === "dead-internal-link") return `repoint: ${byType.get(t)!.map((i) => i.detail).join(", ")}`;
			if (t === "missing-image") return `missing: ${byType.get(t)!.map((i) => i.detail).join(", ")}`;
			// With a Ghost-era copy checked and nothing found, the gap or mention isn't a lost embed
			const ghostChecked = r.embedSources.some((s) => s.includes("(Ghost)"));
			if (t === "blank-line-run" && ghostChecked) return "collapse (Ghost copy has no embed there)";
			if (t === "video-no-embed") return ghostChecked ? "none: Ghost copy has no embed either, just a mention" : "no Ghost-era copy to check; Markdown is the original";
			return PROPOSAL[t];
		});
		const fixed = r.fixed.join("<br>") || "—";
		const tool = r.tool.length ? `**yes**: ${r.tool.join(", ")}` : "no";
		out.push(`| ${n + 1} | [${r.slug}](../../src/content/blog/${r.file}) | ${cell(issues)} | ${cell(fixed)} | ${cell(proposals.join("<br>") || "—")} | ${cell(tool)} |`);
	});
	out.push("");
	return out.join("\n");
}

await main();
