# benyoung.blog (new site)

The next version of benyoung.blog: [EmDash](https://docs.emdashcms.com/) 1.3 on Astro 7, running as one Cloudflare Worker with D1 (content) and R2 (media), styled with the `site-kit/` components. The old Astro 4 site in the repo root stays live until cutover (see `../MIGRATION_PLAN.md`).

## Local development

```sh
cd web
npm install
npm run dev                      # http://localhost:4321
```

On a fresh local database, finish setup without passkeys:

```sh
curl -X POST http://localhost:4321/_emdash/api/setup/dev-bypass
```

Then open the admin at http://localhost:4321/_emdash/admin (or visit `/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin` to sign in as the dev admin).

### Importing posts from the old site

```sh
node scripts/import.ts           # the 10-post pilot (edge cases)
node scripts/import.ts <slug>…   # specific posts
node scripts/import.ts --all     # everything in ../src/content/blog
```

- Reruns are safe. Posts are matched by slug and updated, and uploaded images are cached in `scripts/.cache/` so they aren't uploaded twice.
- Each run writes a per-post warning list to `scripts/.cache/import-report.json`.
- Against a deployed site, pass `--url https://… ` and `EMDASH_TOKEN=<API token>` (create the token in admin → Settings → API tokens).

What the importer keeps from each old post:
- **URL**: the slug the old site actually served (frontmatter `slug`, else the filename).
- **Dates**: the real publish date, plus `updatedDate` when the post has one.
- **Taxonomy**: categories normalised to one lowercase spelling, and tags.
- **Images**: the hero image and every body image, uploaded to R2. External hero images are copied in rather than hotlinked.

`scripts/lib/md-to-pt.ts` converts Markdown to Portable Text with remark: headings, nested lists, code fences (with language), tables, images (including the Ghost habit of gluing an image line onto the next paragraph), YouTube links and iframes, and raw HTML (kept as an HTML block and flagged).

## How it fits together

| Path | What |
|---|---|
| `seed/seed.json` | Schema: `posts` (title, description, hero image, cover title, content, updated date, legacy path), `videos` (title, YouTube id, description, published date, short flag), `category` + `tag` taxonomies, Ben's byline, primary menu. Applied once to an empty database |
| `src/lib/content.ts` | The only EmDash → site-kit adapter (`toPost`, `allPosts`, `headingsOf`, term helpers) |
| `src/components/{base,layout,blog,tools}` | Copied from `site-kit/`. `PostCover` now renders EmDash's responsive `<Image>` |
| `src/components/pt/` | Portable Text overrides: headings with TOC anchors, highlight.js code blocks |
| `src/components/site/` | Tag/category index and archive views |
| `src/pages/` | `/`, `/blog/`, `/blog/<slug>/`, `/videos/`, `/videos/<slug>/`, `/tags/…`, `/categories/…`, `/about/`, `/search/`, `/rss.xml`, 404 |
| `src/plugins/youtube-sync.ts` | Hourly YouTube → `videos` sync |
| `src/plugins/post-ai.ts`, `src/lib/ai.ts` | AI takeaways, related content and link suggestions on save |
| `scripts/` | Migration tooling (not deployed) |

**URLs match the old site.** Posts stay at `/blog/<slug>/`, tags at `/tags/<tag>/`, categories at `/categories/<category>/` (case-insensitive, so the old `/categories/AI/` still resolves), and the feed stays at `/rss.xml`.

**Images.** Requests go through Astro's image endpoint. In production that uses the Cloudflare Images binding (`IMAGES`, free for 5,000 unique transformations a month), which serves resized WebP with a `srcset`. Covers and body images get width hints, so phones don't download desktop images.

**Videos.** `/videos/` and `/videos/<slug>/` read the EmDash `videos` collection. Each entry is an editable copy of one YouTube upload.
- `src/plugins/youtube-sync.ts` (a native EmDash plugin, so it works on the free plan) checks the channel's RSS feed every hour and adds new uploads. The hourly run comes from EmDash's scheduler, which the Worker's 15-minute cron drives.
- It never edits or removes existing videos: edits made in the admin stick, and unpublishing a video hides it for good.
- Run a sync now (as an admin): `POST /_emdash/api/plugins/youtube-sync/sync`.
- The feed only lists the latest 15 uploads, so anything older never gets added. To backfill, swap `fetchChannelFeed` in `src/lib/youtube-feed.ts` for the YouTube Data API.

**SEO.**
- `/sitemap.xml` replaces EmDash's posts-only sitemap: it lists every post, video, tag, category and static page, with trailing slashes and `lastmod`. The old `/sitemap-index.xml` and `/sitemap-0.xml` (and EmDash's `/sitemap-<collection>.xml`) all 301 to it.
- Canonical URLs always use `benyoung.blog`.
- Share images: posts use their hero image, and videos use the YouTube thumbnail. Every other page uses `public/og-default.png`, rendered offline by `node scripts/og-image.ts`, because rendering cards per request would blow the free plan's CPU budget.
- Structured data: EmDash emits `WebSite` and `BlogPosting`. The layout adds `BreadcrumbList` (posts, videos, tags, categories) and `VideoObject` on video pages.

