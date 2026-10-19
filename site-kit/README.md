# Ben Young site kit

Reusable Astro components, tokens and base styles for the blog + tools site. Light mode, colourful, built on the letter-B logo. Layout patterns were studied from onigiri.one's blog and tools pages (reference only — no copy, assets, palette or fonts taken; see `capture/plan.md`).

```sh
cd site-kit
npm install
npm run dev        # http://localhost:4321
npm run build && npm run preview
```

| Page | What it shows |
|---|---|
| `/styleguide` | **Start here.** Tokens, type, every module live, with props and snippets |
| `/blog` | Listing: hero, featured row, tag filters, load more |
| `/blog/the-mcp-backdoor` | Post: header, sticky TOC sidebar, prose, callout, FAQ, author, related |
| `/tools` | Tools hub: split hero, category chips, category blocks with tool cards |
| `/tools/retention-calculator` | Hand-built tool page: hero, embed area + aside, steps, colour band, tiles |
| `/tools/[slug]` | Template for every other internal tool in `tools.ts`; set `embed` to frame a hosted project, `tags` for related posts |
| `/tags`, `/tags/[tag]` | Topic index with counts; per-tag posts + matching tools |
| `/about` | Profile card, bio, topics, recent posts |
| `/rss.xml`, `/404` | Feed (from `posts.ts`) and not-found page |

## Files

```
src/styles/tokens.css   all raw values (colours, type, space, radii, shadows, motion)
src/styles/base.css     fonts, reset, element defaults, 5 utilities (.container .eyebrow .lede .link .dot-grid)
src/styles/prose.css    long-form content, scoped under .prose
src/components/base     Button Chip Badge Icon IconBlob Avatar Breadcrumbs
src/components/layout   Section SectionHeading Grid SiteHeader SiteFooter
src/components/blog     PostCover PostCard PostGrid PostBrowser PostHeader ArticleLayout Prose
                        Callout TableOfContents AuthorMini AuthorCard CtaCard LinkList Faq
src/components/tools    SplitHero CenteredHero StatCard MetaList CategoryNav ToolCategory ToolCard
                        ToolEmbed Panel Steps FeatureBand NumberedList LinkTile
src/data/types.ts       Post, Tool, ToolCategory, Author, Faq, Tone + toneFor()
src/data/*.ts           sample content (replace with EmDash queries)
```

Import alias: `@kit/*` → `src/components/*`, `@data/*`, `@styles/*`.

## Cheat sheet

| Module | Use for | Key props |
|---|---|---|
| `Button` | Any CTA | `variant` primary·secondary·outline·ghost, `size`, `href`, `icon`, `iconStart`, `block` |
| `Chip` | Tags, filters, jump links | `href` or toggle, `active`, `tone` (dot), `count`, `size`, `static` |
| `Badge` | Value pills on cards | `tone` |
| `Icon` / `IconBlob` | Icons; icon-on-blob “illustration” | `name`, `size`, `label` / `tone` |
| `Avatar`, `Breadcrumbs` | — | `src alt size` / `items` |
| `Section` | Every full-width band | `tone` paper·surface·Tone, `space`, `narrow`, `dots` |
| `SectionHeading` | Eyebrow + title + lede | `level` (outline) vs `size` (look), `align`, slot `actions` |
| `Grid` | Tiles/cards | `cols` 2·3·4, `gap` |
| `PostCover` | Photo or typographic cover | `post`, `size` card·hero, `eager` |
| `PostCard` / `PostGrid` | Post teasers, 3→2→1 | `post` / `posts`, `eagerFirst` |
| `PostBrowser` | Filterable “All posts” | `posts`, `pageSize`; reads `?tag=` |
| `PostHeader` | Top of a post | `post`, `crumbs` |
| `ArticleLayout` | Content + sticky sidebar | slots: default, `aside`, `toc-mobile` |
| `Prose` | Wrap CMS/Markdown HTML | — |
| `Callout` | Takeaways, tip, warning, note | `type`, `title` |
| `TableOfContents` | Active-section TOC | `headings`, `maxDepth`, `collapsible` |
| `AuthorMini` / `AuthorCard` | Byline | `author` |
| `CtaCard` | Coloured promo | `title href action tone` + slot |
| `LinkList` | Sidebar link lists | `title links more` |
| `Faq` | Accordion + JSON-LD | `items` (answer = HTML), `exclusive`, `schema` |
| `SplitHero` / `CenteredHero` | Hub / tool heroes | `title lede tone`, slot `visual` |
| `StatCard` | Floating result card | `label value sub tone tilt` |
| `MetaList` | Icon facts row | `items`, `align` |
| `CategoryNav` / `ToolCategory` | Tools hub | `categories` / `category index` |
| `ToolCard` | One tool/project | `tool tone` |
| `ToolEmbed` + `Panel` | Embed a project (iframe `src`) or island | `src title height`, slot `aside` |
| `Steps` | How it works | `steps` |
| `FeatureBand` + `NumberedList` | Colour band checklist | `title tone flip`, slot `visual` / `items` |
| `LinkTile` | Compact cross-links | `href title text icon tone variant` |

## Rules

1. Raw values live only in `tokens.css`.
2. One `tone` per object: tint fills, deep marks icons/dots.
3. Mint (`--mint`) is a fill and underline colour, never text on white. Use `--brand-ink` for small sage text.
4. `SectionHeading` `level` sets the outline, `size` sets the look.
5. Interactive bits enhance complete HTML (filters, load more, TOC); FAQ is native `<details>`.
6. Scoped styles don't reach a child component's root: wrap it, or use `:global(.class)` from the parent.

## Moving into the EmDash site

- EmDash 1.3 needs Astro ≥ 6; the kit is on Astro 7.4. Copy `src/components`, `src/styles`, `src/data/types.ts`, `src/data/format.ts`, the tsconfig `paths`, and the three `@fontsource-variable/*` packages.
- Map EmDash entries onto `Post` / `Tool` in one adapter, then pass them to the modules unchanged.
- Render rich text inside `<Prose>`; feed `TableOfContents` from the rendered headings (each needs an `id`).
- `src/data/site.ts` holds nav, footer columns, CTA and author. Move these to EmDash settings if you want them editable.
- The current blog's frontmatter (`title description pubDate updatedDate heroImage tags`) already matches `Post`.
