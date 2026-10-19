// Renders the site's default social share card (1200×630) to public/og-default.png.
// Used on pages without their own image (home, blog index, tags, categories, about).
//
//   node scripts/og-image.ts
//
// Rendered offline rather than per request: satori + resvg cost far more CPU than the
// free Workers plan allows per request, and one branded card covers the listing pages.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const root = join(import.meta.dirname, "..");
const font = (pkg: string, file: string) => readFileSync(join(root, "node_modules/@fontsource", pkg, "files", file));

// Rasterise the logo first: satori's <img> doesn't apply the <style> block inside the SVG
const logo = new Resvg(readFileSync(join(root, "public/logo.svg")), { fitTo: { mode: "height", value: 220 } }).render().asPng();
const logoSrc = `data:image/png;base64,${Buffer.from(logo).toString("base64")}`;

const ink = "#12201a";
const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

const tree = h(
	"div",
	{
		width: "100%",
		height: "100%",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		padding: "72px 80px",
		background: "linear-gradient(135deg, #ffffff 0%, #ffffff 45%, #d3fbdd 100%)",
		fontFamily: "Instrument Sans",
		color: ink,
	},
	[
		h("div", { display: "flex", alignItems: "center", gap: "28px" }, [
			{ type: "img", props: { src: logoSrc, height: 110, style: { height: 110 } } },
			h("div", { fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 64, letterSpacing: "-0.03em" }, "Ben Young"),
		]),
		h("div", { display: "flex", flexDirection: "column", gap: "22px", maxWidth: "960px" }, [
			h(
				"div",
				{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 68, lineHeight: 1.04, letterSpacing: "-0.035em" },
				"Notes on Veeam, data, automation and the AI that runs on top of it.",
			),
			h("div", { display: "flex", alignItems: "center", gap: "16px", fontSize: 30, color: "#3b4a42" }, [
				h("div", { width: 14, height: 14, borderRadius: 999, background: "#0b7a3a" }),
				"benyoung.blog",
			]),
		]),
	],
);

const svg = await satori(tree as never, {
	width: 1200,
	height: 630,
	fonts: [
		{ name: "Bricolage Grotesque", data: font("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"), weight: 800, style: "normal" },
		{ name: "Instrument Sans", data: font("instrument-sans", "instrument-sans-latin-500-normal.woff"), weight: 500, style: "normal" },
	],
});
const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
writeFileSync(join(root, "public/og-default.png"), png);
console.log(`public/og-default.png (${Math.round(png.length / 1024)} KB)`);