**AI (OpenRouter).** The `post-ai` plugin (`src/plugins/post-ai.ts`) runs when a post or video is saved in the admin. It never runs while a page is being viewed. It fills these fields:
- **Key takeaways** (`key_takeaways`): 3–5 "Lead: detail" lines, shown in the takeaways box at the top of the post. Written only when the field is empty and the post has real body text. Edit them freely; to regenerate, clear the field and save.
- **Related** (`related`): the 3 most similar posts, recomputed on every save from embeddings stored in the plugin's KV. Shown as "Related posts", topped up by shared tags if fewer than 3.
- **Internal link suggestions** (`link_suggestions`): phrases in the post worth linking to a similar post. These are for you to add by hand; nothing is linked automatically. Written when the field is empty.
- **Videos** (`related_posts`): the most similar posts, shown on the video page. A post also lists videos that point at it under "Watch the video".

Bulk tools, which work against the local site or a deployed one:
- `node scripts/takeaways.ts` backfills takeaways. It writes `scripts/takeaways-review.md` for review; `--apply` writes them to EmDash.
- `node scripts/interlink.ts` embeds every post, computes related lists and link suggestions, and writes `scripts/interlink-report.md` (orphans, posts with no internal links, every suggestion). `--apply` writes them to EmDash.

Needs `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`, default `~google/gemini-flash-latest`) in `web/.env` locally. In production it's a Worker secret: `npx wrangler secret put OPENROUTER_API_KEY`.

**Caching.** The `cache` provider and `routeRules` in `astro.config.mjs` let Cloudflare's CDN hold public pages for a day, with stale-while-revalidate for a week. Responses carry EmDash cache tags, and publishing an entry purges exactly the pages that show it. A page view only costs Worker CPU on a cache miss, which matters on the free plan's 10 ms CPU limit. Search, admin and API routes are never cached.

## Cloudflare (free plan)

- **Worker**: about 20 MB uncompressed. Cloudflare's current limit is 64 MiB on both Free and Paid, with no compressed-size cap.
- **D1** `benyoung-blog` and **R2** `benyoung-blog-media`: wrangler creates both on first deploy, so no ids are needed in `wrangler.jsonc`. It also creates the `SESSION` KV namespace that the adapter adds.
- **Cron**: every 15 minutes, for scheduled publishing and maintenance. That's 96 runs a day, against the template's every-minute default of 1,440.
- **Sandboxed plugins are off.** They need Worker Loader, which is Workers Paid ($5/mo). Config-defined plugins still work.

### Deploying from a laptop: `npm run ship`

```sh
cd web
npx wrangler login               # once
npm run ship -- --dry-run        # checks + build + compile, uploads nothing (no login needed)
npm run ship                     # the real thing
```

`scripts/deploy.ts` runs in this order:
1. **Preflight:** git branch/commit (asks before deploying uncommitted changes), free-plan config (no Worker Loader, no every-minute cron), Cloudflare login and account.
2. **Secrets:** compares `wrangler secret list` with what the site needs (`EMDASH_ENCRYPTION_KEY`, `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`). It uploads only the missing ones, with the deploy itself (`wrangler deploy --secrets-file`), so the very first deploy works too.
   - Values come from `web/.env.production` (gitignored).
   - Production gets its **own** `EMDASH_ENCRYPTION_KEY`, generated on first run. Back that file up: D1 backups don't include it.
   - For the OpenRouter values it offers to reuse what's in `web/.env`.
   - Secret values are never printed.
3. **Build:** `astro check`, `astro build`, then `wrangler deploy`, tagged with the commit message.
4. **Smoke test:** checks the key routes on the deployed URL, then prints next steps.

After the **first** deploy:
1. Open `https://benyoung-blog.<account>.workers.dev/_emdash/admin`, run the setup wizard (skip the sample content) and register your passkey.
2. Create an API token in admin → Settings → API tokens.
3. Keep the local dev server running, then import. The AI fields are copied from your local site rather than regenerated:

```sh
EMDASH_TOKEN=… node scripts/import.ts --all --url https://benyoung-blog.<account>.workers.dev --copy-ai-from http://localhost:4321
EMDASH_TOKEN=… node scripts/interlink.ts --url https://benyoung-blog.<account>.workers.dev
```

> **Passkeys are bound to the hostname they're created on.** Setting up on `workers.dev` and moving to `benyoung.blog` later means re-registering. Use **Settings → General → Change domain** at cutover, or put `/_emdash` behind Cloudflare Access. Back up `EMDASH_ENCRYPTION_KEY` outside D1.

### Automatic deploys on push (Workers Builds)

In the Cloudflare dashboard, open **Workers & Pages → benyoung-blog → Settings → Builds → Connect** and connect the GitHub repo:

| Setting | Value |
|---|---|
| Root directory | `web` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Production branch | `main` |
| Non-production branches | builds on, giving a preview URL per branch |

Code changes deploy on push. Content changes happen in the EmDash admin and go live without a deploy.
