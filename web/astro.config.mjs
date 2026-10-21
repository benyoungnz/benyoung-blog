import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";
import { fileURLToPath } from "node:url";

// Public pages are cached at Cloudflare's edge and purged by tag when EmDash publishes,
// so a page view only costs Worker CPU (10 ms on the free plan) on a cache miss.
const page = { maxAge: 86400, swr: 604800 };

export default defineConfig({
	site: "https://benyoung.blog",
	output: "server",
	adapter: cloudflare(),
	cache: { provider: cacheCloudflare() },
	routeRules: {
		"/": page,
		"/blog/[...path]": page,
		"/tags/[...path]": page,
		"/categories/[...path]": page,
		"/about": page,
		"/rss.xml": page,
		"/sitemap.xml": page,
		"/videos/[...path]": page,
		"/tools/[...path]": page,
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	integrations: [
		react(),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [
				// Copies new uploads from the YouTube channel into the `videos` collection, hourly.
				// Disable it before a whole-site import: its first run writes videos, and an import
				// needs an empty site.
				{
					id: "youtube-sync",
					version: "1.0.0",
					format: "native",
					entrypoint: fileURLToPath(new URL("./src/plugins/youtube-sync.ts", import.meta.url)),
				},
				// Writes a post's "Key takeaways" with AI (OpenRouter) on save when the field is empty
				{
					id: "post-ai",
					version: "1.0.0",
					format: "native",
					entrypoint: fileURLToPath(new URL("./src/plugins/post-ai.ts", import.meta.url)),
				},
			],
		}),
	],
	devToolbar: { enabled: false },
});
