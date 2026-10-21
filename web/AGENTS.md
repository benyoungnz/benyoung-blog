This is an EmDash site -- a CMS built on Astro with a full admin UI.

## Commands

```bash
npm run dev              # Start the Astro dev server
npx emdash types      # Regenerate TypeScript types from a running site
```

The admin UI is at `http://localhost:4321/_emdash/admin`.

## Key Files

| File                     | Purpose                                                                            |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `astro.config.mjs`       | Astro config with `emdash()` integration, database, and storage                    |
| `src/live.config.ts`     | EmDash loader registration (boilerplate -- don't modify)                           |
| `seed/seed.json`         | Schema definition + demo content (collections, fields, taxonomies, menus, widgets) |
| `emdash-env.d.ts`        | Generated types for collections (auto-regenerated on dev server start)             |
| `src/layouts/Base.astro` | Base layout with EmDash wiring (menus, search, page contributions)                 |
| `src/pages/`             | Astro pages -- all server-rendered                                                 |

## Skills

Agent skills are in `.agents/skills/`. Load them when working on specific tasks:

- **building-emdash-site** -- Querying content, rendering Portable Text, schema design, seed files, site features (menus, widgets, search, SEO, comments, bylines). Start here.
- **creating-plugins** -- Building EmDash plugins with hooks, storage, admin UI, API routes, and Portable Text block types.
- **emdash-cli** -- CLI commands for content management, seeding, type generation, and visual editing flow.

## Documentation

The EmDash docs are available as an MCP server at `https://docs.emdashcms.com/mcp`. When you need to verify an API, hook, config option, field type, or pattern, call `search_docs` against the live documentation rather than relying on training-data recall. The docs reflect current behaviour; assumptions may not.

This template ships with `.mcp.json`, `.cursor/mcp.json`, and `.vscode/mcp.json` so Claude Code, Cursor, and VS Code auto-discover the docs server. Other tools (OpenCode, Windsurf, etc.) need a manual one-time setup -- see [docs.emdashcms.com/docs-mcp](https://docs.emdashcms.com/docs-mcp).

## Rules

- All content pages must be server-rendered (`output: "server"`). No `getStaticPaths()` for CMS content.
- Image fields are objects (`{ src, alt }`), not strings. Use `<Image image={...} />` from `"emdash/ui"`.
- `entry.id` is the slug (for URLs). `entry.data.id` is the database ULID (for API calls like `getEntryTerms`).
- When Astro's cache is enabled, pass content-query hints to `Astro.cache.set(cacheHint)`. Use the `WithCacheHint` variants for site settings, menus, taxonomies, and widget areas rendered by cached routes.
- Taxonomy names in queries must match the seed's `"name"` field exactly (e.g., `"category"` not `"categories"`).

## This site

benyoung.blog on EmDash, themed with the components from `../site-kit/`. Read `README.md` for the full layout. In short:

- `src/lib/content.ts` is the only place EmDash entries are mapped onto the kit's `Post` type. Pages query EmDash and pass plain `Post`s to the kit components.
- Routes match the old site, trailing slash included: `/blog/<slug>/`, `/tags/<tag>/`, `/categories/<category>/`, `/about/`, `/search/`, `/rss.xml`. Don't add `/posts` or `/tag` routes.
- Schema lives in `seed/seed.json`: `posts` (title, description, featured_image, cover_title, content, updated_date, legacy_path) and the `category` + `tag` taxonomies.
- Styling comes from the kit's tokens (`src/styles/tokens.css`, `base.css`, `prose.css`): six colourful tones (mint, sky, violet, coral, peach, lime), Bricolage Grotesque, Instrument Sans and JetBrains Mono. Light mode only. Reuse kit components before writing new markup.
- Portable Text overrides live in `src/components/pt/`: anchored headings for the TOC, and highlight.js code blocks. highlight.js is used instead of Shiki to keep per-request CPU low on the free Workers plan.
- Public routes are edge-cached via `routeRules` in `astro.config.mjs`. A new public route should get a rule there, and must call `Astro.cache.set(cacheHint)` (via `allPosts` or directly) so publishing purges it.
- Migration tooling is in `scripts/` (Node 24 runs the `.ts` files directly). It isn't part of the Worker.
