// Animated explainers that can go inline in a post (Portable Text `explainer` block) or on a tool page.
// Each film is a canvas module loaded only on pages that show it.

export interface Film {
  width: number;
  height: number;
  duration: number;
  /** Section names; each beat's third value is an index into this */
  groups: string[];
  /** [start time in seconds, chapter label, group index] */
  beats: [number, string, number][];
  render(t: number, opts?: { holdCaptions?: boolean }): void;
}

export interface ExplainerInfo {
  title: string;
  /** One line under the title on the poster shown before the first play */
  tagline?: string;
  /** Tool page that hosts it full width, if there is one */
  href?: string;
  load: () => Promise<{ default: (ctx: CanvasRenderingContext2D) => Film }>;
}

export const explainers: Record<string, ExplainerInfo> = {
  'iresops-ai-agents': {
    title: 'Safe AI agents with Veeam Intelligent ResOps for Microsoft 365',
    tagline: 'See every agent, undo what it changes, trust what it reads',
    href: '/tools/iresops-ai-agents/',
    load: () => import('./iresops-ai-agents/film.js'),
  },
  'iresops-rot': {
    title: 'Finding and quarantining ROT with Veeam Intelligent ResOps for Microsoft 365',
    tagline: "Data you don't need is still data you can lose",
    href: '/tools/iresops-rot/',
    load: () => import('./iresops-rot/film.js'),
  },
  'iresops-classification': {
    title: 'Scanning and classifying data with Veeam Intelligent ResOps for Microsoft 365',
    tagline: 'Your agents are only as safe as your labels',
    href: '/tools/iresops-classification/',
    load: () => import('./iresops-classification/film.js'),
  },
};
