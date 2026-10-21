# benyoung.blog

[EmDash](https://docs.emdashcms.com/) 1.3 on Astro 7, running as one Cloudflare Worker with D1 (content) and R2 (media), styled with the `site-kit/` components. Live at https://benyoung.blog since October 2026. The previous Astro 4 site (and the Ghost-era content it carried) is in git history at the `legacy-site` tag.

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
| `scripts/` | Deploy, AI backfill (`takeaways.ts`, `interlink.ts`) and share-card tooling (not deployed) |
| `public/_redirects` | Old URLs from the previous sites: Ghost root paths, `/blog/2/`… pagination and `/content/images/…` files, all 301s. Applied by Workers static assets before the Worker runs (limit 2,000 rules) |

**URLs match the old site.** Posts stay at `/blog/<slug>/`, tags at `/tags/<tag>/`, categories at `/categories/<category>/` (case-insensitive, so the old `/categories/AI/` still resolves), and the feed stays at `/rss.xml`.

**Images.** Requests go through Astro's image endpoint. In production that uses the Cloudflare Images binding (`IMAGES`, free for 5,000 unique transformations a month), which serves resized WebP with a `srcset`. Covers and body images get width hints, so phones don't download desktop images.

**Videos.** `/videos/` and `/videos/<slug>/` read the EmDash `videos` collection. Each entry is an editable copy of one YouTube upload.
- `src/plugins/youtube-sync.ts` (a native EmDash plugin, so it needs no Worker Loader) checks the channel's RSS feed every hour and adds new uploads. The hourly run comes from EmDash's scheduler, which the Worker's 15-minute cron drives.
- It never edits or removes existing videos: edits made in the admin stick, and unpublishing a video hides it for good.
- Run a sync now (as an admin): `POST /_emdash/api/plugins/youtube-sync/sync`.
- The feed only lists the latest 15 uploads, so anything older never gets added. To backfill, swap `fetchChannelFeed` in `src/lib/youtube-feed.ts` for the YouTube Data API.

**SEO.**
- `/sitemap.xml` replaces EmDash's posts-only sitemap: it lists every post, video, tag, category and static page, with trailing slashes and `lastmod`. The old `/sitemap-index.xml` and `/sitemap-0.xml` (and EmDash's `/sitemap-<collection>.xml`) all 301 to it.
- Canonical URLs always use `benyoung.blog`.
- Share images: posts use their hero image, and videos use the YouTube thumbnail. Every other page uses `public/og-default.png`, rendered offline by `node scripts/og-image.ts`, because rendering cards per request would cost CPU on every share-card fetch.
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

**Caching.** The site rarely changes, so it caches as much as it can at Cloudflare's edge:

- **Pages**: the `cache` provider and `routeRules` in `astro.config.mjs` hold public pages for a day, with stale-while-revalidate for a week. Responses carry EmDash cache tags, and publishing an entry purges exactly the pages that show it. Browsers revalidate (`no-cache`), and the edge answers with a 304.
- **Media**: originals (`/_emdash/api/media/file/*`) and resized renditions (`/_image`) are held at the edge for a week, stale-while-revalidate for 30 days. `image.remotePatterns` lets `<Image>` resize EmDash media through the `IMAGES` binding, so phones get small WebP files. "Replace original" in the admin overwrites a key in place and isn't purged, so purge that URL in Cloudflare if you need the new file sooner.
- **Static files**: `/_astro/*` is fingerprinted and immutable. `public/_headers` gives the logo, favicon, photo and share card a week in the browser, and legacy `/content/*` images 30 days.
- Search, admin and the rest of the API are never cached.

## Cloudflare (Workers Paid, run conservatively)

The account is on Workers Paid, but the site still avoids paid-only features and keeps per-request CPU low, so it would run on the free plan too.

- **Worker**: about 20 MB uncompressed. Cloudflare's current limit is 64 MiB on both Free and Paid, with no compressed-size cap.
- **D1** `benyoung-blog` and **R2** `benyoung-blog-media`: wrangler creates both on first deploy, so no ids are needed in `wrangler.jsonc`. It also creates the `SESSION` KV namespace that the adapter adds.
- **Cron**: every 15 minutes, for scheduled publishing and maintenance. That's 96 runs a day, against the template's every-minute default of 1,440.
- **Sandboxed plugins are off.** They need Worker Loader (Workers Paid). Uncomment `worker_loaders` in `wrangler.jsonc` to use them. Config-defined plugins work either way.

### Deploying from a laptop: `npm run ship`

```sh
cd web
npx wrangler login               # once
npm run ship -- --dry-run        # checks + build + compile, uploads nothing (no login needed)
npm run ship                     # the real thing
```

`scripts/deploy.ts` runs in this order:
1. **Preflight:** git branch/commit (asks before deploying uncommitted changes), paid-only features in use (Worker Loader) and an every-minute cron, Cloudflare login and account.
2. **Secrets:** compares `wrangler secret list` with what the site needs (`EMDASH_ENCRYPTION_KEY`, `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`). It uploads only the missing ones, with the deploy itself (`wrangler deploy --secrets-file`), so the very first deploy works too.
   - Values come from `web/.env.production` (gitignored).
   - Production gets its **own** `EMDASH_ENCRYPTION_KEY`, generated on first run. Back that file up: D1 backups don't include it.
   - For the OpenRouter values it offers to reuse what's in `web/.env`.
   - Secret values are never printed.
3. **Build:** `astro check`, `astro build`, then `wrangler deploy`, tagged with the commit message.
4. **Smoke test:** checks the key routes on the deployed URL, then prints next steps.

### Moving content between sites

Production was filled from the local site with EmDash's whole-site transfer (content model, entries, revisions, media and settings; not users or secrets):

```sh
export XDG_CONFIG_HOME="$PWD/.cli"   # only if ~/.config isn't writable; .cli/ is gitignored
npx emdash site export --url http://localhost:4321 --output backups/site.emdash
npx emdash login --url https://benyoung.blog
npx emdash site import backups/site.emdash --url https://benyoung.blog --analyze \
  --map-principal 'ben@minutepast2.com=ben@minutepast2.com'
npx emdash site import backups/site.emdash --url https://benyoung.blog --plan sha256:<digest> --confirm
```

- The target must be empty: a fresh database after the setup wizard, with sample content skipped.
- **Turn `youtube-sync` off in `astro.config.mjs` and deploy before importing.** Its first run publishes the channel's videos, after which the site no longer counts as empty.
- If it stops partway: `npx emdash site import resume <operation-id> backups/site.emdash --url …`.
- Media keys change on import, so anything that maps to media URLs (like `public/_redirects`) has to use the target site's keys.
- Afterwards, `EMDASH_TOKEN=… node scripts/interlink.ts --url https://benyoung.blog` reloads the post embeddings used for related posts.

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
