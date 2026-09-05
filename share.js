/* Turnkii share helper (window.TurnkiiShare) — one small, dependency-free engine
   behind every "viral loop" share button. Builds UTM-tagged links, opens the
   right channel (native sheet on mobile → WhatsApp/Instagram/etc., WhatsApp web
   on desktop), copies links, and fires a GA `share` event for attribution. */
(function () {
  function origin() { try { return location.origin.replace(/\/+$/, ''); } catch (e) { return ''; } }

  // Build an absolute, UTM-tagged share URL for a path on the site.
  function url(path, opts) {
    opts = opts || {};
    var base = origin() + (path || '/');
    try {
      var u = new URL(base);
      u.searchParams.set('utm_source', opts.source || 'share');
      u.searchParams.set('utm_medium', opts.medium || 'social');
      if (opts.campaign) u.searchParams.set('utm_campaign', opts.campaign);
      u.searchParams.set('ref', 'share');
      return u.toString();
    } catch (e) { return base; }
  }

  function waLink(text, link) {
    return 'https://wa.me/?text=' + encodeURIComponent((text ? text + ' ' : '') + (link || ''));
  }

  function canNative() { try { return typeof navigator !== 'undefined' && !!navigator.share; } catch (e) { return false; } }

  function track(method, item) {
    try { if (window.tkTrack) window.tkTrack('share', { method: method || 'unknown', item: item || '' }); } catch (e) {}
  }

  function copy(text) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text); } catch (e) {}
    return new Promise(function (res, rej) {
      try {
        var t = document.createElement('textarea');
        t.value = text; t.setAttribute('readonly', ''); t.style.position = 'absolute'; t.style.left = '-9999px';
        document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); res();
      } catch (e) { rej(e); }
    });
  }

  // A tiny transient toast (used for "link copied").
  function toast(msg) {
    try {
      var d = document.createElement('div');
      d.textContent = msg;
      d.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483600;background:#12130E;color:#F6F3EC;font-family:Manrope,system-ui,sans-serif;font-size:14px;font-weight:600;padding:12px 18px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.22);opacity:0;transition:opacity .18s;';
      document.body.appendChild(d);
      requestAnimationFrame(function () { d.style.opacity = '1'; });
      setTimeout(function () { d.style.opacity = '0'; setTimeout(function () { d.remove(); }, 220); }, 1900);
    } catch (e) {}
  }

  // The one-tap share: native sheet on mobile (covers WhatsApp, Instagram, DMs…),
  // WhatsApp on desktop, copy as the last resort. Always fires the GA event.
  function go(o) {
    o = o || {};
    var link = o.url || url(o.path || '/', o);
    var text = o.text || '';
    track(o.item ? 'auto' : (o.method || 'auto'), o.item);
    if (canNative()) {
      try {
        navigator.share({ title: o.title || 'Turnkii', text: text, url: link }).catch(function () {});
        return;
      } catch (e) {}
    }
    // desktop fallback: open WhatsApp with the prefilled message + link
    try { window.open(waLink(text, link), '_blank', 'noopener'); return; } catch (e) {}
    copy(link).then(function () { toast('Link copied'); });
  }

  function whatsapp(o) {
    o = o || {};
    var link = o.url || url(o.path || '/', { source: 'share', medium: 'whatsapp', campaign: o.campaign });
    track('whatsapp', o.item);
    try { window.open(waLink(o.text || '', link), '_blank', 'noopener'); } catch (e) {}
  }

  function copyLink(o) {
    o = o || {};
    var link = o.url || url(o.path || '/', { source: 'share', medium: 'copy', campaign: o.campaign });
    track('copy', o.item);
    copy(link).then(function () { toast('Link copied — paste it anywhere'); });
  }

  window.TurnkiiShare = { url: url, wa: waLink, canNative: canNative, go: go, whatsapp: whatsapp, copyLink: copyLink, copy: copy, toast: toast, track: track };
})();
