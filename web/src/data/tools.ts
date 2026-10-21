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
    ],
  },
];

export const allTools = toolCategories.flatMap((category) => category.tools.map((tool) => ({ tool, category })));
