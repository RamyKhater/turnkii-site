/* Turnkii "Book a meeting" widget. Renders into [data-booking-slot]: pick a
 * meeting type + an available day + time (from /api/booking/availability), enter
 * contact details, and submit to /api/booking. On success it shows a confirmation
 * with the meeting link (online) — the customer and admin also get an email + a
 * calendar invite. Self-contained; styles scoped with .bk-. */
(function () {
  var AVAIL = window.TURNKII_BOOKING_AVAILABILITY_URL, SUBMIT = window.TURNKII_BOOKING_URL;
  var mount = document.querySelector("[data-booking-slot]");
  if (!mount || !AVAIL || !SUBMIT) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dayLabel(date) { var p = date.split("-").map(Number); var wd = new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); return { wd: WD[wd], d: p[2], mo: MO[p[1] - 1] }; }

  var css = ""
    + ".bk{--ink:#12130E;--cream:#F6F3EC;--paper:#fff;--sand:#EFEBE1;--line:#E4E0D5;--lime:#D6F23C;--olive:#4E5A16;--sub:#5B5B4E;--muted:#8A8A79;font-family:Manrope,system-ui,sans-serif;color:var(--ink)}"
    + ".bk *{box-sizing:border-box}"
    + ".bk-row{display:flex;flex-wrap:wrap;gap:8px}"
    + ".bk-seg{display:inline-flex;background:var(--sand);border-radius:999px;padding:4px;gap:4px}"
    + ".bk-seg button{border:0;background:transparent;border-radius:999px;padding:9px 18px;font:inherit;font-size:14px;font-weight:700;color:var(--sub);cursor:pointer}"
    + ".bk-seg button.on{background:var(--ink);color:var(--cream)}"
    + ".bk-h{font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted);margin:22px 0 10px}"
    + ".bk-days{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px;scrollbar-width:thin}"
    + ".bk-day{flex:0 0 auto;min-width:68px;border:1px solid var(--line);background:var(--paper);border-radius:14px;padding:10px 6px;text-align:center;cursor:pointer}"
    + ".bk-day:hover{border-color:var(--ink)}.bk-day.on{background:var(--ink);color:var(--cream);border-color:var(--ink)}"
    + ".bk-day .wd{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.bk-day.on .wd{color:rgba(246,243,236,.7)}"
    + ".bk-day .dn{font-size:20px;font-weight:800;line-height:1.1;margin-top:2px}.bk-day .mo{font-size:11px;color:var(--muted)}.bk-day.on .mo{color:rgba(246,243,236,.7)}"
    + ".bk-times{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:8px}"
    + ".bk-t{border:1px solid var(--line);background:var(--paper);border-radius:10px;padding:10px 4px;font:inherit;font-size:14px;font-weight:700;color:var(--ink);cursor:pointer}"
    + ".bk-t:hover{border-color:var(--ink)}.bk-t.on{background:var(--lime);border-color:var(--olive)}"
    + ".bk-form{margin-top:22px;display:grid;gap:12px;grid-template-columns:1fr 1fr}"
    + ".bk-form label{display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}"
    + ".bk-form .full{grid-column:1/-1}"
    + ".bk-form input,.bk-form textarea{width:100%;margin-top:5px;border:1px solid var(--line);border-radius:10px;padding:11px 12px;font:inherit;font-size:15px;background:var(--paper);outline:none}"
    + ".bk-form input:focus,.bk-form textarea:focus{border-color:var(--ink)}"
    + ".bk-cta{grid-column:1/-1;margin-top:4px}"
    + ".bk-btn{display:inline-flex;align-items:center;gap:8px;background:var(--lime);color:var(--ink);border:0;border-radius:999px;padding:15px 28px;font:inherit;font-size:15px;font-weight:800;cursor:pointer}"
    + ".bk-btn:disabled{opacity:.55;cursor:default}"
    + ".bk-note{font-size:13px;color:var(--muted);margin-top:10px}"
    + ".bk-err{background:#fde8e8;color:#9b2c2c;border-radius:10px;padding:10px 14px;font-size:14px;font-weight:600;margin-top:12px}"
    + ".bk-empty{color:var(--muted);font-size:14px;padding:16px 0}"
    + ".bk-ok{text-align:center;padding:20px 0}.bk-ok .tick{width:56px;height:56px;border-radius:999px;background:var(--lime);color:var(--ink);display:flex;align-items:center;justify-content:center;font-size:30px;margin:0 auto 14px}"
    + ".bk-ok h3{font-family:'Instrument Serif',Georgia,serif;font-weight:400;font-size:30px;margin:0 0 6px}"
    + ".bk-ok p{color:var(--sub);font-size:15px;margin:6px auto;max-width:48ch;line-height:1.6}"
    + ".bk-ok a.join{display:inline-flex;margin-top:12px;background:var(--ink);color:var(--lime);border-radius:999px;padding:13px 24px;font-weight:800;font-size:15px}"
    + "@media(max-width:560px){.bk-form{grid-template-columns:1fr}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var data = null, sel = { date: null, time: null, type: null }, busy = false;
  // Prefill from query params so entry points can preset the meeting type, the
  // service context, and known contact details (e.g. /book?type=site&svc=Facility).
  var Q = new URLSearchParams(location.search);
  var pre = {
    type: Q.get("type"), svc: (Q.get("svc") || "").slice(0, 60),
    name: (Q.get("name") || "").slice(0, 120), phone: (Q.get("phone") || "").slice(0, 40),
    email: (Q.get("email") || "").slice(0, 160), location: (Q.get("location") || "").slice(0, 200),
  };
  mount.classList.add("bk");
  mount.innerHTML = '<div class="bk-empty">Loading available times…</div>';

  fetch(AVAIL, { headers: { Accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) { mount.innerHTML = '<div class="bk-err">Couldn’t load available times. Please try again.</div>'; return; }
      data = d; sel.type = (d.types && d.types[0]) || "online";
      if (pre.type && d.types && d.types.indexOf(pre.type) > -1) sel.type = pre.type;
      if (d.days && d.days[0]) sel.date = d.days[0].date;
      render();
    })
    .catch(function () { mount.innerHTML = '<div class="bk-err">Couldn’t load available times. Please try again.</div>'; });

  function typeLabel(t) { return t === "online" ? "Online meeting" : "On-site survey"; }

  function render() {
    var days = (data.days || []);
    if (!days.length) { mount.innerHTML = '<div class="bk-empty">No open slots right now — please check back soon, or reach us on WhatsApp.</div>'; return; }
    if (!sel.date || !days.some(function (d) { return d.date === sel.date; })) sel.date = days[0].date;
    var cur = days.filter(function (d) { return d.date === sel.date; })[0] || days[0];
    if (sel.time && cur.slots.indexOf(sel.time) < 0) sel.time = null;

    var typeSeg = (data.types && data.types.length > 1)
      ? '<div class="bk-seg" role="tablist">' + data.types.map(function (t) { return '<button type="button" data-type="' + t + '" class="' + (sel.type === t ? "on" : "") + '">' + esc(typeLabel(t)) + "</button>"; }).join("") + "</div>"
      : '<div class="bk-h" style="margin-top:0">' + esc(typeLabel(sel.type)) + "</div>";

    var dayHtml = days.map(function (d) {
      var l = dayLabel(d.date);
      return '<button type="button" class="bk-day ' + (d.date === sel.date ? "on" : "") + '" data-date="' + d.date + '"><span class="wd">' + l.wd + '</span><div class="dn">' + l.d + '</div><span class="mo">' + l.mo + "</span></button>";
    }).join("");

    var timeHtml = cur.slots.map(function (t) { return '<button type="button" class="bk-t ' + (sel.time === t ? "on" : "") + '" data-time="' + t + '">' + t + "</button>"; }).join("");

    var onsite = sel.type === "site";
    mount.innerHTML =
      typeSeg +
      '<div class="bk-h">Pick a day</div><div class="bk-days">' + dayHtml + "</div>" +
      '<div class="bk-h">Pick a time <span style="color:var(--muted);font-weight:400;text-transform:none;letter-spacing:0">· ' + esc(data.tz ? data.tz.replace("_", " ") : "local") + " time</span></div>" +
      '<div class="bk-times">' + timeHtml + "</div>" +
      '<form class="bk-form" novalidate>' +
        '<div class="full"><label>Full name<input name="name" required maxlength="120" value="' + esc(pre.name) + '" /></label></div>' +
        '<div><label>Phone<input name="phone" required maxlength="40" inputmode="tel" value="' + esc(pre.phone) + '" /></label></div>' +
        '<div><label>Email<input name="email" type="email" maxlength="160" value="' + esc(pre.email) + '" /></label></div>' +
        (onsite ? '<div class="full"><label>Property address / location<input name="location" maxlength="200" value="' + esc(pre.location) + '" /></label></div>' : "") +
        '<div class="full"><label>Anything we should know? <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--muted)">(optional)</span><textarea name="message" rows="2" maxlength="2000"></textarea></label></div>' +
        '<div class="bk-cta"><button type="submit" class="bk-btn">Confirm booking →</button><div class="bk-note">You’ll get a confirmation email with a calendar invite' + (sel.type === "online" ? " and your meeting link." : ".") + '</div><div class="bk-errwrap"></div></div>' +
      "</form>";

    // wire
    mount.querySelectorAll("[data-type]").forEach(function (b) { b.addEventListener("click", function () { sel.type = b.getAttribute("data-type"); sel.time = sel.time; render(); }); });
    mount.querySelectorAll("[data-date]").forEach(function (b) { b.addEventListener("click", function () { sel.date = b.getAttribute("data-date"); sel.time = null; render(); }); });
    mount.querySelectorAll("[data-time]").forEach(function (b) { b.addEventListener("click", function () { sel.time = b.getAttribute("data-time"); render(); }); });
    var form = mount.querySelector(".bk-form");
    if (form) form.addEventListener("submit", submit);
  }

  function showErr(msg) { var w = mount.querySelector(".bk-errwrap"); if (w) w.innerHTML = '<div class="bk-err">' + esc(msg) + "</div>"; }

  function submit(e) {
    e.preventDefault();
    if (busy) return;
    var form = e.target;
    if (!sel.time) { showErr("Please pick a time."); return; }
    var fd = new FormData(form);
    var name = String(fd.get("name") || "").trim(), phone = String(fd.get("phone") || "").trim();
    if (!name || phone.length < 4) { showErr("Please enter your name and phone."); return; }
    var attrib = (window.tkAttrib ? window.tkAttrib() : {}) || {};
    var payload = {
      name: name, phone: phone, email: String(fd.get("email") || "").trim(),
      date: sel.date, time: sel.time, type: sel.type,
      location: String(fd.get("location") || "").trim() || undefined,
      message: String(fd.get("message") || "").trim() || undefined,
      services: pre.svc ? [pre.svc] : undefined,
      utmSource: attrib.utm_source, utmMedium: attrib.utm_medium, utmCampaign: attrib.utm_campaign,
      gclid: attrib.gclid, fbclid: attrib.fbclid,
    };
    busy = true;
    var btn = form.querySelector(".bk-btn"); if (btn) { btn.disabled = true; btn.textContent = "Booking…"; }
    fetch(SUBMIT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
      .then(function (res) {
        busy = false;
        if (res.status === 409) { showErr("That slot was just taken — pick another."); if (btn) { btn.disabled = false; btn.textContent = "Confirm booking →"; } return fetch(AVAIL).then(function (r) { return r.json(); }).then(function (d) { data = d; render(); }); }
        if (!res.ok || !res.j || !res.j.ok) { showErr((res.j && res.j.error) || "Couldn’t book that — please try again."); if (btn) { btn.disabled = false; btn.textContent = "Confirm booking →"; } return; }
        try { if (window.tkTrack) window.tkTrack("book_meeting", { type: sel.type }); } catch (e) {}
        confirmView(res.j);
      })
      .catch(function () { busy = false; showErr("Network error — please try again."); if (btn) { btn.disabled = false; btn.textContent = "Confirm booking →"; } });
  }

  function confirmView(res) {
    var l = dayLabel(sel.date);
    mount.innerHTML =
      '<div class="bk-ok"><div class="tick">✓</div>' +
      "<h3>You’re booked in</h3>" +
      "<p><b>" + l.wd + " " + l.d + " " + l.mo + " · " + sel.time + "</b> — " + esc(typeLabel(sel.type)) + ".</p>" +
      "<p>We’ve emailed your confirmation and a calendar invite" + (sel.type === "online" ? ", with your meeting link." : ". Our team will see you on-site.") + "</p>" +
      (res.meetingLink ? '<a class="join" href="' + esc(res.meetingLink) + '" target="_blank" rel="noopener">Join link ↗</a>' : "") +
      "</div>";
  }
})();
