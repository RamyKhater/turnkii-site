#!/usr/bin/env python3
"""
Turnkii production build.

Reads the design-canvas source (the `Turnkii *.dc.html` pages + support.js +
image-slot.js + assets) and emits a self-contained, deployable static site into
./dist with:

  - No external runtime dependencies: React/ReactDOM are vendored locally and
    the dc-runtime's CDN URLs are rewritten to ./vendor paths.
  - Self-hosted fonts (Instrument Serif + Manrope woff2) via vendor/fonts.css.
  - Clean URLs (index.html, inspiration.html, ai-studio.html, styles.html,
    marketplace.html, account.html) with all internal links rewritten.
  - Per-page <title>, meta description, Open Graph + Twitter cards, favicons,
    theme-color.
  - robots.txt, sitemap.xml, a branded 404, and cache/deploy config
    (_headers, _redirects, netlify.toml, vercel.json).

Run:  python3 build.py
"""
import os, re, shutil, html, json, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")
PRERENDER = os.path.join(ROOT, "prerender")

# Public origin used for absolute URLs (Open Graph, canonical, sitemap).
# Override with the real domain, e.g. SITE_ORIGIN=https://turnkii.com python3 build.py
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "https://turnkii.example").rstrip("/")

# Admin intake endpoint the public brief form posts to. Set at build time:
#   TURNKII_INTAKE_URL=https://<admin-host>/api/requests/intake python3 build.py
INTAKE_URL = os.environ.get("TURNKII_INTAKE_URL", "").strip()

# Admin content endpoint. When set, the published hero copy (and other content)
# is fetched at build time and baked into the pages, e.g.
#   TURNKII_CONTENT_URL=https://<admin-host>/api/site-content python3 build.py
CONTENT_URL = os.environ.get("TURNKII_CONTENT_URL", "").strip()

# Pages that belong to a toggleable vertical — when the admin disables that
# vertical, the page redirects home (so "hidden" means unreachable, not just
# missing from the nav).
PAGE_VERTICAL = {
    "styles.html": "styles",
    "marketplace.html": "marketplace",
    "inspiration.html": "inspiration",
    "ai-studio.html": "ai_studio",
}


# ── Analytics / marketing tags. All optional — each vendor activates only when
#    its env var is set at build time. Direct gtag.js (no GTM), plus a small
#    UTM-attribution + event helper (window.tkTrack) that also fires the matching
#    pixel conversion events. Set in Vercel → turnkii-site → Environment Variables.
GA4_ID = os.environ.get("GA4_ID", "").strip()                    # G-XXXXXXXXXX
META_PIXEL_ID = os.environ.get("META_PIXEL_ID", "").strip()      # numeric
GADS_ID = os.environ.get("GADS_ID", "").strip()                  # AW-XXXXXXXXX
GADS_LEAD_LABEL = os.environ.get("GADS_LEAD_LABEL", "").strip()  # conversion label
TIKTOK_PIXEL_ID = os.environ.get("TIKTOK_PIXEL_ID", "").strip()
LINKEDIN_PARTNER_ID = os.environ.get("LINKEDIN_PARTNER_ID", "").strip()


