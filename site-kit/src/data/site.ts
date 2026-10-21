import type { Author } from './types';

export const site = {
  name: 'Ben Young',
  tagline: 'Notes on Veeam, data, automation and the AI that runs on top of it.',
  logo: '/logo.svg',
};

export const nav = [
  { label: 'Blog', href: '/blog' },
  { label: 'Tools', href: '/tools' },
  { label: 'Tags', href: '/tags' },
  { label: 'About', href: '/about' },
];

export const headerCta = { label: 'Subscribe', href: '/rss.xml' };

export const footerCta = {
  title: 'New posts, roughly twice a month.',
  label: 'Get the RSS feed',
  href: '/rss.xml',
};

export const footerColumns = [
  {
    title: 'Write-ups',
    tone: 'mint',
    links: [
      { label: 'All posts', href: '/blog' },
      { label: 'AI & data', href: '/blog?tag=ai' },
      { label: 'Security', href: '/blog?tag=security' },
      { label: 'Veeam APIs', href: '/blog?tag=veeam' },
    ],
  },
  {
    title: 'Tools',
    tone: 'violet',
    links: [
      { label: 'Veeam Intelligence MCP', href: '/tools/veeam-intelligence-mcp' },
      { label: 'Retention calculator', href: '/tools/retention-calculator' },
      { label: 'All tools', href: '/tools' },
    ],
  },
  {
    title: 'Elsewhere',
    tone: 'sky',
    links: [
      { label: 'GitHub', href: 'https://github.com/benyoungnz' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
      { label: 'RSS', href: '/rss.xml' },
    ],
  },
] as const;

export const author: Author = {
  name: 'Ben Young',
  role: 'Writing about Veeam, data and AI',
  avatar: '/benyoung.jpg',
  href: '/about',
  bio: 'I build things on top of backup data and write about what I learn: APIs, MCP servers, security and the people side of tech.',
};
