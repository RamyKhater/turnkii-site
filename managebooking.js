/* Manage-booking widget (/manage-booking?token=…): shows the customer's current
 * meeting and lets them reschedule (to an open slot) or cancel. Reads/writes the
 * admin's tokened /api/booking/manage. Self-contained; styles scoped .mb-. */
(function () {
  var MANAGE = window.TURNKII_BOOKING_MANAGE_URL, AVAIL = window.TURNKII_BOOKING_AVAILABILITY_URL;
  var mount = document.querySelector("[data-managebooking-slot]");
  if (!mount) return;
  var token = new URLSearchParams(location.search).get("token");

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dayLabel(date) { var p = date.split("-").map(Number); var wd = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); return { wd: WD[wd], d: p[2], mo: MO[p[1] - 1] }; }
  function whenStr(date, time) { var l = dayLabel(date); return l.wd + " " + l.d + " " + l.mo + " · " + time; }
  function typeLabel(t) { return t === "online" ? "Online meeting" : "On-site survey"; }

  var css = ""
    + ".mb{--ink:#12130E;--cream:#F6F3EC;--paper:#fff;--sand:#EFEBE1;--line:#E4E0D5;--lime:#D6F23C;--olive:#4E5A16;--sub:#5B5B4E;--muted:#8A8A79;font-family:Manrope,system-ui,sans-serif;color:var(--ink)}"
    + ".mb *{box-sizing:border-box}"
    + ".mb-cur{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:baseline;border:1px solid var(--line);background:var(--sand);border-radius:14px;padding:16px 18px}"
    + ".mb-cur .w{font-size:19px;font-weight:800}.mb-cur .t{font-size:14px;color:var(--sub)}"
    + ".mb-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}"
    + ".mb-btn{display:inline-flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:14px 24px;font:inherit;font-size:15px;font-weight:800;cursor:pointer}"
    + ".mb-btn.primary{background:var(--lime);color:var(--ink)}.mb-btn.ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}.mb-btn.danger{background:transparent;border:1px solid #c0392b;color:#c0392b}"
    + ".mb-btn:disabled{opacity:.55;cursor:default}"
    + ".mb-h{font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted);margin:22px 0 10px}"
    + ".mb-days{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}"
    + ".mb-day{flex:0 0 auto;min-width:64px;border:1px solid var(--line);background:var(--paper);border-radius:12px;padding:9px 6px;text-align:center;cursor:pointer}"
    + ".mb-day.on{background:var(--ink);color:var(--cream);border-color:var(--ink)}.mb-day .wd{font-size:11px;font-weight:700;color:var(--muted)}.mb-day.on .wd{color:rgba(246,243,236,.7)}.mb-day .dn{font-size:18px;font-weight:800}"
    + ".mb-times{display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:8px}"
    + ".mb-t{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:9px 4px;font:inherit;font-weight:700;cursor:pointer}.mb-t.on{background:var(--lime);border-color:var(--olive)}"
    + ".mb-note{font-size:13px;color:var(--muted);margin-top:10px}.mb-err{background:#fde8e8;color:#9b2c2c;border-radius:10px;padding:10px 14px;font-weight:600;margin-top:12px}"
    + ".mb-ok{text-align:center;padding:14px 0}.mb-ok .tick{width:52px;height:52px;border-radius:999px;background:var(--lime);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px}"
    + ".mb-empty{color:var(--muted)}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  mount.classList.add("mb");

  if (!MANAGE || !token) { mount.innerHTML = '<div class="mb-err">This link is invalid or incomplete.</div>'; return; }

  var booking = null, avail = null, sel = { date: null, time: null }, busy = false, rescheduling = false;
  mount.innerHTML = '<div class="mb-empty">Loading your booking…</div>';

  fetch(MANAGE + "?token=" + encodeURIComponent(token), { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (b) { if (!b || b.error) { mount.innerHTML = '<div class="mb-err">We couldn’t find that booking.</div>'; return; } booking = b; render(); })
    .catch(function () { mount.innerHTML = '<div class="mb-err">Something went wrong — please try again.</div>'; });

  function render() {
    if (booking.cancelled) { mount.innerHTML = '<div class="mb-ok"><div class="tick">✓</div><h3 style="font-family:\'Instrument Serif\',Georgia,serif;font-weight:400;font-size:26px;margin:0 0 6px">Meeting cancelled</h3><p style="color:var(--sub)">This meeting has been cancelled. Changed your mind? <a href="/book" style="color:var(--olive);font-weight:700">Book a new time</a>.</p></div>'; return; }
    var html =
      '<div class="mb-cur"><div><div class="w">' + esc(whenStr(booking.date, booking.time)) + '</div><div class="t">' + esc(typeLabel(booking.type)) + ' · Cairo time</div></div></div>' +
      '<div class="mb-actions"><button type="button" class="mb-btn primary" id="mb-resch">Reschedule</button><button type="button" class="mb-btn danger" id="mb-cancel">Cancel meeting</button></div>' +
      '<div id="mb-resched-wrap"></div><div class="mb-errwrap"></div>';
    mount.innerHTML = html;
    mount.querySelector("#mb-cancel").addEventListener("click", doCancel);
    mount.querySelector("#mb-resch").addEventListener("click", startReschedule);
    if (rescheduling) startReschedule();
  }

  function showErr(m) { var w = mount.querySelector(".mb-errwrap"); if (w) w.innerHTML = '<div class="mb-err">' + esc(m) + "</div>"; }

  function doCancel() {
    if (busy) return;
    if (!window.confirm("Cancel this meeting?")) return;
    busy = true;
    post({ token: token, action: "cancel" }).then(function (res) {
      busy = false;
      if (res.ok && res.j && res.j.ok) { booking.cancelled = true; render(); try { if (window.tkTrack) window.tkTrack("booking_cancel", {}); } catch (e) {} }
      else showErr((res.j && res.j.error) || "Couldn’t cancel — please try again.");
    });
  }

  function startReschedule() {
    rescheduling = true;
    var wrap = mount.querySelector("#mb-resched-wrap"); if (!wrap) return;
    wrap.innerHTML = '<div class="mb-h">Loading open times…</div>';
    (avail ? Promise.resolve(avail) : fetch(AVAIL).then(function (r) { return r.json(); }))
      .then(function (d) { avail = d; renderPicker(); })
      .catch(function () { wrap.innerHTML = '<div class="mb-err">Couldn’t load times.</div>'; });
  }

  function renderPicker() {
    var wrap = mount.querySelector("#mb-resched-wrap"); if (!wrap) return;
    var days = (avail && avail.days) || [];
    if (!days.length) { wrap.innerHTML = '<div class="mb-note">No open times right now.</div>'; return; }
    if (!sel.date || !days.some(function (d) { return d.date === sel.date; })) sel.date = days[0].date;
    var cur = days.filter(function (d) { return d.date === sel.date; })[0] || days[0];
    if (sel.time && cur.slots.indexOf(sel.time) < 0) sel.time = null;
    wrap.innerHTML =
      '<div class="mb-h">Pick a new day</div><div class="mb-days">' +
      days.map(function (d) { var l = dayLabel(d.date); return '<button type="button" class="mb-day ' + (d.date === sel.date ? "on" : "") + '" data-date="' + d.date + '"><span class="wd">' + l.wd + '</span><div class="dn">' + l.d + '</div></button>'; }).join("") +
      '</div><div class="mb-h">Pick a time</div><div class="mb-times">' +
      cur.slots.map(function (t) { return '<button type="button" class="mb-t ' + (sel.time === t ? "on" : "") + '" data-time="' + t + '">' + t + "</button>"; }).join("") +
      '</div><div style="margin-top:16px"><button type="button" class="mb-btn primary" id="mb-confirm"' + (sel.time ? "" : " disabled") + '>Confirm new time</button></div>';
    wrap.querySelectorAll("[data-date]").forEach(function (b) { b.addEventListener("click", function () { sel.date = b.getAttribute("data-date"); sel.time = null; renderPicker(); }); });
    wrap.querySelectorAll("[data-time]").forEach(function (b) { b.addEventListener("click", function () { sel.time = b.getAttribute("data-time"); renderPicker(); }); });
    var c = wrap.querySelector("#mb-confirm"); if (c) c.addEventListener("click", doReschedule);
  }

  function doReschedule() {
    if (busy || !sel.time) return;
    busy = true;
    post({ token: token, action: "reschedule", date: sel.date, time: sel.time }).then(function (res) {
      busy = false;
      if (res.status === 409) { showErr("That slot was just taken — pick another."); return fetch(AVAIL).then(function (r) { return r.json(); }).then(function (d) { avail = d; renderPicker(); }); }
      if (res.ok && res.j && res.j.ok) { booking.date = res.j.date; booking.time = res.j.time; rescheduling = false; render(); try { if (window.tkTrack) window.tkTrack("booking_reschedule", {}); } catch (e) {} }
      else showErr((res.j && res.j.error) || "Couldn’t reschedule — please try again.");
    });
  }

  function post(body) {
    return fetch(MANAGE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }).catch(function () { return { ok: r.ok, status: r.status, j: null }; }); })
      .catch(function () { return { ok: false, status: 0, j: null }; });
  }
})();
