// Shapes the components expect. When wiring EmDash, map its entries onto these.

export type Tone = 'mint' | 'sky' | 'violet' | 'coral' | 'peach' | 'lime';
export const tones: Tone[] = ['mint', 'sky', 'violet', 'coral', 'peach', 'lime'];

export interface Author {
  name: string;
  role: string;
  avatar: string;
  href?: string;
  bio?: string;
}

export interface Post {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags: string[];
  heroImage?: string;
  /** Short title printed on a typographic cover when there is no image */
  coverTitle?: string;
  tone?: Tone;
  readingMinutes?: number;
}

export interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: import('../components/base/Icon.astro').IconName;
  /** Short highlighted value shown in the card's corner, e.g. "v2.1" or "MCP" */
  badge?: string;
  footnote?: string;
  href: string;
  external?: boolean;
  /** Post tags this tool relates to; drives "Related posts" on its page */
  tags?: string[];
  /** URL of a hosted build to show in the tool page's frame */
  embed?: string;
}

export interface ToolCategory {
  id: string;
  title: string;
  blurb: string;
  icon: Tool['icon'];
  tone: Tone;
  tools: Tool[];
}

export interface Faq {
  question: string;
  /** HTML string, so CMS rich text can be passed straight through */
  answer: string;
}

/** Stable tone for a string (tag, slug) so the same tag is always the same colour */
export function toneFor(key: string): Tone {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return tones[h % tones.length];
}
