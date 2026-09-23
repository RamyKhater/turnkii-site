/* Public "our recent work" gallery for the marketing homepage — replaces the
 * Recent-handovers section with the featured project-showcase images, grouped by
 * service, with optional supplier/contractor logos and a deep-zoom viewer.
 * Fills any [data-projwork-slot]; survives the design-canvas re-renders via a
 * MutationObserver; the viewer overlay lives at <body> level (outside the DC
 * root) so it is never reconciled away. */
(function () {
  var base = window.TURNKII_PROJECT_FEATURED_URL;
  if (!base) return;
  // rate endpoint base: …/project-showcases/featured → …/project-showcases
  var rateBase = base.replace(/\/featured(\b[^]*)?$/, "");

  // one anonymous voter id per browser, reused for sample-work + project ratings
  function voterId() {
    try { var k = "tk_voter", v = localStorage.getItem(k); if (!v) { v = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); localStorage.setItem(k, v); } return v; }
    catch (e) { return "anon" + Math.random().toString(36).slice(2, 12); }
  }
  function voteKey(im) { return "tk_pjvote_" + im.token + "_" + im.index; }
  function myVote(im) { try { var v = localStorage.getItem(voteKey(im)); return v ? Number(v) : 0; } catch (e) { return 0; } }
  function sendRate(im, val) {
    if (!im || !im.token) return;
    fetch(rateBase + "/" + encodeURIComponent(im.token) + "/rate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index: im.index, value: val, voter: voterId() }),
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (res) { if (res && res.rating) { im.rating = res.rating; try { localStorage.setItem(voteKey(im), String(val)); } catch (e) {} if (view[idx] === im) paintRate(im); try { if (window.tkTrack) window.tkTrack("rate_work", { value: val, service: im.category || "", page: location.pathname }); } catch (e) {} } })
      .catch(function () {});
  }

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  // ── styles (scoped with .pw-) ─────────────────────────────────────────────
  var css = ""
    + ".pw-svc{padding:clamp(22px,3vw,36px) 0;border-top:1px solid #E4E0D5}.pw-svc:first-child{border-top:0;padding-top:0}"
    + ".pw-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px}"
    + ".pw-head .pw-eb{font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#4E5A16}"
    + ".pw-head h3{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:clamp(22px,3vw,32px);line-height:1.05;margin:2px 0 0}"
    + ".pw-credits{display:flex;flex-wrap:wrap;gap:8px}"
    + ".pw-credit{display:inline-flex;align-items:center;gap:9px;background:#FFF;border:1px solid #E4E0D5;border-radius:999px;padding:6px 13px 6px 10px}"
    + ".pw-credit .pw-cl{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8A8A79}"
    + ".pw-credit img{height:22px;width:auto;max-width:110px;object-fit:contain;display:block}"
    + ".pw-credit .pw-cn{font-size:13px;font-weight:700;color:#12130E}"
    + ".pw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:12px}"
    // carousel: one horizontal row, ~5 visible per line, scroll sideways for more
    + ".pw-grid.pw-carousel{display:flex;grid-template-columns:none;gap:12px;overflow-x:auto;padding:2px;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;-ms-overflow-style:none}"
    + ".pw-grid.pw-carousel::-webkit-scrollbar{display:none}"
    + ".pw-grid.pw-carousel .pw-item{flex:0 0 calc((100% - 4*12px)/5);scroll-snap-align:start}"
    + "@media(max-width:1000px){.pw-grid.pw-carousel .pw-item{flex-basis:calc((100% - 3*12px)/3.2)}}"
    + "@media(max-width:640px){.pw-grid.pw-carousel .pw-item{flex-basis:calc((100% - 12px)/1.35)}}"
    // arrow controls (like the viewer's prev/next), shown only when scrollable
    + ".pw-cwrap{position:relative}"
    + ".pw-arrow{position:absolute;top:50%;transform:translateY(-50%);z-index:4;width:44px;height:44px;border:0;border-radius:999px;background:rgba(18,19,14,.72);color:#fff;font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.22);transition:opacity .18s,background .18s}"
    + ".pw-arrow:hover{background:rgba(18,19,14,.92)}"
    + ".pw-aprev{left:-8px}.pw-anext{right:-8px}"
    + ".pw-arrow.pw-hide{opacity:0;pointer-events:none}"
    + "@media(max-width:640px){.pw-arrow{width:38px;height:38px;font-size:22px}.pw-aprev{left:2px}.pw-anext{right:2px}}"
    + ".pw-item{position:relative;padding:0;margin:0;border:1px solid #E4E0D5;border-radius:16px;overflow:hidden;background:#EFEBE1;cursor:zoom-in;display:block;width:100%;text-align:left}"
    + ".pw-item img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;transition:transform .35s ease}"
    + ".pw-item:hover img{transform:scale(1.04)}.pw-item:focus-visible{outline:2px solid #4E5A16;outline-offset:2px}"
    + ".pw-item .pw-z{position:absolute;top:9px;right:9px;width:28px;height:28px;border-radius:999px;background:rgba(18,19,14,.6);color:#fff;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s}"
    + ".pw-item:hover .pw-z,.pw-item:focus-visible .pw-z{opacity:1}"
    + ".pw-cap{position:absolute;left:0;right:0;bottom:0;padding:24px 12px 10px;color:#fff;font-size:13px;font-weight:600;line-height:1.3;background:linear-gradient(to top,rgba(10,10,8,.86),rgba(10,10,8,0))}"
    + "body.pw-lock{overflow:hidden}"
    + ".pw-viewer{position:fixed;inset:0;z-index:2147483000;background:#0A0A07;opacity:0;transition:opacity .2s;display:flex;flex-direction:column;font-family:Manrope,system-ui,sans-serif}"
    + ".pw-viewer[hidden]{display:none!important;pointer-events:none}"
    + ".pw-viewer.pw-open{opacity:1}"
    + ".pw-stage{flex:1;position:relative;overflow:hidden;touch-action:none;display:flex;align-items:center;justify-content:center;cursor:grab}.pw-stage.pw-grab{cursor:grabbing}"
    + ".pw-stage img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:center center;will-change:transform;user-select:none;-webkit-user-drag:none;pointer-events:none}"
    + ".pw-stage img.pw-anim{transition:transform .22s ease}"
    + ".pw-btn{position:absolute;z-index:3;background:rgba(255,255,255,.13);border:0;color:#fff;width:48px;height:48px;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;line-height:1;backdrop-filter:blur(6px)}"
    + ".pw-btn:hover{background:rgba(255,255,255,.24)}"
    + ".pw-close{top:max(14px,env(safe-area-inset-top));right:14px}.pw-prev{left:14px;top:50%;transform:translateY(-50%)}.pw-next{right:14px;top:50%;transform:translateY(-50%)}"
    + ".pw-num{position:absolute;top:max(20px,env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:3;color:rgba(255,255,255,.9);font-size:13px;font-weight:600;background:rgba(0,0,0,.4);padding:6px 14px;border-radius:999px}"
    + ".pw-tools{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom) + 14px);transform:translateX(-50%);z-index:3;display:flex;gap:8px}.pw-tools .pw-btn{position:static;width:44px;height:44px;font-size:20px}"
    + ".pw-info{position:relative;z-index:2;background:rgba(18,19,14,.92);color:#F6F3EC;border-top:1px solid rgba(246,243,236,.12);padding:14px clamp(16px,4vw,28px) calc(env(safe-area-inset-bottom) + 14px)}"
    + ".pw-info .pw-cat{font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#D6F23C}"
    + ".pw-info .pw-t{font-family:'Instrument Serif',Georgia,serif;font-size:clamp(19px,2.6vw,26px);line-height:1.1;margin-top:2px}"
    + ".pw-info .pw-n{font-size:14px;color:rgba(246,243,236,.82);margin-top:6px;max-width:70ch}"
    + ".pw-info .pw-s{display:inline-flex;gap:7px;margin-top:10px;font-size:12.5px;font-weight:600;background:rgba(246,243,236,.1);border:1px solid rgba(246,243,236,.16);border-radius:999px;padding:5px 12px}.pw-info .pw-s b{color:#D6F23C}"
    + ".pw-itext:empty{display:none}"
    + ".pw-rate{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(246,243,236,.12)}"
    + ".pw-rate .pw-rl{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(246,243,236,.7)}"
    + ".pw-stars{display:inline-flex;gap:1px}"
    + ".pw-stars button{background:none;border:0;cursor:pointer;font-size:24px;line-height:1;color:rgba(246,243,236,.3);padding:0 1px}"
    + ".pw-stars button.on{color:#F5C518}"
    + ".pw-rate .pw-ravg{font-size:13px;font-weight:600;color:rgba(246,243,236,.82)}"
    + ".pw-rate .pw-rthx{font-size:13px;font-weight:700;color:#D6F23C}"
    + "@media(max-width:600px){.pw-prev,.pw-next{top:auto;transform:none;bottom:calc(env(safe-area-inset-bottom) + 66px);width:44px;height:44px}.pw-prev{left:12px}.pw-next{right:12px}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ── viewer overlay (appended once, at body level) ─────────────────────────
  var V = document.createElement("div");
  V.className = "pw-viewer"; V.setAttribute("role", "dialog"); V.setAttribute("aria-modal", "true"); V.hidden = true;
  V.innerHTML =
    '<button class="pw-btn pw-close" type="button" aria-label="Close">✕</button>' +
    '<div class="pw-num"></div>' +
    '<button class="pw-btn pw-prev" type="button" aria-label="Previous">‹</button>' +
    '<div class="pw-stage"><img alt="" />' +
      '<div class="pw-tools"><button class="pw-btn pw-out" type="button" aria-label="Zoom out">−</button><button class="pw-btn pw-reset" type="button" aria-label="Reset zoom">⤢</button><button class="pw-btn pw-in" type="button" aria-label="Zoom in">+</button></div>' +
    '</div>' +
    '<button class="pw-btn pw-next" type="button" aria-label="Next">›</button>' +
    '<div class="pw-info"><div class="pw-itext"></div><div class="pw-rate"></div></div>';
  var appended = false;
  function ensureV() { if (!appended) { document.body.appendChild(V); appended = true; wireViewer(); } }

  var view = [], idx = 0, lastFocus = null, data = null;

  // ── data + rendering ──────────────────────────────────────────────────────
  fetch(base, { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (!d || !d.items || !d.items.length) return; data = d; fill();
      try { new MutationObserver(fill).observe(document.body, { childList: true, subtree: true }); } catch (e) {} })
    .catch(function () {});

  function fill() {
    if (!data) return;
    var slots = document.querySelectorAll("[data-projwork-slot]");
    var filledAny = false;
    for (var i = 0; i < slots.length; i++) { if (!slots[i].firstChild) { renderInto(slots[i]); filledAny = true; } }
    if (filledAny) {
      var fb = document.getElementById("work-fallback"); if (fb) fb.style.display = "none";
      // set initial arrow state once images/layout settle
      requestAnimationFrame(refreshCarousels);
      setTimeout(refreshCarousels, 400);
    }
  }

  function renderInto(slot) {
    var items = data.items.filter(function (i) { return i && i.image; });
    var credits = (data.credits || []).filter(function (c) { return c && c.image && c.service; });
    var order = [], groups = {};
    items.forEach(function (it) { var s = (it.category || "").trim() || "Gallery"; if (!groups[s]) { groups[s] = []; order.push(s); } groups[s].push(it); });
    view = [];
    order.forEach(function (s) { groups[s].forEach(function (it) { it._i = view.length; view.push(it); }); });
    function creditsFor(s) { var sl = s.toLowerCase(); return credits.filter(function (c) { return String(c.service || "").trim().toLowerCase() === sl; }); }
    slot.innerHTML = order.map(function (s) {
      var cs = creditsFor(s).map(function (c) { return '<span class="pw-credit"><span class="pw-cl">By</span><img src="' + esc(c.image) + '" alt="' + esc(c.name || s) + '" loading="lazy" />' + (c.name ? '<span class="pw-cn">' + esc(c.name) + "</span>" : "") + "</span>"; }).join("");
      var grid = groups[s].map(function (im) {
        var cap = im.caption ? '<span class="pw-cap">' + esc(im.caption) + "</span>" : "";
        return '<button type="button" class="pw-item" data-i="' + im._i + '" aria-label="Zoom ' + esc(im.caption || s) + '"><img src="' + esc(im.image) + '" alt="' + esc(im.caption || "") + '" loading="lazy" /><span class="pw-z" aria-hidden="true">⤢</span>' + cap + "</button>";
      }).join("");
      var head = '<div class="pw-head"><div><div class="pw-eb">Service</div><h3>' + esc(s) + "</h3></div>" + (cs ? '<div class="pw-credits">' + cs + "</div>" : "") + "</div>";
      var body = window.TURNKII_PROJWORK_CAROUSEL
        ? '<div class="pw-cwrap">'
            + '<button class="pw-arrow pw-aprev pw-hide" type="button" data-dir="-1" aria-label="Scroll left">‹</button>'
            + '<div class="pw-grid pw-carousel">' + grid + "</div>"
            + '<button class="pw-arrow pw-anext" type="button" data-dir="1" aria-label="Scroll right">›</button>'
          + "</div>"
        : '<div class="pw-grid">' + grid + "</div>";
      return '<section class="pw-svc" id="pw-' + slug(s) + '">' + head + body + "</section>";
    }).join("");
  }
  // one delegated handler (survives re-renders without stacking listeners)
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest(".pw-item"); if (b && b.closest("[data-projwork-slot]")) openAt(Number(b.getAttribute("data-i"))); });

  // ── carousel arrow controls (homepage) ────────────────────────────────────
  // Click prev/next to scroll ~one screen; arrows hide at each end / when the row
  // fits without scrolling. Delegated + capture-scroll so re-renders never leave
  // stale listeners.
  function updateArrows(g) {
    var wrap = g.closest ? g.closest(".pw-cwrap") : g.parentNode;
    if (!wrap) return;
    var prev = wrap.querySelector(".pw-aprev"), next = wrap.querySelector(".pw-anext");
    var max = g.scrollWidth - g.clientWidth - 2, scrollable = g.scrollWidth > g.clientWidth + 4;
    if (prev) prev.classList.toggle("pw-hide", !scrollable || g.scrollLeft <= 2);
    if (next) next.classList.toggle("pw-hide", !scrollable || g.scrollLeft >= max);
  }
  function refreshCarousels() { var gs = document.querySelectorAll(".pw-grid.pw-carousel"), i; for (i = 0; i < gs.length; i++) updateArrows(gs[i]); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".pw-arrow"); if (!b) return;
    var wrap = b.closest(".pw-cwrap"); if (!wrap) return;
    var g = wrap.querySelector(".pw-grid"); if (!g) return;
    var dir = Number(b.getAttribute("data-dir")) || 1;
    g.scrollBy({ left: dir * Math.max(240, g.clientWidth * 0.85), behavior: "smooth" });
  });
  document.addEventListener("scroll", function (e) { var g = e.target; if (g && g.classList && g.classList.contains && g.classList.contains("pw-carousel")) updateArrows(g); }, true);
  window.addEventListener("resize", refreshCarousels);
  window.addEventListener("load", refreshCarousels);

  // ── deep-zoom viewer ──────────────────────────────────────────────────────
  var stage, vimg, scale = 1, tx = 0, ty = 0, MIN = 1, MAX = 6;
  var pointers = new Map(), pinchStart = 0, pinchScale = 1, panning = false, panX = 0, panY = 0, downX = 0;
  function q(sel) { return V.querySelector(sel); }
  function apply() { vimg.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")"; }
  function anim(on) { vimg.classList.toggle("pw-anim", on); }
  function clamp() { var r = stage.getBoundingClientRect(); var iw = vimg.clientWidth * scale, ih = vimg.clientHeight * scale; var mx = Math.max(0, (iw - r.width) / 2), my = Math.max(0, (ih - r.height) / 2); tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty)); }
  function zoomTo(ns, cx, cy) { ns = Math.max(MIN, Math.min(MAX, ns)); var r = stage.getBoundingClientRect(); var px = (cx == null ? r.left + r.width / 2 : cx) - r.left - r.width / 2; var py = (cy == null ? r.top + r.height / 2 : cy) - r.top - r.height / 2; var k = ns / scale; tx = px - (px - tx) * k; ty = py - (py - ty) * k; scale = ns; if (scale <= MIN) { tx = 0; ty = 0; } clamp(); apply(); }
  function bump(f) { anim(true); zoomTo(scale * f); setTimeout(function () { anim(false); }, 220); }
  function paint() {
    var im = view[idx] || {};
    anim(false); scale = 1; tx = 0; ty = 0; apply();
    vimg.src = im.image; vimg.alt = im.caption || "Image";
    q(".pw-num").textContent = (idx + 1) + " / " + view.length;
    var m = view.length > 1 ? "" : "none"; q(".pw-prev").style.display = m; q(".pw-next").style.display = m;
    var h = "";
    if (im.category) h += '<div class="pw-cat">' + esc(im.category) + "</div>";
    if (im.caption) h += '<div class="pw-t">' + esc(im.caption) + "</div>";
    if (im.note) h += '<div class="pw-n">' + esc(im.note) + "</div>";
    if (im.spec) h += '<div class="pw-s"><b>Spec</b> ' + esc(im.spec) + "</div>";
    q(".pw-itext").innerHTML = h;
    paintRate(im);
  }
  // ── per-image star rating (feeds the homepage hero badge) ─────────────────
  function paintRate(im) {
    var box = q(".pw-rate"); if (!box) return;
    if (!im || !im.token) { box.style.display = "none"; return; }
    box.style.display = "";
    var mv = myVote(im), fillN = mv || (im.rating ? Math.round(im.rating.avg) : 0), stars = "";
    for (var i = 1; i <= 5; i++) stars += '<button type="button" data-v="' + i + '" class="' + (i <= fillN ? "on" : "") + '" aria-label="' + i + ' star' + (i > 1 ? "s" : "") + '">' + (i <= fillN ? "★" : "☆") + "</button>";
    var meta = mv
      ? '<span class="pw-rthx">Thanks for rating!</span>'
      : (im.rating && im.rating.count
        ? '<span class="pw-ravg">' + im.rating.avg.toFixed(1) + " · " + im.rating.count + " rating" + (im.rating.count > 1 ? "s" : "") + "</span>"
        : '<span class="pw-ravg" style="color:rgba(246,243,236,.55)">Be the first to rate</span>');
    box.innerHTML = '<span class="pw-rl">Rate this work</span><span class="pw-stars">' + stars + "</span>" + meta;
  }
  function openAt(i) { ensureV(); idx = i; lastFocus = document.activeElement; paint(); V.hidden = false; requestAnimationFrame(function () { V.classList.add("pw-open"); }); document.body.classList.add("pw-lock"); q(".pw-close").focus();
    try { var im = view[i] || {}; if (window.tkTrack) window.tkTrack("view_work_image", { service: im.category || "", page: location.pathname }); } catch (e) {} }
  function closeV() { V.classList.remove("pw-open"); document.body.classList.remove("pw-lock"); setTimeout(function () { V.hidden = true; vimg.src = ""; }, 200); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function go(d) { idx = (idx + d + view.length) % view.length; paint(); }
  function wireViewer() {
    stage = q(".pw-stage"); vimg = q(".pw-stage img");
    q(".pw-close").addEventListener("click", closeV);
    q(".pw-prev").addEventListener("click", function () { go(-1); });
    q(".pw-next").addEventListener("click", function () { go(1); });
    q(".pw-in").addEventListener("click", function () { bump(1.6); });
    q(".pw-out").addEventListener("click", function () { bump(1 / 1.6); });
    q(".pw-reset").addEventListener("click", function () { bump(1 / (scale || 1)); });
    q(".pw-tools").addEventListener("pointerdown", function (e) { e.stopPropagation(); });
    var rate = q(".pw-rate");
    rate.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button[data-v]"); if (b) sendRate(view[idx], Number(b.getAttribute("data-v"))); });
    rate.addEventListener("mouseover", function (e) { var b = e.target.closest && e.target.closest("button[data-v]"); if (!b) return; var v = Number(b.getAttribute("data-v")); var bs = rate.querySelectorAll("button[data-v]"); for (var i = 0; i < bs.length; i++) { var xi = Number(bs[i].getAttribute("data-v")); bs[i].textContent = xi <= v ? "★" : "☆"; bs[i].className = xi <= v ? "on" : ""; } });
    rate.addEventListener("mouseleave", function () { paintRate(view[idx]); });
    document.addEventListener("keydown", function (e) { if (V.hidden) return; if (e.key === "Escape") closeV(); else if (e.key === "ArrowLeft") go(-1); else if (e.key === "ArrowRight") go(1); else if (e.key === "+" || e.key === "=") bump(1.6); else if (e.key === "-") bump(1 / 1.6); });
    stage.addEventListener("wheel", function (e) { e.preventDefault(); zoomTo(scale * (1 - e.deltaY * 0.0016), e.clientX, e.clientY); }, { passive: false });
    stage.addEventListener("dblclick", function (e) { anim(true); zoomTo(scale > 1 ? 1 : 3, e.clientX, e.clientY); setTimeout(function () { anim(false); }, 220); });
    stage.addEventListener("pointerdown", function (e) { stage.setPointerCapture(e.pointerId); pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size === 2) { var p = [].concat(Array.from(pointers.values())); pinchStart = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); pinchScale = scale; } else { panning = true; panX = e.clientX; panY = e.clientY; downX = e.clientX; stage.classList.add("pw-grab"); } });
    stage.addEventListener("pointermove", function (e) { if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pointers.size === 2) { var p = [].concat(Array.from(pointers.values())); var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); var mx = (p[0].x + p[1].x) / 2, my = (p[0].y + p[1].y) / 2; if (pinchStart > 0) zoomTo(pinchScale * (d / pinchStart), mx, my); return; } if (panning && scale > 1) { tx += e.clientX - panX; ty += e.clientY - panY; panX = e.clientX; panY = e.clientY; clamp(); apply(); } });
    function upV(e) { var wasSingle = pointers.size === 1; pointers.delete(e.pointerId); stage.classList.remove("pw-grab"); if (pointers.size < 2) pinchStart = 0; if (wasSingle && scale <= 1) { var dx = e.clientX - downX; if (Math.abs(dx) > 60 && view.length > 1) go(dx < 0 ? 1 : -1); } panning = pointers.size > 0; }
    stage.addEventListener("pointerup", upV); stage.addEventListener("pointercancel", upV);
    V.addEventListener("click", function (e) { if (e.target === V) closeV(); });
  }
})();
