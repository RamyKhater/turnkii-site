/* Site-wide link injection (survives the design-canvas re-renders via a
 * MutationObserver; every step is idempotent):
 *  - a header-nav + footer link to /our-work (repoints an existing "recent work"
 *    link rather than duplicating it),
 *  - a header-nav + footer "Book a meeting" link to /book,
 *  - a "Book a call" secondary CTA next to the homepage hero's primary CTA,
 *  - a "Book your survey now" CTA on the thank-you page,
 *  - and the "My account" link moved to the end of the nav. */
(function () {
  var WORK = "/our-work", WORK_LABEL = "Our recent work";
  var BOOK_LABEL = "Book a meeting";
  // Context-aware booking link: on a service page, prefill the meeting type +
  // service so the booking is tagged with where it came from.
  function BOOK() {
    var p = location.pathname;
    if (/\/care(\.html)?$/.test(p)) return "/book?svc=" + encodeURIComponent("Care & maintenance");
    if (/\/facility(\.html)?$/.test(p)) return "/book?type=site&svc=" + encodeURIComponent("Facility management");
    if (/\/projects(\.html)?$/.test(p)) return "/book?svc=" + encodeURIComponent("Projects & bulk");
    return "/book";
  }

  function txt(el) { return (el.textContent || "").trim().toLowerCase(); }
  function navEl() { return document.querySelector("header .tk-nav") || document.querySelector("header nav") || document.querySelector(".tk-nav"); }
  function isCta(a) { var s = a.getAttribute("style") || ""; return s.indexOf("999px") > -1 || /background\s*:/.test(s); }
  function firstCta(nav) { var k = nav.children, j; for (j = 0; j < k.length; j++) if (k[j].tagName === "A" && isCta(k[j])) return k[j]; return null; }
  function plainNavStyle(nav) { var l = nav.querySelectorAll("a"), i; for (i = 0; i < l.length; i++) if (!isCta(l[i]) && l[i].getAttribute("style")) return l[i].getAttribute("style"); return "color:rgba(246,243,236,0.72);font-size:14px;font-weight:600;"; }
  function mkLink(href, label, tag, style) { var a = document.createElement("a"); a.href = href; a.textContent = label; a.setAttribute("data-worklink", tag); if (style) a.setAttribute("style", style); return a; }

  // /our-work nav link (repoint existing "recent work" or insert)
  function ensureWorkNav() {
    var nav = navEl(); if (!nav) return;
    var links = nav.querySelectorAll("a"), i;
    for (i = 0; i < links.length; i++) if (txt(links[i]).indexOf("recent work") > -1) { links[i].setAttribute("href", WORK); links[i].setAttribute("data-worklink", "1"); return; }
    if (nav.querySelector('a[data-worklink="worknav"]')) return;
    var cta = firstCta(nav), a = mkLink(WORK, WORK_LABEL, "worknav", plainNavStyle(nav));
    if (cta) nav.insertBefore(a, cta); else nav.appendChild(a);
  }
  // "Book a meeting" nav link
  function ensureBookNav() {
    var nav = navEl(); if (!nav) return;
    var links = nav.querySelectorAll("a"), i;
    for (i = 0; i < links.length; i++) if (txt(links[i]) === "book a meeting") { links[i].setAttribute("href", BOOK()); return; }
    if (nav.querySelector('a[data-worklink="booknav"]')) return;
    var cta = firstCta(nav), a = mkLink(BOOK(), BOOK_LABEL, "booknav", plainNavStyle(nav));
    if (cta) nav.insertBefore(a, cta); else nav.appendChild(a);
  }

  function footerLink(tag, href, label, matchRe) {
    var f = document.querySelector("footer"); if (!f) return;
    var links = f.querySelectorAll("a"), i;
    for (i = 0; i < links.length; i++) if (matchRe.test(txt(links[i]))) { links[i].setAttribute("href", href); return; }
    if (f.querySelector('a[data-worklink="' + tag + '"]')) return;
    var ref = null;
    for (i = 0; i < links.length; i++) { var h = links[i].getAttribute("href") || ""; if (/privacy|terms/i.test(h) || /privacy|terms/i.test(txt(links[i]))) { ref = links[i]; break; } }
    var base = ref ? (ref.getAttribute("style") || "") : "color:rgba(246,243,236,0.7);font-size:14px;font-weight:600;";
    var a = mkLink(href, label, tag, base + ";margin-left:18px;");
    if (ref) ref.parentNode.insertBefore(a, ref); else f.appendChild(a);
  }

  // Thank-you page: a prominent "Book your survey now" CTA after the heading.
  function ensureThankYouBook() {
    if (!/thank-?you/i.test(location.pathname)) return;
    if (document.querySelector('a[data-worklink="tybook"]')) return;
    var h = document.querySelector("main h1, h1"); if (!h) return;
    var wrap = document.createElement("div");
    wrap.setAttribute("data-worklink", "tybookwrap");
    wrap.setAttribute("style", "margin:22px 0;");
    var b = mkLink(BOOK(), "Book your survey now →", "tybook",
      "display:inline-flex;align-items:center;gap:8px;background:#D6F23C;color:#12130E;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;");
    wrap.appendChild(b);
    h.insertAdjacentElement("afterend", wrap);
  }

  function ensureAccountLast() {
    var nav = navEl(); if (!nav) return;
    var links = nav.querySelectorAll("a"), acct = null, i;
    for (i = 0; i < links.length; i++) { var a = links[i]; if (a.getAttribute("data-nav") === "account" || /\bmy account\b/i.test(a.textContent || "")) { acct = a; break; } }
    if (!acct || nav.lastElementChild === acct) return;
    nav.appendChild(acct);
  }

  function run() {
    try {
      ensureWorkNav();
      footerLink("footer", WORK, WORK_LABEL, /recent work/);
      footerLink("bookfooter", BOOK(), BOOK_LABEL, /book a meeting/);
      ensureThankYouBook(); ensureAccountLast();
    } catch (e) {}
  }
  run();
  document.addEventListener("DOMContentLoaded", run);
  try { new MutationObserver(run).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
})();
