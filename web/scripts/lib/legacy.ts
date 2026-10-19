// Reads the old Astro blog (repo root) and normalises each post for import.

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import yaml from "js-yaml";

export const LEGACY_ROOT = resolve(import.meta.dirname, "../../..");
export const LEGACY_POSTS = join(LEGACY_ROOT, "src/content/blog");
export const LEGACY_PUBLIC = join(LEGACY_ROOT, "public");

export interface LegacyPost {
	file: string;
	/** The live URL slug: frontmatter `slug` when set, else the filename (what Astro 4 did) */
	slug: string;
	title: string;
	description: string;
	pubDate: Date;
	updatedDate?: Date;
	heroImage?: string;
	category?: { slug: string; label: string };
	tags: { slug: string; label: string }[];
	body: string;
}

// One spelling per category; the old site had both /categories/AI/ and /categories/ai/
const CATEGORY_LABELS: Record<string, string> = {
	veeam: "Veeam",
	ai: "AI",
	tfd: "Tech Field Day",
	infrastructure: "Infrastructure",
	security: "Security",
	ransomware: "Ransomware",
	"veeam-data-cloud": "Veeam Data Cloud",
	random: "Random",
};

export const termSlug = (s: string) =>
	s
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export function readLegacyPosts(): LegacyPost[] {
	return readdirSync(LEGACY_POSTS)
		.filter((f) => f.endsWith(".md"))
		.sort()
		.map(readLegacyPost);
}

export function readLegacyPost(file: string): LegacyPost {
	const raw = readFileSync(join(LEGACY_POSTS, file), "utf8");
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
	if (!m) throw new Error(`${file}: no frontmatter`);
	// js-yaml, like Astro 4, so frontmatter parses exactly as it did on the old site
	const fm = yaml.load(m[1]) as Record<string, any>;
	const slug = (typeof fm.slug === "string" && fm.slug.trim()) || file.replace(/\.md$/, "");

	const rawCategory = Array.isArray(fm.categories) ? fm.categories[0] : fm.categories;
	const catSlug = rawCategory ? termSlug(String(rawCategory)) : undefined;
	const tags = (Array.isArray(fm.tags) ? fm.tags : [])
		.map((t: unknown) => String(t).trim())
		.filter(Boolean)
		.map((label: string) => ({ slug: termSlug(label), label: label.toLowerCase() === label ? label : label }));

	return {
		file,
		slug,
		title: String(fm.title).trim(),
		description: String(fm.description ?? "").trim(),
		pubDate: new Date(fm.pubDate),
		updatedDate: fm.updatedDate ? new Date(fm.updatedDate) : undefined,
		heroImage: fm.heroImage || undefined,
		category: catSlug ? { slug: catSlug, label: CATEGORY_LABELS[catSlug] ?? String(rawCategory) } : undefined,
		// De-duplicate tags that only differ by case
		tags: [...new Map(tags.map((t: { slug: string; label: string }) => [t.slug, t])).values()] as LegacyPost["tags"],
		body: m[2],
	};
}

/** Local file for a site-relative image path, e.g. /content/images/2026/x.jpg */
export const localImagePath = (src: string) => (src.startsWith("/") ? join(LEGACY_PUBLIC, decodeURI(src)) : undefined);
