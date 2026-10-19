// Markdown (old Astro blog) → EmDash Portable Text.
// Uses remark's real parser rather than emdash's regex converter, so nested marks,
// tables, nested lists and code fences survive. Shared by the seed builder and the importer.

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, RootContent, PhrasingContent, List, Table, Paragraph } from "mdast";

type Block = Record<string, unknown> & { _type: string; _key: string };
type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: string; _key: string; href?: string; blank?: boolean };

export interface ConvertOptions {
	/** Turn a Markdown image src into the value stored on an image block's `asset`. */
	imageAsset: (src: string, alt: string) => unknown;
	/** Collects anything the converter had to guess at, for the migration report. */
	warn?: (message: string) => void;
}

const YOUTUBE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

let counter = 0;
const key = () => `k${(counter++).toString(36)}`;

export function markdownToPortableText(markdown: string, opts: ConvertOptions): Block[] {
	counter = 0;
	const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
	const out: Block[] = [];
	for (const node of tree.children) out.push(...convertBlock(node, opts));
	return out;
}

function convertBlock(node: RootContent, opts: ConvertOptions, listCtx?: { type: string; level: number }): Block[] {
	switch (node.type) {
		case "heading": {
			// The page owns the h1; body headings start at h2
			const level = Math.min(Math.max(node.depth, 2), 6);
			return [textBlock(node.children, `h${level}`, opts)];
		}
		case "paragraph": {
			const special = standaloneParagraph(node, opts);
			if (special) return special;
			// Ghost exports often glue an image line to the next paragraph; split at images
			if (node.children.some((c) => c.type === "image")) return splitAtImages(node, opts, listCtx);
			return [textBlock(node.children, "normal", opts, listCtx)];
		}
		case "blockquote":
			return node.children.flatMap((child) =>
				child.type === "paragraph" ? [textBlock(child.children, "blockquote", opts)] : convertBlock(child, opts),
			);
		case "list":
			return convertList(node, opts, (listCtx?.level ?? 0) + 1);
		case "code":
			return [{ _type: "code", _key: key(), code: node.value, ...(node.lang ? { language: normaliseLang(node.lang) } : {}) }];
		case "table":
			return [convertTable(node, opts)];
		case "thematicBreak":
			return [{ _type: "break", _key: key(), style: "line" }];
		case "html": {
			const html = node.value.trim();
			if (!html || /^<!--[\s\S]*-->$/.test(html)) return [];
			const yt = html.match(/<iframe[^>]+src=["'][^"']*?(?:youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/i);
			if (yt) return [youtubeEmbed(yt[1])];
			opts.warn?.(`raw HTML kept as htmlBlock: ${html.slice(0, 60).replace(/\s+/g, " ")}…`);
			return [{ _type: "htmlBlock", _key: key(), html }];
		}
		case "definition":
		case "footnoteDefinition":
			opts.warn?.(`dropped ${node.type}`);
			return [];
		default:
			opts.warn?.(`unhandled block node: ${node.type}`);
			return [];
	}
}

/** A paragraph that is only an image, or only a YouTube link, becomes its own block. */
function standaloneParagraph(node: Paragraph, opts: ConvertOptions): Block[] | null {
	const kids = node.children.filter((c) => !(c.type === "text" && !c.value.trim()));
	if (kids.length === 0) return [];
	if (kids.every((c) => c.type === "image")) {
		return kids.map((img) => imageBlock((img as { url: string }).url, (img as { alt?: string }).alt ?? "", opts));
	}
	if (kids.length === 1) {
		const only = kids[0];
		const url = only.type === "link" ? only.url : only.type === "text" ? only.value.trim() : "";
		const yt = url.match(YOUTUBE);
		if (yt && (only.type === "text" ? /^\S+$/.test(url) : true)) return [youtubeEmbed(yt[1])];
		// A linked image: [![alt](src)](href)
		if (only.type === "link" && only.children.length === 1 && only.children[0].type === "image") {
			const img = only.children[0];
			return [{ ...imageBlock(img.url, img.alt ?? "", opts), link: { href: only.url } }];
		}
	}
	return null;
}

function splitAtImages(node: Paragraph, opts: ConvertOptions, listCtx?: { type: string; level: number }): Block[] {
	const out: Block[] = [];
	let run: PhrasingContent[] = [];
	const flush = () => {
		// Drop the newline that separated the image from its neighbouring text
		const trimmed = run.map((c, i) =>
			c.type !== "text" ? c : { ...c, value: i === 0 ? c.value.replace(/^\s+/, "") : i === run.length - 1 ? c.value.replace(/\s+$/, "") : c.value },
		);
		if (trimmed.some((c) => c.type !== "text" || c.value.trim())) out.push(textBlock(trimmed, "normal", opts, listCtx));
		run = [];
	};
	for (const child of node.children) {
		if (child.type === "image") {
			flush();
			out.push(imageBlock(child.url, child.alt ?? "", opts));
		} else run.push(child);
	}
	flush();
	return out;
}

function imageBlock(src: string, alt: string, opts: ConvertOptions): Block {
	return { _type: "image", _key: key(), asset: opts.imageAsset(src, alt), alt };
}

function youtubeEmbed(id: string): Block {
	return { _type: "embed", _key: key(), url: `https://www.youtube.com/watch?v=${id}`, provider: "youtube" };
}

function convertList(list: List, opts: ConvertOptions, level: number): Block[] {
	const listItem = list.ordered ? "number" : "bullet";
	const out: Block[] = [];
	for (const item of list.children) {
		let first = true;
		for (const child of item.children) {
			if (child.type === "paragraph" && first) {
				out.push({ ...textBlock(child.children, "normal", opts), listItem, level });
				first = false;
			} else if (child.type === "list") {
				out.push(...convertList(child, opts, level + 1));
			} else if (child.type === "paragraph") {
				// Loose list: extra paragraphs in the same item stay at this level
				out.push({ ...textBlock(child.children, "normal", opts), listItem, level });
			} else {
				out.push(...convertBlock(child, opts, { type: listItem, level }));
			}
		}
	}
	return out;
}

function convertTable(table: Table, opts: ConvertOptions): Block {
	const rows = table.children.map((row, r) => ({
		_type: "tableRow",
		_key: key(),
		cells: row.children.map((cell, c) => {
			const { spans, markDefs } = inline(cell.children, opts);
			const align = table.align?.[c];
			return {
				_type: "tableCell",
				_key: key(),
				content: spans,
				...(markDefs.length ? { markDefs } : {}),
				...(r === 0 ? { isHeader: true } : {}),
				...(align ? { textAlign: align } : {}),
			};
		}),
	}));
	return { _type: "table", _key: key(), rows, hasHeaderRow: true };
}

function textBlock(children: PhrasingContent[], style: string, opts: ConvertOptions, listCtx?: { type: string; level: number }): Block {
	const { spans, markDefs } = inline(children, opts);
	return {
		_type: "block",
		_key: key(),
		style,
		markDefs,
		children: spans.length ? spans : [{ _type: "span", _key: key(), text: "", marks: [] }],
		...(listCtx ? { listItem: listCtx.type, level: listCtx.level } : {}),
	};
}

function inline(nodes: PhrasingContent[], opts: ConvertOptions) {
	const spans: Span[] = [];
	const markDefs: MarkDef[] = [];
	const walk = (list: PhrasingContent[], marks: string[]) => {
		for (const n of list) {
			switch (n.type) {
				case "text":
					push(n.value, marks);
					break;
				case "strong":
					walk(n.children, [...marks, "strong"]);
					break;
				case "emphasis":
					walk(n.children, [...marks, "em"]);
					break;
				case "delete":
					walk(n.children, [...marks, "strike-through"]);
					break;
				case "inlineCode":
					push(n.value, [...marks, "code"]);
					break;
				case "break":
					push("\n", marks);
					break;
				case "link": {
					const k = key();
					markDefs.push({ _type: "link", _key: k, href: n.url, ...(/^https?:/.test(n.url) && !n.url.includes("benyoung.blog") ? { blank: true } : {}) });
					walk(n.children, [...marks, k]);
					break;
				}
				case "image":
					// Inline images can't live in a text block; keep the alt as text and flag it
					opts.warn?.(`inline image inside text: ${n.url}`);
					push(n.alt ? `[${n.alt}]` : "", marks);
					break;
				case "html":
					// <br>, <sup> etc. inside a paragraph: keep the text, drop the tag
					if (/^<br\s*\/?>$/i.test(n.value)) push("\n", marks);
					else if (!/^<\/?[a-z][^>]*>$/i.test(n.value)) push(n.value, marks);
					break;
				default:
					opts.warn?.(`unhandled inline node: ${n.type}`);
			}
		}
	};
	const push = (text: string, marks: string[]) => {
		if (!text) return;
		const last = spans[spans.length - 1];
		if (last && last.marks.join() === marks.join()) last.text += text;
		else spans.push({ _type: "span", _key: key(), text, marks });
	};
	walk(nodes, []);
	return { spans, markDefs };
}

const LANG_ALIASES: Record<string, string> = { ps: "powershell", ps1: "powershell", posh: "powershell", sh: "bash", shell: "bash", yml: "yaml", js: "javascript", ts: "typescript", py: "python" };
function normaliseLang(lang: string) {
	const l = lang.toLowerCase();
	return LANG_ALIASES[l] ?? l;
}
