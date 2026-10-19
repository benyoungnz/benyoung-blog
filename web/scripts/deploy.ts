// Checked deploy to Cloudflare Workers.
//
//   npm run ship                 # checks → build → deploy → smoke test
//   npm run ship -- --dry-run    # everything except uploading (no login needed)
//   npm run ship -- --yes        # don't prompt (CI / when you've done it before)
//
// Steps:
//   1. Preflight: git state, wrangler.jsonc stays on the free plan, Cloudflare login.
//   2. Secrets: works out which Worker secrets are missing and uploads only those with the
//      deploy (wrangler deploy --secrets-file), so the very first deploy works too.
//      Values come from web/.env.production (gitignored). EMDASH_ENCRYPTION_KEY is generated
//      fresh for production if it isn't there: back that file up, D1 backups don't include it.
//   3. astro check + build, then wrangler deploy.
//   4. Smoke test the deployed URL and print what to do next.
//
// Secret values are never printed.

import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

const root = join(import.meta.dirname, "..");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const assumeYes = args.has("--yes");

const SECRETS = [
	{ name: "EMDASH_ENCRYPTION_KEY", required: true, why: "encrypts plugin settings; generated fresh for production" },
	{ name: "OPENROUTER_API_KEY", required: true, why: "AI takeaways, related posts, link suggestions" },
	{ name: "OPENROUTER_MODEL", required: false, why: "model for the AI features (default ~google/gemini-flash-latest)" },
] as const;
const PROD_ENV = join(root, ".env.production");

const c = { dim: "\x1b[2m", red: "\x1b[31m", green: "\x1b[32m", yellow: "\x1b[33m", bold: "\x1b[1m", off: "\x1b[0m" };
const step = (s: string) => console.log(`\n${c.bold}▸ ${s}${c.off}`);
const ok = (s: string) => console.log(`  ${c.green}✓${c.off} ${s}`);
const warn = (s: string) => console.log(`  ${c.yellow}!${c.off} ${s}`);
const fail = (s: string): never => {
	console.error(`  ${c.red}✗ ${s}${c.off}`);
	process.exit(1);
};

/** Run a command, inheriting the terminal (for builds and the deploy). */
function run(cmd: string, cmdArgs: string[], opts: { capture?: boolean } = {}) {
	const res = spawnSync(cmd, cmdArgs, { cwd: root, stdio: opts.capture ? ["ignore", "pipe", "pipe"] : "inherit", encoding: "utf8" });
	return { code: res.status ?? 1, out: `${res.stdout ?? ""}${res.stderr ?? ""}` };
}
const wrangler = (a: string[], capture = true) => run("npx", ["--no-install", "wrangler", ...a], { capture });

async function confirm(question: string) {
	if (assumeYes) return true;
	if (!process.stdin.isTTY) fail(`Needs an answer (${question}). Run in a terminal, or pass --yes`);
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	const answer = await rl.question(`  ${question} [y/N] `);
	rl.close();
	return /^y(es)?$/i.test(answer.trim());
}

