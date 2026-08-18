# Turnkii

Turnkey home finishing, furniture and handover for Cairo and the North Coast.
Six pages — landing, inspiration board, AI preview studio, design styles,
marketplace, and account.

## How it's built

The **source** pages are Claude design-canvas files (`Turnkii *.dc.html`): HTML
templates using an `<x-dc>` / `{{ }}` / `<sc-for>` DSL, with page logic in a
`<script type="text/x-dc">` block. They are rendered client-side by
`support.js` (a small React-backed runtime) plus `image-slot.js`.

`build.py` compiles those sources into a **self-contained, deployable static
site** in `dist/`:

- **No external runtime dependencies.** React + ReactDOM are vendored in
  `vendor/` and pre-loaded, so the runtime never hits a CDN. The runtime's CDN
  URLs are also rewritten to local paths as a safety net.
- **Self-hosted fonts.** Instrument Serif + Manrope `woff2` in `vendor/fonts/`,
  wired up by `vendor/fonts.css` (no Google Fonts request).
- **Clean URLs** with all internal links rewritten:
  `index.html`, `inspiration.html`, `ai-studio.html`, `styles.html`,
  `marketplace.html`, `account.html`.
- **SEO + social** per page: `<title>`, meta description, canonical, Open Graph
  and Twitter cards, favicons, `theme-color`, plus `robots.txt`, `sitemap.xml`
  and a branded `404.html`.
- **Pre-rendered HTML.** Each page's fully rendered markup is baked into the
  initial HTML (from `prerender/<slug>.html`) inside the `#dc-root` container,
  with the page's critical CSS lifted into `<head>` so first paint is styled.
  The runtime is patched to *reuse* that container, so on load React renders the
  identical interactive tree in place — crawlers and first paint get real
  content, users get full interactivity, with no duplication.

## Develop / preview

```bash
npm run preview        # build.py + static server on http://localhost:4173
# or
python3 build.py
python3 -m http.server 4173 --directory dist
```

## Regenerating pre-render snapshots

The snapshots in `prerender/` are committed and used by `build.py` as-is, so a
plain build needs no browser. Regenerate them only when page content changes:

```bash
npm i -D playwright && npx playwright install chromium
npm run prerender      # client-only build → capture #dc-root → final build
```

`NO_PRERENDER=1 python3 build.py` produces a client-only build (no injected
snapshots) — what the capture step renders against.

## Deploy

Any static host serves `dist/`. Config is included for the common ones:

- **Netlify** — `netlify.toml` (`publish = "dist"`, build `python3 build.py`);
  `dist/_headers` and `dist/_redirects` handle caching + extensionless routes.
- **Vercel** — `vercel.json` (`outputDirectory: dist`, `cleanUrls: true`).
- **Any static host / S3 / Cloudflare Pages** — upload the contents of `dist/`.

Set your real domain so absolute URLs (Open Graph, canonical, sitemap) are
correct:

```bash
SITE_ORIGIN=https://your-domain.com python3 build.py
```

## Notes

- **Hero photos are placeholders.** `assets/style-{coastal,majlis,neoclassic,warm}`
  are palette-based stand-ins generated from each style's own swatch colors,
  because the originals exceeded the design tool's per-file transfer limit.
  Drop the real photos in with the same filenames and rebuild.
- Pages ship pre-rendered (crawlable static HTML) and then hydrate into the full
  interactive runtime — see "Pre-rendered HTML" above.