def analytics_head():
    """HTML injected into <head> on every page: vendor tags (conditional) + the
    always-present tkTrack/UTM helper so component event calls never error."""
    parts = []
    google_ids = [i for i in (GA4_ID, GADS_ID) if i]
    if google_ids:
        configs = "".join(f"gtag('config','{i}');" for i in google_ids)
        parts.append(
            f'<script async src="https://www.googletagmanager.com/gtag/js?id={google_ids[0]}"></script>\n'
            "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}"
            "gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});"
            f"gtag('js',new Date());{configs}</script>"
        )
    if META_PIXEL_ID:
        parts.append(
            "<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?"
            "n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;"
            "n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;"
            "s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',"
            "'https://connect.facebook.net/en_US/fbevents.js');"
            f"fbq('init','{META_PIXEL_ID}');fbq('track','PageView');</script>"
        )
    if TIKTOK_PIXEL_ID:
        parts.append(
            "<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];"
            "ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];"
            "ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};"
            "for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);"
            "ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};"
            "ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};"
            "var o=d.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;"
            "var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};"
            f"ttq.load('{TIKTOK_PIXEL_ID}');ttq.page();}}(window,document,'ttq');</script>"
        )
    if LINKEDIN_PARTNER_ID:
        parts.append(
            f"<script>_linkedin_partner_id='{LINKEDIN_PARTNER_ID}';window._linkedin_data_partner_ids="
            "window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);"
            "(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}"
            "var s=document.getElementsByTagName('script')[0];var b=document.createElement('script');b.type='text/javascript';"
            "b.async=true;b.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';s.parentNode.insertBefore(b,s)})(window.lintrk);</script>"
        )
    gads_conv = (
        f"if(window.gtag)gtag('event','conversion',{{send_to:'{GADS_ID}/{GADS_LEAD_LABEL}'}});"
        if (GADS_ID and GADS_LEAD_LABEL) else ""
    )
    helper = (
        "<script>(function(){var qs=new URLSearchParams(location.search);"
        "var K=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'];"
        "var cur={};K.forEach(function(k){var v=qs.get(k);if(v)cur[k]=v;});"
        "var s={};try{s=JSON.parse(localStorage.getItem('tk_attrib')||'{}')}catch(e){}"
        "if(Object.keys(cur).length){cur.ts=Date.now();cur.referrer=document.referrer||'';cur.landing=location.pathname;"
        "s.last=cur;if(!s.first)s.first=cur;try{localStorage.setItem('tk_attrib',JSON.stringify(s))}catch(e){}}"
        "window.TK_ATTRIB=s;"
        "window.tkAttrib=function(){var a=s.last||s.first||{};return{utm_source:a.utm_source,utm_medium:a.utm_medium,"
        "utm_campaign:a.utm_campaign,utm_term:a.utm_term,utm_content:a.utm_content,gclid:a.gclid,fbclid:a.fbclid};};"
        "window.tkTrack=function(name,params){params=params||{};try{if(window.gtag)gtag('event',name,params)}catch(e){}"
        "try{if(name==='generate_lead'){if(window.fbq)fbq('track','Lead');if(window.ttq)ttq.track('SubmitForm');"
        "if(window.lintrk)lintrk('track');__GADS__}}catch(e){}"
        "};"
        "document.addEventListener('click',function(e){if(!e.target.closest)return;var el=e.target.closest('[data-track]');"
        "if(el){var n=el.getAttribute('data-track');var lbl=el.getAttribute('data-track-label');window.tkTrack(n,lbl?{label:lbl}:{});}},true);"
        "document.addEventListener('submit',function(e){var f=e.target;if(!f||f.id!=='tk-aftercare')return;e.preventDefault();"
        "var fd=new FormData(f);var svcs=fd.getAll('svc');var a=window.tkAttrib?window.tkAttrib():{};"
        "if(window.tkTrack)window.tkTrack('generate_lead',{type:'aftercare',services:svcs.join(',')});"
        "var u=window.TURNKII_INTAKE_URL;if(u){fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({"
        "contactName:fd.get('name'),phone:fd.get('phone'),propertyType:fd.get('unit')||undefined,location:fd.get('location')||undefined,"
        "services:svcs,channel:'Website',referrer:document.referrer||undefined,"
        "utmSource:a.utm_source||undefined,utmMedium:a.utm_medium||undefined,utmCampaign:a.utm_campaign||undefined,utmTerm:a.utm_term||undefined,utmContent:a.utm_content||undefined,gclid:a.gclid||undefined,fbclid:a.fbclid||undefined,"
        "message:'Aftercare: '+(svcs.join(', ')||'general enquiry')})}).catch(function(){});}"
        "var m=document.getElementById('tk-aftercare-msg');if(m)m.textContent='Thanks \\u2014 we will call within one working day.';f.reset();},true);"
        "})();</script>"
    ).replace("__GADS__", gads_conv)
    parts.append(helper)
    return "\n" + "\n".join(parts)


