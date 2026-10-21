import type { Author } from './types';

export const site = {
  name: 'Ben Young',
  tagline: 'Notes on AI, data resilience and the APIs that connect them.',
  logo: '/logo.svg',
};

// Fallback only: the live nav is the EmDash "primary" menu (admin → Menus)
export const nav = [
  { label: 'Blog', href: '/blog/' },
  { label: 'Videos', href: '/videos/' },
  { label: 'Tools and Explainers', href: '/tools/' },
  { label: 'Tags', href: '/tags/' },
  { label: 'About', href: '/about/' },
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
      { label: 'All posts', href: '/blog/' },
      { label: 'Videos', href: '/videos/' },
      { label: 'Tools', href: '/tools/' },
      { label: 'AI & data', href: '/blog/?tag=ai' },
      { label: 'Security', href: '/blog/?tag=security' },
      { label: 'Veeam APIs', href: '/blog/?tag=api' },
    ],
  },
  {
    title: 'Topics',
    tone: 'violet',
    links: [
      { label: 'Veeam', href: '/categories/veeam/' },
      { label: 'AI', href: '/categories/ai/' },
      { label: 'Tech Field Day', href: '/categories/tfd/' },
      { label: 'All tags', href: '/tags/' },
    ],
  },
  {
    title: 'Elsewhere',
    tone: 'sky',
    links: [
      { label: 'GitHub', href: 'https://github.com/benyoungnz' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ben-young-nz/' },
      { label: 'YouTube', href: 'https://www.youtube.com/@benyoungrambles' },
      { label: 'RSS', href: '/rss.xml' },
    ],
  },
] as const;

export const author: Author = {
  name: 'Ben Young',
  role: 'Field CTO, APJ at Veeam',
  avatar: '/benyoung.jpg',
  href: '/about/',
  bio: 'I build things on top of backup data and write about what I learn: APIs, MCP servers, security and the people side of tech.',
};
