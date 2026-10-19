// Calls OpenRouter (default model: OPENROUTER_MODEL, e.g. ~google/gemini-flash-latest).
// Used at write time only, by the post-ai plugin and scripts/takeaways.ts.
// Never call it while rendering a page.

export interface AiConfig {
	apiKey: string;
	model?: string;
	fetch?: (url: string, init?: RequestInit) => Promise<Response>;
}

const DEFAULT_MODEL = '~google/gemini-flash-latest';

/** Readable text from Portable Text: paragraphs, headings, list items, and the start of code blocks. */
export function plainText(blocks: unknown[] | undefined, maxChars = 24000): string {
	const out: string[] = [];
	for (const raw of blocks ?? []) {
		const b = raw as { _type?: string; style?: string; children?: { text?: string }[]; code?: string };
		if (b._type === 'block') {
			const text = (b.children ?? []).map((c) => c.text ?? '').join('').trim();
			if (text) out.push(b.style?.startsWith('h') ? `\n## ${text}` : text);
		} else if (b._type === 'code' && b.code) {
			out.push('```\n' + b.code.split('\n').slice(0, 15).join('\n') + '\n```');
		}
	}
	return out.join('\n').slice(0, maxChars);
}

async function chatJson<T>(cfg: AiConfig, system: string, user: string): Promise<T> {
	const res = await (cfg.fetch ?? fetch)('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${cfg.apiKey}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': 'https://benyoung.blog',
			'X-Title': 'benyoung.blog',
		},
		body: JSON.stringify({
			model: cfg.model || DEFAULT_MODEL,
			temperature: 0.3,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user },
			],
		}),
	});
	if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${(await res.text()).slice(0, 200)}`);
	const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
	const text = body.choices?.[0]?.message?.content ?? '';
	// Some models wrap JSON in a fence despite response_format
	return JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, '')) as T;
}

const TAKEAWAYS_PROMPT = `You write the "Key takeaways" box at the top of posts on benyoung.blog, the technical blog of Ben Young (Field CTO, APJ at Veeam).

Return JSON: {"takeaways": [{"lead": "...", "detail": "..."}]}

Rules:
- 3 to 5 takeaways. Fewer for short posts.
- "lead" is 2 to 6 words naming the point, like a bold label. "detail" is one plain sentence, at most 22 words.
- Only state what the post itself says. No outside facts, no advice the post doesn't give.
- Concrete beats general: name the product, API, version, command or number the post uses.
- A reader who only reads the box should know what the post covers and whether it's for them.
- Plain, direct tone. No hype, no "In this post", no "This article explores", no emojis.
- Use NZ/UK spelling. Don't use em dashes.`;

export interface Takeaway {
	lead: string;
	detail: string;
}

export async function generateTakeaways(cfg: AiConfig, post: { title: string; description?: string; text: string }): Promise<Takeaway[]> {
	const user = `Title: ${post.title}\nDescription: ${post.description ?? ''}\n\nPost:\n${post.text}`;
	const { takeaways } = await chatJson<{ takeaways?: Takeaway[] }>(cfg, TAKEAWAYS_PROMPT, user);
	return (takeaways ?? [])
		.filter((t) => t?.lead && t?.detail)
		.slice(0, 5)
		.map((t) => ({ lead: t.lead.trim().replace(/[.:]+$/, ''), detail: t.detail.trim().replace(/\s*—\s*/g, ', ') }));
}

/**
 * Stored in the post's `key_takeaways` text field as one takeaway per line, "Lead: detail",
 * so it reads and edits naturally in the admin.
 */
export const formatTakeaways = (items: Takeaway[]) => items.map((t) => `${t.lead}: ${t.detail}`).join('\n');

export function parseTakeaways(field: string | undefined | null): Takeaway[] {
	return (field ?? '')
		.split('\n')
		.map((line) => line.trim().replace(/^[-*•]\s*/, ''))
		.filter(Boolean)
		.map((line) => {
			const i = line.indexOf(': ');
			return i > 0 && i < 60 ? { lead: line.slice(0, i), detail: line.slice(i + 2) } : { lead: '', detail: line };
		});
}

// ---------------------------------------------------------------------------
// Interlinking: embeddings for "related" lists, and AI internal-link suggestions
// ---------------------------------------------------------------------------

const EMBED_MODEL = 'openai/text-embedding-3-small';
export const EMBED_DIMS = 256;