function readEnvFile(path: string): Record<string, string> {
	if (!existsSync(path)) return {};
	return Object.fromEntries(
		readFileSync(path, "utf8")
			.split("\n")
			.filter((l) => /^[A-Z][A-Z0-9_]*=/.test(l))
			.map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^(['"])(.*)\1$/, "$2")]),
	);
}

function stripJsonc(text: string) {
	return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"])\/\/.*$/gm, "$1").replace(/,(\s*[}\]])/g, "$1");
}

// ---------------------------------------------------------------------------
step("Preflight");

const config = JSON.parse(stripJsonc(readFileSync(join(root, "wrangler.jsonc"), "utf8"))) as {
	name: string;
	worker_loaders?: unknown[];
	triggers?: { crons?: string[] };
	routes?: unknown[];
};
ok(`Worker: ${config.name}`);
if (config.worker_loaders?.length) warn("worker_loaders is enabled: sandboxed plugins need Workers Paid ($5/mo)");
else ok("Free-plan config (no Worker Loader)");
const everyMinute = config.triggers?.crons?.some((cron) => cron.trim() === "* * * * *");
if (everyMinute) warn("A cron runs every minute: 1,440 of the free plan's 100k daily requests");

try {
	const dirty = execFileSync("git", ["status", "--porcelain", "--", "."], { cwd: root, encoding: "utf8" }).trim();
	const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
	const sha = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
	ok(`git ${branch} @ ${sha}`);
	if (dirty) {
		warn(`Uncommitted changes in web/ will be deployed:\n${c.dim}${dirty.split("\n").map((l) => `      ${l}`).join("\n")}${c.off}`);
		if (!dryRun && !(await confirm("Deploy with uncommitted changes?"))) fail("Commit first, or rerun and answer y");
	}
} catch {
	warn("Not a git checkout; skipping git checks");
}

if (wrangler(["--version"]).code !== 0) fail("wrangler isn't installed. Run: npm install");

let loggedIn = false;
const who = wrangler(["whoami", "--json"]);
if (who.code === 0) {
	loggedIn = true;
	try {
		const info = JSON.parse(who.out.slice(who.out.indexOf("{"))) as { email?: string; accounts?: { name: string; id: string }[] };
		ok(`Cloudflare: ${info.email ?? "logged in"}${info.accounts?.length ? ` (${info.accounts.map((a) => a.name).join(", ")})` : ""}`);
		if ((info.accounts?.length ?? 0) > 1) warn("Several accounts: set CLOUDFLARE_ACCOUNT_ID or account_id in wrangler.jsonc to pick one");
	} catch {
		ok("Cloudflare: logged in");
	}
} else if (dryRun) {
	warn("Not logged in to Cloudflare (fine for --dry-run; secrets can't be checked)");
} else {
	fail("Not logged in to Cloudflare. Run: npx wrangler login");
}

// ---------------------------------------------------------------------------
step("Secrets");

let remote: Set<string> | null = null;
if (loggedIn) {
	const list = wrangler(["secret", "list", "--format", "json"]);
	if (list.code === 0) {
		try {
			remote = new Set((JSON.parse(list.out.slice(list.out.indexOf("["))) as { name: string }[]).map((s) => s.name));
		} catch {
			remote = null;
		}
	}
	if (remote) ok(`Worker has ${remote.size} secret(s): ${[...remote].join(", ") || "none"}`);
	else warn("Worker not found yet (first deploy): all secrets will be uploaded with it");
}

const prod = readEnvFile(PROD_ENV);
const local = readEnvFile(join(root, ".env"));
const missing = SECRETS.filter((s) => !remote?.has(s.name));
const upload: Record<string, string> = {};

for (const s of missing) {
	let value = process.env[s.name] ?? prod[s.name];

	if (!value && dryRun) {
		// Dry runs don't write anything: just say what a real run would do
		const would = s.name === "EMDASH_ENCRYPTION_KEY" ? "generate a fresh key into web/.env.production" : local[s.name] ? "offer to reuse the value in web/.env" : s.required ? "stop: add it to web/.env.production" : "skip it";
		ok(`${s.name}: not set for production; a real run would ${would}`);
		continue;
	}

	if (!value && s.name === "EMDASH_ENCRYPTION_KEY") {
		// Production gets its own key rather than the one generated for local dev
		console.log(`  ${s.name} isn't set for production. Generating one in web/.env.production.`);
		const gen = run("npx", ["--no-install", "emdash", "secrets", "generate", "--write", ".env.production"], { capture: true });
		if (gen.code !== 0) fail(`Couldn't generate ${s.name}:\n${gen.out}`);
		value = readEnvFile(PROD_ENV)[s.name];
		warn("Back up web/.env.production somewhere safe (password manager). Losing this key loses encrypted plugin settings.");
	}

	if (!value && s.name.startsWith("OPENROUTER_") && local[s.name]) {
		// Reuse the local OpenRouter settings for production if you say so
		if (await confirm(`Use ${s.name} from web/.env for production too?`)) {
			value = local[s.name];
			writeFileSync(PROD_ENV, `${existsSync(PROD_ENV) ? readFileSync(PROD_ENV, "utf8").replace(/\n?$/, "\n") : ""}${s.name}=${value}\n`);
			chmodSync(PROD_ENV, 0o600);
		}
	}

	if (value) {
		upload[s.name] = value;
		ok(`${s.name}: will upload (${s.why})`);
	} else if (s.required) {
		fail(`${s.name} is missing. Add it to web/.env.production (${s.why})`);
	} else {
		warn(`${s.name} not set (${s.why}); skipping`);
	}
}
for (const s of SECRETS.filter((x) => remote?.has(x.name))) ok(`${s.name}: already set on the Worker`);

// ---------------------------------------------------------------------------
step("Type check and build");

if (run("npx", ["--no-install", "astro", "check"]).code !== 0) fail("astro check failed");
if (run("npx", ["--no-install", "astro", "build"]).code !== 0) fail("astro build failed");
ok("Built");

// ---------------------------------------------------------------------------
step(dryRun ? "Deploy (dry run)" : "Deploy");

const names = Object.keys(upload);
if (!dryRun && names.length && !(await confirm(`Upload ${names.join(", ")} to the ${config.name} Worker?`))) fail("Stopped before uploading secrets");

let deployedUrl: string | undefined;
const tmp = mkdtempSync(join(tmpdir(), "benyoung-deploy-"));
try {
	const deployArgs = ["deploy"];
	if (dryRun) deployArgs.push("--dry-run");
	if (!dryRun && names.length) {
		const file = join(tmp, "secrets.json");
		writeFileSync(file, JSON.stringify(upload), { mode: 0o600 });
		deployArgs.push("--secrets-file", file);
	}
	try {
		deployArgs.push("--message", execFileSync("git", ["log", "-1", "--format=%h %s"], { cwd: root, encoding: "utf8" }).trim().slice(0, 100));
	} catch {}

	// Stream output live, but keep a copy to find the deployed URL
	const res = spawnSync("npx", ["--no-install", "wrangler", ...deployArgs], { cwd: root, stdio: ["inherit", "pipe", "inherit"], encoding: "utf8" });
	process.stdout.write(res.stdout ?? "");
	if (res.status !== 0) fail("wrangler deploy failed");
	deployedUrl = (res.stdout ?? "").match(/https:\/\/[a-z0-9.-]+\.workers\.dev/i)?.[0];
} finally {
	rmSync(tmp, { recursive: true, force: true });
}

if (dryRun) {
	ok("Dry run complete. Nothing was uploaded.");
	process.exit(0);
}

// ---------------------------------------------------------------------------
step("Smoke test");

const base = process.env.DEPLOY_URL ?? deployedUrl;
if (!base) {
	warn("Couldn't find the deployed URL in wrangler's output; set DEPLOY_URL to smoke test");
} else {
	ok(base);
	for (const path of ["/", "/blog/", "/videos/", "/tags/", "/sitemap.xml", "/rss.xml", "/robots.txt", "/_emdash/admin"]) {
		try {
			const res = await fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(20000) });
			// A brand-new database answers with the setup wizard until you finish it
			(res.status < 400 ? ok : warn)(`${res.status} ${path}`);
		} catch (err) {
			warn(`${path}: ${err instanceof Error ? err.message : err}`);
		}
	}
}

step("Next");
console.log(`  • First deploy? Open ${base ?? "the Worker URL"}/_emdash/admin, run the setup wizard (skip sample content) and register your passkey.
  • Then import content (with the local dev server running, so AI fields are copied, not regenerated):
      create an API token in admin → Settings → API tokens, then
      EMDASH_TOKEN=… node scripts/import.ts --all --url ${base ?? "<url>"} --copy-ai-from http://localhost:4321
      EMDASH_TOKEN=… node scripts/interlink.ts --url ${base ?? "<url>"}   # loads post embeddings for related posts
  • Code deploys on push once Workers Builds is connected (see README).`);
