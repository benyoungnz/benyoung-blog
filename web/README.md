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
| `seed/seed.json` | Schema: `posts` (title, description, hero image, cover title, content, updated date, legacy path), `category` + `tag` taxonomies, Ben's byline, primary menu. Applied once to an empty database |
| `src/lib/content.ts` | The only EmDash → site-kit adapter (`toPost`, `allPosts`, `headingsOf`, term helpers) |
| `src/components/{base,layout,blog,tools}` | Copied from `site-kit/`. `PostCover` now renders EmDash's responsive `<Image>` |
| `src/components/pt/` | Portable Text overrides: headings with TOC anchors, highlight.js code blocks |
| `src/components/site/` | Tag/category index and archive views |
| `src/pages/` | `/`, `/blog/`, `/blog/<slug>/`, `/tags/…`, `/categories/…`, `/about/`, `/search/`, `/rss.xml`, 404 |
| `scripts/` | Migration tooling (not deployed) |

**URLs match the old site.** Posts stay at `/blog/<slug>/`, tags at `/tags/<tag>/`, categories at `/categories/<category>/` (case-insensitive, so the old `/categories/AI/` still resolves), and the feed stays at `/rss.xml`.

**Images.** Requests go through Astro's image endpoint. In production that uses the Cloudflare Images binding (`IMAGES`, free for 5,000 unique transformations a month), which serves resized WebP with a `srcset`. Covers and body images get width hints, so phones don't download desktop images.

**Caching.** The `cache` provider and `routeRules` in `astro.config.mjs` let Cloudflare's CDN hold public pages for a day, with stale-while-revalidate for a week. Responses carry EmDash cache tags, and publishing an entry purges exactly the pages that show it. A page view only costs Worker CPU on a cache miss, which matters on the free plan's 10 ms CPU limit. Search, admin and API routes are never cached.

## Cloudflare (free plan)

- **Worker**: about 20 MB uncompressed. Cloudflare's current limit is 64 MiB on both Free and Paid, with no compressed-size cap.
- **D1** `benyoung-blog` and **R2** `benyoung-blog-media`: wrangler creates both on first deploy, so no ids are needed in `wrangler.jsonc`. It also creates the `SESSION` KV namespace that the adapter adds.
- **Cron**: every 15 minutes, for scheduled publishing and maintenance. That's 96 runs a day, against the template's every-minute default of 1,440.
- **Sandboxed plugins are off.** They need Worker Loader, which is Workers Paid ($5/mo). Config-defined plugins still work.

### First deploy (one-off, from a laptop)

```sh
cd web
npx wrangler login
npx wrangler secret put EMDASH_ENCRYPTION_KEY   # paste a key from: npx emdash secrets generate
npm run deploy                                  # astro build && wrangler deploy
```

Then open `https://benyoung-blog.<account>.workers.dev/_emdash/admin` and run the setup wizard. Skip the sample content.

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
