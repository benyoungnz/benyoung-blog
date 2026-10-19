# Blog migration plan

Move benyoung.blog off the EV0 Astro theme in the repo root. The new site lives in **`web/`** and runs EmDash on Cloudflare Workers, styled with the `site-kit/` components. The old site stays live on Netlify until cutover.

## Requirements

1. Use the `site-kit/` template, styles and modules as the theme.
2. Migrate the blog posts. Along the way, flag any posts that could become a tool.
3. Review every old Markdown file and fix what broke in the earlier Ghost → Markdown migration (inline code, YouTube embeds, etc.).
4. Add a Videos section that pulls in every video from [@benyoungrambles](https://www.youtube.com/@benyoungrambles) automatically.
5. Content is edited in EmDash, themed with the kit. Start with a small pilot migration.
6. Image resize helpers wherever images are rendered.
7. Tools: **parked**. We pick it up after the blog is live, using Ben's sample tools. The likely model is a mix of content, external links, embeds and free tools that run on the site.
8. Keep the same URLs, or redirect them, so indexed links keep working. Migrate all existing images.
9. Host on Cloudflare: a Worker (free tier if possible), with R2 for assets. Deploys run automatically on push; content changes happen in EmDash.

## What we found

**Current site**: Astro 4.5, Tailwind, Netlify adapter, 113 `.md` posts.

**Live URLs** (from `benyoung.blog/sitemap-0.xml`):
- `/`, `/about/`, 123 `/blog/…` paths (posts plus pagination), 10 `/categories/…`, 84 `/tags/…`.
- Every URL has a **trailing slash**.
- Post URLs come from frontmatter `slug`. Nine differ from the filename, and one is empty, so it falls back to the filename.
- Categories are duplicated by case (`/categories/ai/` and `/categories/AI/`).
- `public/_redirects` holds 101 old Ghost root paths that redirect to `/blog/<slug>`.

**Images**: about 312 MB in `public/content/images/2019…2026`, with 605 inline references. Four hero images live outside that folder.

**Markdown damage** (first automated pass, not yet the full review):
- Only **1** post references YouTube at all, and that one is a plain link. Video posts such as `introducing-the-veeam100-vlog…` have blank lines where the embeds used to be, so the embeds were dropped in the Ghost export.
- 6 posts mention iframes, tweets or gists that likely no longer render.
- 2 posts have unbalanced code fences (`creating-a-christmas-cracker-alarm-dashboard…`, `veeam-enterprise-manager-failing-data-collection…`).
- 6 posts have an odd number of backticks, i.e. broken inline code (`api-changes-in-veeam-backup-for-office365-v5` is the worst).
- 25 posts have 4-space-indented code with no fence, so no highlighting and possibly mangled.
- 2 posts contain HTML-escaped entities (`&lt;` etc.). 9 posts contain raw HTML tables or divs.

**Tool candidates**: posts linking to Ben's own repos. Examples: `veeam-repository-reporter`, `VeeamONEReceiver`, `veeam-intelligence-mcp-streamable`, `vanguard-templates`, plus the API and PowerShell how-to series. The full list comes out of phase 3.

**EmDash on Cloudflare** (from public write-ups, to confirm against the repo docs during scaffolding):
- Runs as a Worker with D1 for content and R2 for media. `npm create emdash@latest` has a blog template with a Cloudflare target.
- The **free plan works** if we drop the `LOADER` / `worker_loaders` binding. That binding runs sandboxed marketplace plugins as Dynamic Workers, which needs Workers Paid ($5/mo). Native, config-defined plugins still work on free.
- The default cron runs every minute: 1,440 of the free plan's 100k daily requests gone before any visitor arrives. Slow it down.
- 1.0 was reportedly released in late September 2026. The site kit assumed EmDash 1.3 and Astro ≥ 6. We pin the exact version at scaffold time.

## Architecture

```
GitHub push ──► Workers Builds ──► Worker (Astro 7 + EmDash, site-kit theme)
                                     ├─ D1   posts, pages, taxonomies, videos, settings
                                     ├─ R2   media (migrated /content/images + new uploads)
                                     ├─ Cron YouTube sync, content backup
                                     └─ Cache public pages cached at the edge
EmDash admin (/_emdash) ──► D1 / R2          (content edits, no deploy needed)
```

- **Theme**: copy the kit's components, styles, `types.ts` and fonts into `web/`. One adapter maps EmDash entries onto the kit's `Post` type, so the components stay unchanged.
- **Rendering**: EmDash stores Portable Text. Add renderers for code blocks (Shiki, matched to the kit palette), YouTube, tables, callouts and images.
- **Free-tier CPU** (10 ms per request): cache public pages at the edge and purge on publish. Otherwise every page view queries D1 and SSR-renders on the Worker.

## Status (2026-10-19)

**Phase 1 done locally, not deployed.**
- `web/` runs EmDash 1.3.1 + Astro 7.4 with the site-kit theme. Setup and deploy steps are in `web/README.md`.
- Ten pilot posts imported into local D1/R2 by `web/scripts/import.ts` with zero warnings, keeping real dates, slugs, categories, tags, hero and body images.
- Checked:
  - `astro check` is clean, and the production build passes.
  - Every route returns the right status: posts, `/blog/`, `/tags/…`, `/categories/…` (case-insensitive), `/about/`, `/search/`, `/rss.xml`, 404.
  - No horizontal overflow at 390px on the pilot posts. Edge-cache headers and tags appear on the production preview.
- Phase 4 and 5 work done early: the Markdown → Portable Text converter, and responsive images through Cloudflare Images.
- Facts that changed from the earlier plan:
  - Worker size isn't a constraint. It's about 20 MB uncompressed, and Cloudflare now allows 64 MiB on Free.
  - Free-plan CPU (10 ms) is handled by edge caching, with purge on publish.
  - Body images are now in R2 under EmDash media keys. The old `/content/images/...` URLs still need redirects or a mirror (phase 5).

**New audit findings** (feed into phase 3):
- 64 of 113 posts have frontmatter only js-yaml accepts. The importer uses js-yaml, as Astro did.
- Some descriptions are cut off mid-sentence (e.g. `a-look-at-the-enhanced-veeam-vbo-v6-restore-session-api…` ends at "when the"), which suggests a truncated Ghost excerpt.
- Broken bold such as `**server **`, where the space before the closing `**` stops it rendering.
- Code blocks with a stray 4-space indent on every line (k3s post).
- A converter dry run over all 113 posts found **zero** YouTube embeds or iframes. Every video embed was lost in the old export and has to be recovered from the Wayback Machine or the live Ghost-era HTML.

## Phases

### 1. Scaffold `web/` ✅
- Run `create emdash` (blog template, Cloudflare). Remove the `LOADER` binding and set a sane cron.
- Set up `wrangler.jsonc` with D1, R2 and cron triggers. Use a `workers.dev` URL until cutover.
- Bring in the site-kit theme. Rebuild the kit's pages (blog, post, tags, about, 404, rss) on EmDash queries.
- Connect the GitHub repo to Workers Builds with the root directory set to `web/`. Every push to `main` deploys, and other branches get preview URLs.

### 2. Content model in EmDash
- **Post**: title, slug, description, pubDate, updatedDate, hero image (media), body (Portable Text), tags, category, author, legacy path.
- **Video**: YouTube id, title, description, published date, thumbnail, duration, short/long flag, optional related post.
- **Settings**: nav, footer, CTA and author, moved out of the kit's `site.ts`.
- **Taxonomy**: categories get normalised to one case. Decide whether categories survive as their own pages or become tags. Either way the old URLs redirect.

### 3. Markdown audit (all 113 posts, before import)
- Add a lint script to `web/scripts/audit.ts` that checks for: unbalanced fences and backticks, unfenced indented code, HTML entities, raw HTML, empty-line runs where embeds were, broken image paths, and dead internal links.
- Compare each post against its live page and, where it helps, against the Wayback Machine's Ghost-era copy. That recovers lost YouTube IDs, iframes and gists.
- Output one report row per post: issues, proposed fix, whether it's a tool candidate. Fixes get applied in a scripted pass plus hand edits, reviewed as a diff in git before import.

### 4. Importer and pilot migration
- `web/scripts/import.ts` (rerunnable, idempotent on slug) does four things:
  - parses the Markdown,
  - converts it to Portable Text (code, tables, embeds, images),
  - uploads referenced images to R2 through EmDash media,
  - creates the posts.
- **Pilot: about 10 posts** chosen to cover the edge cases: a long API post with code, a raw-HTML table post, a video post, a custom-slug post, the empty-slug post, an image-heavy post, and a recent opinion piece. Ben reviews them in the admin and on the preview URL.
- Then the remaining posts. The script reports counts, failures and unresolved images.

### 5. Images
- Upload all of `public/content/images/**` to R2 at the same key path. Serve old `/content/images/...` URLs from the Worker (or a custom R2 domain), so external hotlinks keep working.
- Resize helpers: a `<Picture>`-style component that requests widths and formats through Cloudflare image transformations (free allowance), with `srcset` and sizes defaults for cover, card, inline and avatar use. No sharp on Workers, so nothing runs at build time.
- Admin uploads go through the same path.

### 6. Videos section (automatic)
- A cron Worker (daily) calls the YouTube Data API v3. It resolves `@benyoungrambles` to its uploads playlist, pages through the **whole** back catalogue and upserts Video entries. Reuse the API key flow from `scripts/youtube.cjs`.
- Pages: `/videos/` (grid, filter by long/short and topic) and `/videos/<slug>/` (lite-youtube embed, description, related posts). Plus a "Latest videos" module for the homepage and posts.
- The Portable Text YouTube block uses the same lite embed, so restored embeds inside old posts look the same.

### 7. URLs, redirects and SEO
- Match trailing slashes: `/blog/<slug>/`, `/tags/<tag>/`, `/about/`.
- Redirects: carry over the 101 Ghost paths. Also handle pagination (`/blog/2/`…), `/categories/*`, case-duplicated categories and any renamed tags. The first two use Workers static `_redirects` or a redirect table in D1 that EmDash can edit.
- Keep `/rss.xml` and `/sitemap-index.xml`, and keep canonical and OG/Twitter meta. Generate OG images at the edge or on publish.
- **Parity check**: crawl every URL in the live sitemap against the preview. Each must return 200 or a 301 to a 200.

### 8. Cutover
- Move DNS for benyoung.blog to Cloudflare if it's not there already. Copy the MX/TXT records exactly.
- Add the custom domain to the Worker. Run the parity crawl again on production. Resubmit the sitemap in Search Console.
- Ship a self-unregistering service worker at the old PWA path, so returning visitors don't stay on the cached Netlify site.
- Keep Netlify around for a week as a fallback, then retire the root site and `site-kit/`.

### Later: Tools (parked)
- Start from Ben's samples. Ingredients: a Tool collection in EmDash (type: internal/embed/external), the kit's tool modules (hub, category blocks, tool page template, embed frame), and the tool candidates from phase 3.

## Things you didn't mention (worth deciding)
- **Backing up EmDash content.** The posts now live in D1, not git. Plan: D1 Time Travel, plus a nightly cron that exports to R2 and/or commits JSON/Markdown to the repo. A Veeam person's blog should survive its own database.
- **Admin access.** Put `/_emdash` behind Cloudflare Access (free for small teams) on top of EmDash's own login.
- **Analytics.** Replace GA/Partytown with Cloudflare Web Analytics (free, no cookie banner), or keep GA.
- **Search.** Use EmDash/D1 search or Pagefind. 113+ posts deserve one.
- **Drafts, preview links and scheduled publishing** in EmDash. The cron interval sets how precise scheduling can be.
- **Dark mode.** The kit is light only and the current site has dark mode. Is dropping it OK?
- **Newsletter or comments?** Neither exists today. Add them now or not at all?
- **Free-tier limits.** 100k requests/day, 10 ms CPU, D1 5 GB, R2 10 GB with free egress, and an image transformation allowance. Fine for this blog if pages are edge-cached. Upgrade to $5/mo only if plugins are wanted.
- **Secrets.** Store the YouTube API key and any tokens as Worker secrets, never in the repo.

## Open questions
- Categories: keep them as their own pages, or fold them into tags?
- Do any posts get pruned, or are any too stale to carry over?
- Is DNS for benyoung.blog already on Cloudflare?
- Should old images stay at `/content/images/...` (recommended for hotlinks), or move to an R2 custom domain with redirects?