def fetch_content(url):
    """Best-effort fetch of the admin's published content. Never fails the build."""
    if not url:
        return None
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            data = json.loads(r.read().decode("utf-8"))
        print(f"  content: fetched from {url}")
        return data
    except Exception as e:  # noqa: BLE001 — build must survive admin being down
        print(f"  ! content: could not fetch {url} ({e}); using built-in defaults")
        return None


CONTENT = fetch_content(CONTENT_URL)


def bake_hero(text):
    """Replace the landing hero's default kicker/headline/sub with published copy.
    Keyed on stable text so it patches both the live template and the prerender
    snapshot (whose tag attributes differ). Wrap a word in **stars** to highlight."""
    hero = (CONTENT or {}).get("hero") or {}
    kicker, headline, sub = hero.get("kicker"), hero.get("headline"), hero.get("sub")
    image = hero.get("image")

    if image:
        url = html.escape(image.strip(), quote=True)
        # Swap the hero background <img> src (matched via its stable alt text),
        # covering both the live template and the prerender snapshot.
        text = re.sub(r'(<img[^>]*\bsrc=")[^"]*("[^>]*\balt="Delivered living room)',
                      lambda m: m.group(1) + url + m.group(2), text)
    if kicker:
        repl = html.escape(kicker.strip())
        text = re.sub(r"Turnkey delivery · Cairo &(?:amp;)? North Coast",
                      lambda _m: repl, text)
    if sub:
        repl = html.escape(sub.strip())
        text = re.sub(
            r"Finishing, furniture, kitchens, HVAC, shutters and outdoor — "
            r"one contract, one programme, photographed handover\.",
            lambda _m: repl, text)
    if headline:
        esc = html.escape(headline.strip())
        esc = re.sub(r"\*\*(.+?)\*\*",
                     r'<span style="font-style: italic; color: #D6F23C;">\1</span>', esc)
        text = re.sub(r"The unit is finished when it is <span[^>]*>liveable</span>\.",
                      lambda _m: esc, text)
    return text

# source page -> (slug, title, description)
PAGES = {
    "Turnkii v3.dc.html": (
        "index.html",
        "Turnkii — Turnkey home finishing, furniture & handover",
        "Finishing, furniture, kitchens, HVAC, shutters and outdoor delivered under one contract in Cairo and the North Coast — one programme, one team, photographed handover.",
    ),
    "Turnkii Inspirations.dc.html": (
        "inspiration.html",
        "Inspiration board — Turnkii",
        "Browse delivered rooms, save the ones you like, and send a costed inspiration board straight to your Turnkii brief.",
    ),
    "Turnkii Visualiser.dc.html": (
        "ai-studio.html",
        "AI preview studio — Turnkii",
        "Upload a photo of your room and simulate any Turnkii design style in place, then carry it into your brief.",
    ),
    "Turnkii Style.dc.html": (
        "styles.html",
        "Design styles — Turnkii",
        "Five signed-off, costed design styles — finishes, joinery, lighting and furniture already specified per unit.",
    ),
    "Turnkii Marketplace.dc.html": (
        "marketplace.html",
        "Marketplace — Turnkii",
        "Furniture and appliances specified in Turnkii packages, delivered in the same window as your fit-out.",
    ),
    "Turnkii Account.dc.html": (
        "account.html",
        "My account — Turnkii",
        "Your properties, live projects, wish list and marketplace — tracked per unit, including after handover.",
    ),
    "Turnkii Mobile.dc.html": (
        "mobile.html",
        "Turnkii on mobile — phone-first design",
        "Phone-first Turnkii: responsive mobile web now, native app in phase two — the screens and flows.",
    ),
}
LINK_MAP = {src: meta[0] for src, meta in PAGES.items()}
THEME_COLOR = "#12130E"


def rewrite_links(text):
    for old, new in LINK_MAP.items():
        text = text.replace(old, new)
    return text


