/* Site-wide: ensure a header-nav link and a footer link to the dedicated
 * "/our-work" project-showcase page. If a "recent work" link already exists
 * (e.g. the homepage's in-page #work anchor) it is repointed to the page rather
 * than duplicated. Idempotent and MutationObserver-resilient so it survives the
 * design-canvas re-renders. */
(function () {
  var HREF = "/our-work", LABEL = "Our recent work";
  function txt(el) { return (el.textContent || "").trim().toLowerCase(); }
  function isCta(a) { var s = a.getAttribute("style") || ""; return s.indexOf("999px") > -1 || /background\s*:/.test(s); }

  function ensureNav() {
    var nav = document.querySelector("header .tk-nav") || document.querySelector("header nav") || document.querySelector(".tk-nav");
    if (!nav) return;
    var links = nav.querySelectorAll("a"), i;
    for (i = 0; i < links.length; i++) {
      if (txt(links[i]).indexOf("recent work") > -1) { links[i].setAttribute("href", HREF); links[i].setAttribute("data-worklink", "1"); return; }
    }
    if (nav.querySelector('a[data-worklink="nav"]')) return;
    // copy a plain (non-CTA) sibling link's inline style so it blends in
    var style = "color:rgba(246,243,236,0.72);font-size:14px;font-weight:600;";
    for (i = 0; i < links.length; i++) { if (!isCta(links[i]) && links[i].getAttribute("style")) { style = links[i].getAttribute("style"); break; } }
    var a = document.createElement("a");
    a.href = HREF; a.textContent = LABEL; a.setAttribute("data-worklink", "nav"); a.setAttribute("style", style);
    var cta = null, kids = nav.children, j;
    for (j = 0; j < kids.length; j++) { if (kids[j].tagName === "A" && isCta(kids[j])) { cta = kids[j]; break; } }
    if (cta) nav.insertBefore(a, cta); else nav.appendChild(a);
  }

  function ensureFooter() {
    var f = document.querySelector("footer");
    if (!f) return;
    var links = f.querySelectorAll("a"), i;
    for (i = 0; i < links.length; i++) {
      if (txt(links[i]).indexOf("recent work") > -1) { links[i].setAttribute("href", HREF); links[i].setAttribute("data-worklink", "1"); return; }
    }
    if (f.querySelector('a[data-worklink="footer"]')) return;
    var ref = null;
    for (i = 0; i < links.length; i++) { var h = links[i].getAttribute("href") || ""; if (/privacy|terms/i.test(h) || /privacy|terms/i.test(txt(links[i]))) { ref = links[i]; break; } }
    var a = document.createElement("a");
    a.href = HREF; a.textContent = LABEL; a.setAttribute("data-worklink", "footer");
    if (ref) { a.setAttribute("style", ref.getAttribute("style") || ""); ref.parentNode.insertBefore(a, ref); }
    else { a.setAttribute("style", "color:rgba(246,243,236,0.7);font-size:14px;font-weight:600;"); f.appendChild(a); }
  }

  function run() { try { ensureNav(); ensureFooter(); } catch (e) {} }
  run();
  document.addEventListener("DOMContentLoaded", run);
  try { new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
})();
