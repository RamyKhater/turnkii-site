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

  // --- Instagram-Story image card (1080×1920) --------------------------------
  function loadImg(src) {
    return new Promise(function (res, rej) {
      var i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = function () { res(i); };
      i.onerror = rej;
      i.src = src;
    });
  }

  function wrapLines(ctx, text, maxWidth) {
    var words = String(text || "").split(/\s+/);
    var lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = words[i]; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  // Render a branded portrait card and return it as a PNG File.
  async function storyCard(o) {
    o = o || {};
    var W = 1080, H = 1920, PAD = 96;
    var c = document.createElement("canvas");
    c.width = W; c.height = H;
    var x = c.getContext("2d");
    try { await document.fonts.ready; } catch (e) {}

    x.fillStyle = "#12130E"; x.fillRect(0, 0, W, H);
    // soft lime accent glow, top-right
    var g = x.createRadialGradient(W - 60, 260, 40, W - 60, 260, 620);
    g.addColorStop(0, "rgba(214,242,60,0.22)"); g.addColorStop(1, "rgba(214,242,60,0)");
    x.fillStyle = g; x.fillRect(0, 0, W, 900);

    // logo (same-origin asset → no taint)
    try {
      var logo = await loadImg("assets/turnkii-logo.png");
      var lw = 220, lh = lw * (logo.height / logo.width);
      x.drawImage(logo, PAD, 140, lw, lh);
    } catch (e) {
      x.fillStyle = "#D6F23C"; x.font = '800 52px Manrope, system-ui, sans-serif';
      x.textBaseline = "alphabetic"; x.fillText("turnkii", PAD, 200);
    }

    // kicker
    x.fillStyle = "#D6F23C"; x.font = '700 36px Manrope, system-ui, sans-serif';
    try { x.letterSpacing = "6px"; } catch (e) {}
    x.textBaseline = "alphabetic";
    x.fillText(String(o.kicker || "").toUpperCase(), PAD, 420);
    try { x.letterSpacing = "0px"; } catch (e) {}

    // title (big serif, wrapped, block roughly centred)
    var titleSize = (o.title && o.title.length > 22) ? 104 : 132;
    x.fillStyle = "#F6F3EC";
    x.font = '400 ' + titleSize + 'px "Instrument Serif", Georgia, serif';
    var tLines = wrapLines(x, o.title || "", W - 2 * PAD);
    var lineH = titleSize * 1.05;
    var startY = 720;
    for (var i = 0; i < tLines.length; i++) x.fillText(tLines[i], PAD, startY + i * lineH);

    // subtitle
    if (o.subtitle) {
      var subY = startY + tLines.length * lineH + 24;
      x.fillStyle = "rgba(246,243,236,0.72)"; x.font = '500 40px Manrope, system-ui, sans-serif';
      var sLines = wrapLines(x, o.subtitle, W - 2 * PAD);
      for (var j = 0; j < sLines.length; j++) x.fillText(sLines[j], PAD, subY + j * 56);
    }

    // footer: lime pill CTA
    var fy = H - 210;
    x.fillStyle = "#D6F23C";
    var label = o.footer || "turnkii.app";
    x.font = '700 40px Manrope, system-ui, sans-serif';
    var tw = x.measureText(label).width;
    var pillW = tw + 96, pillH = 96, r = pillH / 2;
    x.beginPath();
    x.moveTo(PAD + r, fy); x.arcTo(PAD + pillW, fy, PAD + pillW, fy + pillH, r);
    x.arcTo(PAD + pillW, fy + pillH, PAD, fy + pillH, r); x.arcTo(PAD, fy + pillH, PAD, fy, r);
    x.arcTo(PAD, fy, PAD + pillW, fy, r); x.closePath(); x.fill();
    x.fillStyle = "#12130E"; x.textBaseline = "middle";
    x.fillText(label, PAD + 48, fy + pillH / 2 + 2);

    var blob = await new Promise(function (res) { c.toBlob(res, "image/png", 0.92); });
    return new File([blob], (o.filename || "turnkii") + ".png", { type: "image/png" });
  }

  // Share the Story card: native file-share on mobile (→ Instagram Stories),
  // else download the image so the user can post it manually.
  async function shareStory(o) {
    o = o || {};
    track("story", o.item);
    var file = null;
    try { file = await storyCard(o); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: o.text || "", url: o.url || "" }); return; } catch (e) {}
    }
    if (file) {
      try {
        var u = URL.createObjectURL(file);
        var a = document.createElement("a"); a.href = u; a.download = file.name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
        toast("Image saved — post it to your story");
        return;
      } catch (e) {}
    }
    go(o); // last resort: normal link share
  }

  window.TurnkiiShare = { url: url, wa: waLink, canNative: canNative, go: go, whatsapp: whatsapp, copyLink: copyLink, copy: copy, toast: toast, track: track, storyCard: storyCard, shareStory: shareStory };
})();
