#!/usr/bin/env node
/**
 * Regenerate the pre-render snapshots in ./prerender.
 *
 * Runs a client-only build, opens each page in headless Chromium so the
 * dc-runtime renders it, captures the mounted #dc-root, and writes
 * prerender/<slug>.html. Then runs the final build (which injects those
 * snapshots for crawlable, styled first paint + interactive hydration).
 *
 * Requires Playwright:
 *   npm i -D playwright && npx playwright install chromium
 *
 * Usage: node tools/prerender.mjs   (or: npm run prerender)
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PAGES = ["index", "inspiration", "ai-studio", "styles", "marketplace", "account"];

const run = (cmd, args, env = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright not installed. Run: npm i -D playwright && npx playwright install chromium");
  process.exit(1);
}

// 1) client-only build (no snapshot injection) to render against
run("python3", ["build.py"], { NO_PRERENDER: "1" });

// 2) render each page and capture #dc-root
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
for (const slug of PAGES) {
  const url = pathToFileURL(join(ROOT, "dist", `${slug}.html`)).href;
  await page.goto(url, { waitUntil: "load" });
  await page.waitForFunction(
    () => {
      const el = document.getElementById("dc-root");
      return el && el.children.length && el.innerHTML.length > 2000;
    },
    { timeout: 15000 }
  );
  const html = await page.$eval("#dc-root", (el) => el.outerHTML);
  writeFileSync(join(ROOT, "prerender", `${slug}.html`), html);
  console.log(`captured ${slug} (${html.length} bytes)`);
}
await browser.close();

// 3) final build with snapshots injected
run("python3", ["build.py"]);
console.log("prerender complete.");
