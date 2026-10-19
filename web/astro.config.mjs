import cloudflare from "@astrojs/cloudflare";
import { cacheCloudflare } from "@astrojs/cloudflare/cache";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

// Public pages are cached at Cloudflare's edge and purged by tag when EmDash publishes,
// so a page view only costs Worker CPU (10 ms on the free plan) on a cache miss.
const page = { maxAge: 86400, swr: 604800 };
// Videos come from YouTube, not EmDash, so nothing purges them: refresh every 6 hours instead
const videos = { maxAge: 21600, swr: 86400 };

export default defineConfig({
	site: "https://benyoung.blog",
	output: "server",
	adapter: cloudflare(),
	cache: { provider: cacheCloudflare() },
	routeRules: {
		"/": videos, // home also shows the latest videos
		"/blog/[...path]": page,
		"/tags/[...path]": page,
		"/categories/[...path]": page,
		"/about": page,
		"/rss.xml": page,
		"/videos/[...path]": videos,
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
		}),
	],
	devToolbar: { enabled: false },
});
