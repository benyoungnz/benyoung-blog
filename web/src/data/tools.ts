// The /tools/ catalogue. Each internal tool gets a page at /tools/<slug>/ from pages/tools/[slug].astro.
// Explainers are components in src/components/explainers/, so posts can show the same one inline.
import type { ToolCategory } from './types';

export const toolCategories: ToolCategory[] = [
  {
    id: 'explainers',
    title: 'Explainers',
    blurb: 'Animated walkthroughs you can play, pause and present. Each one goes with a write-up on the blog.',
    icon: 'play',
    tone: 'violet',
    tools: [
      {
        slug: 'iresops-ai-agents',
        title: 'Safe AI agents with Veeam Intelligent ResOps for Microsoft 365',
        description:
          'An animated walkthrough of finding every AI agent in your Microsoft 365 tenant, keeping the data they read accurate and safe, and undoing what they get wrong.',
        icon: 'bot',
        badge: 'Explainer',
        footnote: '3 parts, 23 chapters',
        href: '/tools/iresops-ai-agents/',
        tags: ['iresops', 'microsoft365', 'ai'],
        explainer: 'iresops-ai-agents',
        post: 'ai-agents-microsoft-365-iresops',
        about: [
          'AI agents are already in most Microsoft 365 tenants. Copilot, agents built in Copilot Studio, SharePoint and Dynamics 365, and external agents like Claude Desktop that users connect themselves. They read whatever they can reach and change data at machine speed.',
          'This explainer walks through the three things you need before you scale them. See every agent and what it can reach. Trust the context it answers from. Undo exactly what it changed when something goes wrong.',
          'Play it end to end, or turn on "Pause at each chapter" and click through it in a meeting. The agent inventory and activity numbers come from a demo tenant. Northwind Group is a fictional company.',
        ],
        parts: [
          { label: 'Discover the agents', text: 'Copilot, custom and external agents, and what each one can reach.' },
          { label: 'When agents change data', text: "Isolate one agent's changes and undo only those, from an independent backup." },
          { label: 'Trusted context', text: 'Clean up ROT and label sensitive data so agents answer from the right files.' },
        ],
      },
      {
        slug: 'iresops-rot',
        title: 'Finding and quarantining ROT with Veeam Intelligent ResOps for Microsoft 365',
        description:
          'An animated walkthrough of how redundant, obsolete and trivial data piles up in Microsoft 365, what it exposes you to, and how iResOps finds it and stages it out of reach.',
        icon: 'archive',
        badge: 'Explainer',
        footnote: '4 parts, 19 chapters',
        href: '/tools/iresops-rot/',
        tags: ['iresops', 'microsoft365', 'rot'],
        explainer: 'iresops-rot',
        post: 'rot-data-you-can-lose',
        about: [
          'Every Microsoft 365 tenant collects redundant, obsolete and trivial data (ROT). Copies, old versions, drafts and clutter that nobody opens any more but everybody can still reach.',
          "This explainer walks through why that matters beyond storage. Old files can be stolen, encrypted, pulled into a data request or quoted back by an AI agent. Then it shows how iResOps finds ROT with context, and how quarantine and your own retention policies take it out of reach.",
          'Play it end to end, or turn on "Pause at each chapter" and click through it in a meeting. Northwind Group is a fictional company, and the file counts and dates are illustrative.',
        ],
        parts: [
          { label: 'How ROT piles up', text: 'One file becomes eight, and years later most of it is never touched again.' },
          { label: 'Data you can lose', text: 'Stolen, encrypted, in scope for requests and surfaced by AI agents.' },
          { label: 'Find it with context', text: 'Redundant, obsolete and trivial, plus where it lives, who can reach it and what is inside.' },
          { label: 'Quarantine, not delete', text: 'Review, stage it out of reach, and let your retention policies do the deletion.' },
        ],
      },
    ],
  },
];

export const allTools = toolCategories.flatMap((category) => category.tools.map((tool) => ({ tool, category })));
