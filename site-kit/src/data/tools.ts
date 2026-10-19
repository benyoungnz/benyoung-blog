// Placeholder catalogue for the demo pages — swap for real projects. Hrefs are illustrative.
import type { ToolCategory } from './types';

export const toolCategories: ToolCategory[] = [
  {
    id: 'ai-mcp',
    title: 'AI & MCP',
    blurb: 'Servers and wrappers that let AI assistants talk to your backup data safely.',
    icon: 'bot',
    tone: 'violet',
    tools: [
      { slug: 'veeam-intelligence-mcp', title: 'Veeam Intelligence MCP wrapper', description: 'Streamable HTTP front end for the Veeam Intelligence MCP server, ready for Copilot and cloud agents.', icon: 'sparkles', badge: 'MCP', footnote: 'Node · Docker', href: '/tools/veeam-intelligence-mcp', tags: ['mcp', 'veeam'] },
      { slug: 'ai-cio', title: 'Ask the ransomware report', description: 'Chat with the Veeam Ransomware Trends Report and get cited answers.', icon: 'bot', badge: 'RAG', footnote: 'Demo app', href: '/tools/ai-cio', tags: ['ai', 'ransomware'] },
      { slug: 'kb-api', title: 'Veeam KB API', description: 'Search the Veeam knowledge base programmatically, with summaries on top.', icon: 'search', badge: 'REST', footnote: 'Hosted API', href: 'https://github.com/benyoungnz', external: true, tags: ['veeam', 'api'] },
    ],
  },
  {
    id: 'calculators',
    title: 'Calculators',
    blurb: 'Quick numbers for backup design conversations. Everything runs in your browser.',
    icon: 'chart',
    tone: 'mint',
    tools: [
      { slug: 'retention-calculator', title: 'Retention calculator', description: 'Restore points from a GFS policy: dailies, weeklies, monthlies and yearlies.', icon: 'calendar', badge: 'GFS', footnote: '14 / 4 / 12 / 3 by default', href: '/tools/retention-calculator', tags: ['veeam'] },
      { slug: 'change-rate', title: 'Change-rate estimator', description: 'Estimate incremental size and repository growth from daily change.', icon: 'chart', badge: '5% / day', footnote: 'Rough sizing only', href: '/tools/change-rate', tags: ['veeam'] },
    ],
  },
  {
    id: 'scripts',
    title: 'Scripts & APIs',
    blurb: 'Snippets and sample code from the API posts, tidied up so you can reuse them.',
    icon: 'terminal',
    tone: 'sky',
    tools: [
      { slug: 'vbo-restore-audit', title: 'M365 restore audit', description: 'Who restored what and when, pulled from the restore session API.', icon: 'shield', badge: 'v6+', footnote: 'PowerShell', href: '/tools/vbo-restore-audit', tags: ['veeam', 'security'] },
      { slug: 'veeam-one-reports', title: 'Veeam ONE report exporter', description: 'Schedule and export Veeam ONE reports through the REST API.', icon: 'server', badge: 'REST', footnote: 'Python', href: '/tools/veeam-one-reports', tags: ['veeam', 'api'] },
      { slug: 'throttle-tester', title: 'API throttle tester', description: 'See how the token endpoint throttles before you hit it in production.', icon: 'code', footnote: 'Node', href: '/tools/throttle-tester', tags: ['api'] },
    ],
  },
];