/** One vector per input, unit length, rounded so a few hundred fit comfortably in KV. */
export async function embed(cfg: AiConfig, inputs: string[]): Promise<number[][]> {
	if (!inputs.length) return [];
	const res = await (cfg.fetch ?? fetch)('https://openrouter.ai/api/v1/embeddings', {
		method: 'POST',
		headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({ model: EMBED_MODEL, input: inputs.map((s) => s.slice(0, 8000)), dimensions: EMBED_DIMS }),
	});
	if (!res.ok) throw new Error(`OpenRouter embeddings ${res.status}: ${(await res.text()).slice(0, 200)}`);
	const body = (await res.json()) as { data: { index: number; embedding: number[] }[] };
	return body.data
		.sort((a, b) => a.index - b.index)
		.map(({ embedding }) => {
			const norm = Math.hypot(...embedding) || 1;
			return embedding.map((x) => Math.round((x / norm) * 1e4) / 1e4);
		});
}

/** The text a post is embedded from: what it's about, not its formatting. */
export const embedText = (p: { title: string; description?: string; text: string }) => `${p.title}\n${p.description ?? ''}\n\n${p.text.slice(0, 6000)}`;

const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);

/** Nearest neighbours by cosine similarity (vectors are unit length). */
export function nearest<T extends { key: string; v: number[] }>(v: number[], pool: T[], n: number, exclude?: string, minScore = 0.3) {
	return pool
		.filter((p) => p.key !== exclude)
		.map((p) => ({ item: p, score: dot(v, p.v) }))
		.filter((r) => r.score >= minScore)
		.sort((a, b) => b.score - a.score)
		.slice(0, n);
}

export interface LinkSuggestion {
	/** Exact phrase from the post to turn into a link */
	phrase: string;
	slug: string;
	title: string;
	why: string;
}

const LINKS_PROMPT = `You suggest internal links for a post on benyoung.blog, Ben Young's technical blog.

You get the post's text and a list of other posts on the site. Pick places in the text where linking to one of those posts would genuinely help a reader.

Return JSON: {"links": [{"phrase": "...", "slug": "...", "why": "..."}]}

Rules:
- At most 5 links, best first. Return fewer, or none, rather than weak ones.
- "phrase" must be copied exactly from the post text: 2 to 8 words that make sense as link text. Never "here", "this post" or a bare product name the target only mentions in passing.
- "slug" must be one of the listed posts. Each slug at most once.
- Only link where the target post goes deeper on that exact topic.
- "why" is one short sentence for the editor.`;

export async function suggestLinks(
	cfg: AiConfig,
	post: { title: string; text: string; existingHrefs?: string[] },
	candidates: { slug: string; title: string; description?: string }[],
): Promise<LinkSuggestion[]> {
	if (!candidates.length) return [];
	const list = candidates.map((c) => `- ${c.slug}: ${c.title}${c.description ? ` (${c.description.slice(0, 140)})` : ''}`).join('\n');
	const { links } = await chatJson<{ links?: { phrase: string; slug: string; why: string }[] }>(
		cfg,
		LINKS_PROMPT,
		`Other posts:\n${list}\n\nPost title: ${post.title}\n\nPost text:\n${post.text}`,
	);
	const bySlug = new Map(candidates.map((c) => [c.slug, c]));
	const lower = post.text.toLowerCase();
	const seen = new Set<string>();
	return (links ?? [])
		.filter((l) => l?.phrase && bySlug.has(l.slug) && !seen.has(l.slug) && seen.add(l.slug))
		// Drop invented phrases and links the post already has
		.filter((l) => lower.includes(l.phrase.toLowerCase()) && !post.existingHrefs?.some((h) => h.includes(`/blog/${l.slug}`)))
		.slice(0, 5)
		.map((l) => ({ phrase: l.phrase, slug: l.slug, title: bySlug.get(l.slug)!.title, why: l.why }));
}

/** Written when there's nothing worth linking, so saves don't keep asking. Clear it to ask again. */
export const NO_SUGGESTIONS = 'No suggestions right now.';

/** Stored in the post's `link_suggestions` field, one per line, for the editor to act on. */
export const formatLinkSuggestions = (items: LinkSuggestion[]) =>
	items.map((l) => `"${l.phrase}" → /blog/${l.slug}/ (${l.title}). ${l.why}`).join('\n');

/** Hrefs of links already in a Portable Text body. */
export function linkHrefs(blocks: unknown[] | undefined): string[] {
	return (blocks ?? []).flatMap((b) => ((b as { markDefs?: { _type: string; href?: string }[] }).markDefs ?? []).filter((m) => m._type === 'link' && m.href).map((m) => m.href!));
}
