# Plan

Lane: **reference build.** onigiri.one belongs to someone else (confirmed by Ben, 2026-10-19). We borrow section order, grid, spacing rhythm and interaction ideas only. Name, logo, copy, palette, typefaces and imagery are Ben Young's own. No pixel diff against the source; acceptance is Ben's review plus a side-by-side check that the brand is clearly different.

Stack: standalone Astro 7 app in `site-kit/` (EmDash 1.3 needs Astro ≥ 6). Plain CSS custom properties + scoped component styles, no Tailwind, so components drop into the EmDash site unchanged. Content is sample data in `src/data/`.

Pages captured (1440 and 390, 2026-10-19, 8 page loads total, robots.txt allows):
listing `/blog`, detail `/blog/should-photographers-charge-deposits`, hub `/tools`, tool `/invoice-generator`. Screenshots stay out of the repo.

## Pattern brief (what we take)

Grid and rhythm
- Container 1200px max with 24px gutters; source breakpoints 810px and 1200px → ours: 820px (`md`) and 1200px (`lg`).
- Spacing is a 4px base: 4, 8, 12, 16, 20, 24, 40, 64, 96. Section padding 64–96px.
- Radii: 10 (inputs, tables), 16–20 (cards), pill 999.
- Cards: soft two-layer shadow on tool cards; blog cards are flat with a tinted cover.

Blog listing: hero (H1 ~60px, lede 18px, max ~720px) → 3 featured cards → "All posts" + filter chips → 3/2/1-column card grid → "Load more" → footer with CTA row + 5 link columns.
Post card: tinted 2:1 cover panel (icon + title on the cover) → date → title (24px) → 3-line excerpt.

Blog detail: breadcrumb → H1 → lede → tag chips · published · updated → 2-col (article ~760px | sidebar ~300px, sticky): author mini, table of contents with active-section bar, CTA card, link list → prose (18/1.6 body, bold-lead bullets, bordered tables) → FAQ accordion (+ toggles) → "Written by" author card → related posts (3 cards).

Tools hub: split hero (copy left; floating stat cards over a colour blob + dot grid right) + 3 meta badges → "Pick a tool" + category chips with colour dot and count (anchor links) → per category: sticky intro column (icon, number badge, count, title, blurb) + 2-col tool cards (icon on blob, value pill, title, description, footnote, round arrow button).

Tool page: centred hero + trust badges → app area (stacked form panels | sticky preview + primary action + upsell card) → "How it works" 4 numbered steps with dashed connector → full-bleed colour band with illustration card + numbered checklist → tile grid (4-col) → compact link cards (3-col).

States: links underline on hover; cards lift (translateY -2px + stronger shadow, ~150ms); chips toggle active (filled); TOC highlights the section in view; FAQ rows open/close; filter chips filter the grid without reload; load more reveals the next batch.

## Our brand (what's different)

| | onigiri.one | Ben Young kit |
|---|---|---|
| Palette | yellow + near-black, grey page | white page, ink-green text, logo mint + sage, 6 colourful tints (mint, sky, violet, coral, peach, lime) |
| Display face | heavy rounded display | Bricolage Grotesque (OFL, variable) |
| Body face | Open Sans | Instrument Sans (OFL, variable) |
| Mono | — | JetBrains Mono (OFL) for API/code posts |
| Footer | dark | light, mint-tinted |
| Primary button | black / yellow | mint `#50fd81` on ink text; secondary ink |
| Covers | illustration + serif title | typographic cover: tint + pattern + display title, or a photo |

Left out: analytics, auth, the invoice generator's logic (the kit ships an embed frame + sample panel only).
Open questions: final nav items and footer columns; whether covers should use real post images.

## Result (2026-10-19)

Built: 39 components (+2 style-guide helpers), tokens/base/prose CSS, 5 demo pages + /styleguide. `astro build` clean (16 pages).
Checked at 1440 and 390: no horizontal overflow, no console errors on any page.
Interactions verified in headless Chromium: tag filter + aria-pressed, load more, ?tag= deep link, TOC active section, FAQ open, mobile menu, calculator.
Brand check against the reference: different palette (white/mint/sage vs yellow/black), different faces (Bricolage/Instrument vs their display + Open Sans), own logo, own copy, light footer, no illustrations or assets reused.
Not done: keyboard walk-through by a person, contrast audit beyond token math, Ben's design review.

Pass 2 (2026-10-19): added /about, /tags, /tags/[tag], /tools/[slug] template, /rss.xml, /404. 34 pages build clean; zero broken internal links (script check over dist/); new pages checked at 1440 and 390 with no overflow or console errors. Fixed: CenteredHero's fade mask was fading its own content.