def meta_block(slug, title, desc):
    url = f"{SITE_ORIGIN}/" + ("" if slug == "index.html" else slug)
    og_img = f"{SITE_ORIGIN}/og-image.png"
    t = html.escape(title, quote=True)
    d = html.escape(desc, quote=True)
    return f"""<title>{t}</title>
<meta name="description" content="{d}" />
<meta name="theme-color" content="{THEME_COLOR}" />
<link rel="canonical" href="{url}" />
<link rel="icon" href="favicon.ico" sizes="any" />
<link rel="icon" type="image/png" href="icon-192.png" />
<link rel="apple-touch-icon" href="apple-touch-icon.png" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Turnkii" />
<meta property="og:title" content="{t}" />
<meta property="og:description" content="{d}" />
<meta property="og:url" content="{url}" />
<meta property="og:image" content="{og_img}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{t}" />
<meta name="twitter:description" content="{d}" />
<meta name="twitter:image" content="{og_img}" />""" + (
        f'\n<script>window.TURNKII_INTAKE_URL="{INTAKE_URL}";</script>' if INTAKE_URL else ""
    ) + (
        f"\n<script>window.TURNKII_CONTENT={json.dumps(CONTENT, ensure_ascii=False)};</script>{TK_HELPER}"
        if CONTENT else ""
    ) + sections_style() + analytics_head()


def sections_style():
    """Hide any site vertical/section the admin disabled (sections flag = false).
    Elements opt in with data-vertical="<name>" (sections + nav links)."""
    secs = (CONTENT or {}).get("sections") or {}
    off = [k for k, v in secs.items() if v is False]
    if not off:
        return ""
    sel = ", ".join(f'[data-vertical="{html.escape(k, quote=True)}"]' for k in off)
    return f'\n<style>{sel}{{display:none !important}}</style>'


# Small runtime helper the page scripts use to overlay published content onto
# their built-in defaults (fallback-safe: absent in the design canvas → defaults).
TK_HELPER = (
    "\n<script>window.TK=(function(){var C=window.TURNKII_CONTENT||null;"
    "var http=function(v){return typeof v==='string'&&/^https?:\\/\\//.test(v);};"
    "var norm=function(v){return String(v==null?'':v).trim().toLowerCase();};"
    "return{content:C,http:http,"
    # overlay: override mapped fields on matched defaults (by id<->key); no add/remove
    "overlay:function(defs,inc,idF,inF,map){if(!inc||!inc.length)return defs;"
    "var by={};inc.forEach(function(i){by[i[inF]]=i;});"
    "return defs.map(function(d){var s=by[d[idF]];if(!s)return d;var o=Object.assign({},d);"
    "for(var k in map){var v=s[map[k]];if(v!=null&&v!=='')o[k]=v;}return o;});},"
    # merge: override matched-by-field defaults, then append unmatched incoming
    "merge:function(defs,inc,dF,iF,over,make){if(!inc||!inc.length)return defs;var used=[];"
    "var out=defs.map(function(d){var si=-1;for(var j=0;j<inc.length;j++){"
    "if(used.indexOf(j)<0&&norm(inc[j][iF])===norm(d[dF])){si=j;break;}}"
    "if(si<0)return d;used.push(si);return over(d,inc[si]);});"
    "inc.forEach(function(it,j){if(used.indexOf(j)<0)out.push(make(it,out.length));});return out;},"
    # replace: rebuild the whole list from incoming (admin owns the catalogue)
    "replace:function(defs,inc,make){if(!inc||!inc.length)return defs;"
    "return inc.map(function(it,i){return make(it,i,defs);});}};})();</script>"
)


VENDOR_SCRIPTS = (
    '<script defer src="vendor/react.production.min.js"></script>\n'
    '<script defer src="vendor/react-dom.production.min.js"></script>\n'
    '<script defer src="support.js"></script>'
)


