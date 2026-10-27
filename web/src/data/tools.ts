// The /tools/ catalogue. Each internal tool gets a page at /tools/<slug>/ from pages/tools/[slug].astro.
// Explainers are components in src/components/explainers/, so posts can show the same one inline.
import type { ToolCategory } from './types';

export const toolCategories: ToolCategory[] = [
  {
    id: 'explainers',
    title: 'Veeam Intelligent ResOps explainers',
    blurb: 'Animated walkthroughs of Veeam Intelligent ResOps for Microsoft 365. AI agents, ROT and classification.',
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
        post: 'rot-data-is-a-risk-four-ways-you-can-lose',
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
      {
        slug: 'iresops-classification',
        title: 'Scanning and classifying data with Veeam Intelligent ResOps for Microsoft 365',
        description:
          'An animated walkthrough of how iResOps finds sensitive data across Microsoft 365, works out what it is with context rather than patterns, and turns that into labels Purview can enforce.',
        icon: 'search',
        badge: 'Explainer',
        footnote: '4 parts, 18 chapters',
        href: '/tools/iresops-classification/',
        tags: ['iresops', 'microsoft365', 'ai'],
        explainer: 'iresops-classification',
        post: 'labels-you-can-trust-classification',
        about: [
          'Sensitivity labels are only useful when people trust them, and that comes down to the classification behind them. AI agents raise the stakes. Miss a sensitive file and an agent reads it anyway. Over-label and people stop trusting the labels.',
          'This explainer walks through how iResOps scans Microsoft 365, why patterns on their own produce false positives and false negatives, how data elements, exact data profiles, document types and content profiles build up a classification, and how policy and Purview DLP act on it.',
          'Play it end to end, or turn on "Pause at each chapter" and click through it in a meeting. Northwind Group is a fictional company, and the people, numbers and file counts are illustrative.',
        ],
        parts: [
          { label: 'Where is it', text: 'Scan SharePoint, OneDrive and Teams to find where sensitive data lives.' },
          { label: 'What is it', text: 'One number, three meanings. Why patterns fail and context decides.' },
          { label: 'How it decides', text: 'Data elements, exact data profiles and document types, combined by rules.' },
          { label: 'Why it matters', text: 'Toxic combinations, policy, and labels Purview DLP can enforce on agents.' },
        ],
      },
    ],
  },
  {
    id: 'ai-explainers',
    title: 'AI explainers',
    blurb: 'Animated walkthroughs of how AI agents work, the protocols they use and what I have built with them in my lab.',
    icon: 'sparkles',
    tone: 'sky',
    tools: [
      {
        slug: 'ag-ui',
        title: 'How AG-UI works',
        description:
          'An animated walkthrough of AG-UI, the open protocol between an agent and the application a person is looking at. Where it sits next to MCP and A2A, the event stream, how a client renders tool calls, shared state and human in the loop.',
        icon: 'code',
        badge: 'Explainer',
        footnote: '5 parts, 25 chapters',
        href: '/tools/ag-ui/',
        tags: ['ag-ui', 'ai', 'mcp'],
        explainer: 'ag-ui',
        post: 'ag-ui-the-layer-mcp-doesnt-cover',
        about: [
          'MCP connects an agent to tools and data. It has nothing to say about the person in front of it. AG-UI is the open protocol for that joint, an event stream that carries text, tool calls, shared state and pauses for a decision between an agent and the application someone is using.',
          'This explainer covers the protocol. Why request and response breaks for agents, what a client posts and what streams back, how a client renders its own components from tool calls, how shared state travels beside the messages, and how a pause for a person is expressed as a tool call.',
          'The examples come from the Veeam Agent Terminal, a lab build against Veeam Backup & Replication that is not a Veeam product. What I built on top of the protocol has its own explainer, Building a better agent interface.',
        ],
        parts: [
          { label: 'Where it sits', text: 'MCP, A2A and AG-UI, three protocols at three different joints.' },
          { label: 'Why request and response breaks', text: 'Agents run long, take steps, return structure and stop to ask.' },
          { label: 'The communication path', text: 'RunAgentInput in, typed events out, over any transport, with middleware for existing frameworks.' },
          { label: 'How UI gets rendered', text: 'Tool calls as structured events, keyed by name, with client and backend tools.' },
          { label: 'State and human in the loop', text: 'Snapshots and JSON Patch deltas, and a pause expressed as a tool call.' },
        ],
      },
      {
        slug: 'agent-interface',
        title: 'Building a better agent interface',
        description:
          'An animated walkthrough of the Veeam Agent Terminal, a lab build on AG-UI. Tools designed for the agent, my own components, just-in-time access, approvals through a gateway, latency, and the honesty fixes the interface needed.',
        icon: 'terminal',
        badge: 'Explainer',
        footnote: '7 parts, 31 chapters',
        href: '/tools/agent-interface/',
        tags: ['ag-ui', 'ai', 'mcp'],
        explainer: 'agent-interface',
        post: 'building-agent-tools-not-an-api-wrapper',
        about: [
          'I did not want the model inventing a UI. I wanted my UI, driven by the agent. The Veeam Agent Terminal is a lab build against the Veeam Backup & Replication REST API and a Veeam Data Cloud technical preview surface. It is not a Veeam product.',
          'This explainer walks through what I built on AG-UI and why. Composite tools instead of an API wrapper, a renderer map and receipts, quick actions that write prompts rather than calls, grants taken just in time, approvals that go to a gateway rather than the agent, model tiering, and the places the interface had to be made honest.',
          'Play it end to end, or turn on "Pause at each chapter" and click through it in a meeting. Capability names are real. Job names, counts and dashboard values are illustrative. Framework findings are stamped Agno 2.9, ag-ui-protocol 0.1.20 and @ag-ui/client 0.0.57, and may be fixed upstream. One approval case was still open at the time of writing. When a specialist calls a privileged capability directly, the run pauses but no card renders.',
        ],
        parts: [
          { label: 'Tools for the agent', text: 'Composites instead of a tool per endpoint, and risk set in the tool.' },
          { label: 'Your components', text: 'Declared output shapes, one renderer map, receipts and history replay.' },
          { label: 'Quick actions', text: 'Menus that write prompts, generated from what the product allows.' },
          { label: 'Just-in-time access', text: 'A grant list that records what the agent touched, not what it might.' },
          { label: 'Approvals', text: 'A privileged call pauses, and the decision goes to the gateway.' },
          { label: 'Latency is interface', text: 'Model tiers, measured waits, and a counter so a wait reads as progress.' },
          { label: 'Honest interfaces', text: 'Silent failures, echoed receipts and other comfortable untruths, fixed.' },
        ],
      },
    ],
  },
];

export const allTools = toolCategories.flatMap((category) => category.tools.map((tool) => ({ tool, category })));