def build_page(src_name):
    slug, title, desc = PAGES[src_name]
    text = open(os.path.join(ROOT, src_name), encoding="utf-8").read()
    text = rewrite_links(text)

    # inject SEO/meta right after the viewport meta
    text = text.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        + meta_block(slug, title, desc),
        1,
    )
    # vendor React + defer, replacing the single support.js include in <head>
    text = text.replace('<script src="./support.js"></script>', VENDOR_SCRIPTS, 1)

    # self-host fonts: swap the Google Fonts stylesheet + drop preconnects
    text = re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2[^"]*" rel="stylesheet" />',
        '<link rel="stylesheet" href="vendor/fonts.css" />',
        text,
    )
    text = re.sub(r'\s*<link rel="preconnect"[^>]*/>', "", text)

    # normalise "./x.js" local refs to "x.js" (image-slot.js, support.js already handled)
    text = text.replace('src="./image-slot.js"', 'src="image-slot.js"')

    # --- pre-render for SEO / first paint ---
    # 1) lift the page's critical CSS (the <style> inside <helmet>) into <head> so
    #    the pre-rendered markup is styled before the runtime boots (no FOUC).
    m = re.search(r"<helmet>.*?(<style>.*?</style>).*?</helmet>", text, re.S)
    if m:
        text = text.replace("</head>", m.group(1) + "\n</head>", 1)
    # 2) inject the captured render snapshot into the #dc-root container the runtime
    #    reuses, placed where <x-dc> sits so layout is correct on first paint.
    snap_path = os.path.join(PRERENDER, slug)
    if not os.environ.get("NO_PRERENDER") and os.path.exists(snap_path):
        snap = open(snap_path, encoding="utf-8").read().strip()
        snap = rewrite_links(snap)  # keep internal links consistent
        text = text.replace("<x-dc>", snap + "\n<x-dc>", 1)

    # bake published hero copy into the landing page (template + snapshot)
    if slug == "index.html":
        text = bake_hero(text)

    # redirect a disabled vertical's page to home (baked from the section flags)
    vert = PAGE_VERTICAL.get(slug)
    if vert and CONTENT and (CONTENT.get("sections") or {}).get(vert) is False:
        text = text.replace("<head>", '<head>\n<script>location.replace("/")</script>', 1)

    with open(os.path.join(DIST, slug), "w", encoding="utf-8") as f:
        f.write(text)
    return slug


def patch_support():
    """Point the dc-runtime's CDN constants at local vendor paths so nothing
    external is ever requested (React is pre-loaded, so these are a safety net)."""
    s = open(os.path.join(ROOT, "support.js"), encoding="utf-8").read()
    s = s.replace("https://unpkg.com/react@18.3.1/umd/react.production.min.js",
                  "vendor/react.production.min.js")
    s = s.replace("https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
                  "vendor/react-dom.production.min.js")
    s = s.replace("https://unpkg.com/@babel/standalone@7.29.0/babel.min.js",
                  "vendor/babel.min.js")

    # Reuse a pre-rendered #dc-root container if the build injected one, instead of
    # always creating a fresh div. React's createRoot() then clears the static
    # snapshot and renders the identical interactive tree in place (no duplication).
    boot_src = (
        '    const dc = doc.querySelector("x-dc");\n'
        '    const hostEl = doc.createElement("div");\n'
        '    hostEl.id = "dc-root";\n'
        '    dc.replaceWith(hostEl);\n'
    )
    boot_patched = (
        '    const dc = doc.querySelector("x-dc");\n'
        '    let hostEl = doc.getElementById("dc-root");\n'
        '    if (hostEl) { if (dc) dc.remove(); }\n'
        '    else { hostEl = doc.createElement("div"); hostEl.id = "dc-root";\n'
        '           if (dc) dc.replaceWith(hostEl); else doc.body.appendChild(hostEl); }\n'
    )
    assert boot_src in s, "boot() mount block not found — support.js changed?"
    s = s.replace(boot_src, boot_patched, 1)

    open(os.path.join(DIST, "support.js"), "w", encoding="utf-8").write(s)


def write_static():
    # robots
    open(os.path.join(DIST, "robots.txt"), "w").write(
        "User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n" % SITE_ORIGIN)
    # sitemap
    urls = []
    for src, (slug, *_rest) in PAGES.items():
        loc = SITE_ORIGIN + "/" + ("" if slug == "index.html" else slug)
        urls.append(f"  <url><loc>{loc}</loc><changefreq>weekly</changefreq></url>")
    open(os.path.join(DIST, "sitemap.xml"), "w").write(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls) + "\n</urlset>\n")
    # cache headers (Netlify / Cloudflare Pages)
    open(os.path.join(DIST, "_headers"), "w").write(
        "/vendor/*\n  Cache-Control: public, max-age=31536000, immutable\n"
        "/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n"
        "/*.html\n  Cache-Control: public, max-age=0, must-revalidate\n")
    # extensionless clean routes (Netlify)
    red = ["/%s   /%s   200" % (slug[:-5], slug) for (slug, *_r) in PAGES.values()
           if slug != "index.html"]
    open(os.path.join(DIST, "_redirects"), "w").write("\n".join(red) + "\n")
    # 404
    open(os.path.join(DIST, "404.html"), "w", encoding="utf-8").write(NOT_FOUND)


NOT_FOUND = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found — Turnkii</title>
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="stylesheet" href="vendor/fonts.css">
<style>
  html,body{margin:0;height:100%}
  body{background:#12130E;color:#F6F3EC;font-family:Manrope,system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center;text-align:center}
  .wrap{max-width:520px;padding:32px}
  h1{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:clamp(40px,8vw,72px);
     line-height:1;margin:0 0 12px}
  p{color:rgba(246,243,236,.6);line-height:1.6;margin:0 0 26px}
  a{display:inline-block;background:#D6F23C;color:#12130E;font-weight:700;font-size:15px;
    padding:14px 24px;border-radius:999px;text-decoration:none}
</style></head><body><div class="wrap">
<h1>Not found</h1>
<p>That page has moved or never existed. Let's get you back to a finished home.</p>
<a href="/">Back to Turnkii</a>
</div></body></html>
"""


def main():
    if os.path.isdir(DIST):
        shutil.rmtree(DIST)
    os.makedirs(DIST)

    # copy static asset trees
    shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(DIST, "assets"))
    shutil.copytree(os.path.join(ROOT, "vendor", "fonts"),
                    os.path.join(DIST, "vendor", "fonts"))
    for f in ("react.production.min.js", "react-dom.production.min.js", "fonts.css",
              "babel.min.js"):
        shutil.copy(os.path.join(ROOT, "vendor", f), os.path.join(DIST, "vendor", f))
    for f in os.listdir(os.path.join(ROOT, "vendor", "brand")):
        shutil.copy(os.path.join(ROOT, "vendor", "brand", f), os.path.join(DIST, f))
    shutil.copy(os.path.join(ROOT, "image-slot.js"), os.path.join(DIST, "image-slot.js"))
    # ios-frame.jsx is fetched at runtime by <x-import> on the mobile page and
    # Babel-transformed with the vendored @babel/standalone (no CDN).
    shutil.copy(os.path.join(ROOT, "ios-frame.jsx"), os.path.join(DIST, "ios-frame.jsx"))
    # optional: ship uploads/ if present (not referenced by pages, kept for parity)
    # shutil.copytree(os.path.join(ROOT, "uploads"), os.path.join(DIST, "uploads"))

    patch_support()
    slugs = [build_page(src) for src in PAGES]
    write_static()

    print("Built dist/ ->")
    for base, _dirs, files in os.walk(DIST):
        for f in sorted(files):
            p = os.path.join(base, f)
            print(f"  {os.path.getsize(p):>8}  {os.path.relpath(p, DIST)}")
    print(f"\nPages: {', '.join(slugs)}")
    print(f"SITE_ORIGIN = {SITE_ORIGIN}  (set env var to your real domain before deploy)")


if __name__ == "__main__":
    main()
