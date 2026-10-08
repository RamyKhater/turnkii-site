/* Turnkii account SDK — talks to the admin's /api/account/* endpoints with a
   bearer token (owner session id) kept in localStorage. Loaded site-wide so
   any page can read sign-in state and call the account APIs via window.tkAccount. */
(function () {
  var BASE = (window.TURNKII_ACCOUNT_URL || '').replace(/\/$/, '');
  var TKEY = 'tk_account_token';

  function token() { try { return localStorage.getItem(TKEY) || ''; } catch (e) { return ''; } }
  function setToken(t) { try { t ? localStorage.setItem(TKEY, t) : localStorage.removeItem(TKEY); } catch (e) {} }
  function hdrs(json) {
    var h = {};
    if (json) h['Content-Type'] = 'application/json';
    var t = token(); if (t) h['Authorization'] = 'Bearer ' + t;
    return h;
  }
  function call(path, opts) {
    opts = opts || {};
    if (!BASE) return Promise.resolve({ ok: false, status: 0, data: null });
    return fetch(BASE + path, {
      method: opts.method || 'GET',
      headers: hdrs(!!opts.body),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().then(function (j) {
        // A 401 means a stale token — clear it so the UI shows signed-out.
        if (r.status === 401) setToken('');
        return { ok: r.ok && j && j.ok !== false, status: r.status, data: j };
      }).catch(function () { return { ok: false, status: r.status, data: null }; });
    }).catch(function () { return { ok: false, status: 0, data: null }; });
  }

  var api = {
    owner: null,
    isSignedIn: function () { return !!token(); },
    token: token,
    requestCode: function (email, source) { return call('/request-code', { method: 'POST', body: { email: email, source: source || 'site' } }); },
    verifyCode: function (opts) {
      return call('/verify-code', { method: 'POST', body: opts }).then(function (res) {
        if (res.ok && res.data && res.data.token) { setToken(res.data.token); api.owner = res.data.owner || null; updateNav(); }
        return res;
      });
    },
    me: function () { return call('/me').then(function (res) { api.owner = res.ok && res.data ? res.data.owner : null; return res; }); },
    logout: function () { return call('/logout', { method: 'POST' }).then(function (r) { setToken(''); api.owner = null; updateNav(); return r; }); },
    requests: function () { return call('/requests'); },
    wishlist: function () { return call('/wishlist'); },
    wishlistAdd: function (kind, ref, label) { return call('/wishlist', { method: 'POST', body: { kind: kind, ref: ref, label: label } }); },
    wishlistRemove: function (id) { return call('/wishlist', { method: 'POST', body: { remove: true, id: id } }); },
    properties: function () { return call('/properties'); },
    addProperty: function (p) { return call('/properties', { method: 'POST', body: p }); },
    subscribe: function (email, consent, source) { return call('/subscribe', { method: 'POST', body: { email: email, consent: consent !== false, source: source || 'site' } }); }
  };
  // Nav label: any element with [data-tk-account-link] shows "My account" when
  // signed in, "Sign in" when signed out (override via data-tk-in / data-tk-out).
  function updateNav() {
    try {
      var signed = api.isSignedIn();
      var els = document.querySelectorAll('[data-tk-account-link]');
      for (var i = 0; i < els.length; i++) {
        els[i].textContent = signed ? (els[i].getAttribute('data-tk-in') || 'My account') : (els[i].getAttribute('data-tk-out') || 'Sign in');
      }
    } catch (e) {}
  }
  api.updateNav = updateNav;
  window.tkAccount = api;
  window.addEventListener('tk-account-changed', updateNav);

  // Magic-link arrival (?token=… from the sign-in email) → consume it on the
  // account page, then clean the URL and announce the change.
  try {
    var mt = new URLSearchParams(location.search).get('token');
    var onAccount = /(?:^|\/)account(?:\.html)?$/.test(location.pathname);
    if (mt && onAccount) {
      api.verifyCode({ token: mt }).then(function (res) {
        try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
        window.dispatchEvent(new CustomEvent('tk-account-changed', { detail: { signedIn: res.ok } }));
      });
    }
  } catch (e) {}

  // Save-to-wishlist: any [data-tk-save] element with data-tk-kind / data-tk-ref /
  // data-tk-label. If signed out, stash the item and send to sign in, then apply.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-tk-save]') : null;
    if (!el) return;
    e.preventDefault();
    var item = { kind: el.getAttribute('data-tk-kind') || 'style', ref: el.getAttribute('data-tk-ref') || '', label: el.getAttribute('data-tk-label') || '' };
    if (!api.isSignedIn()) { try { localStorage.setItem('tk_pending_save', JSON.stringify(item)); } catch (e2) {} location.href = 'account.html'; return; }
    api.wishlistAdd(item.kind, item.ref, item.label).then(function (r) {
      if (r && r.ok) { try { el.textContent = 'Saved ✓'; el.setAttribute('data-saved', '1'); } catch (e2) {} }
    });
  }, true);

  // Newsletter / offers opt-in: <form data-tk-subscribe> with an email input.
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.hasAttribute || !f.hasAttribute('data-tk-subscribe')) return;
    e.preventDefault();
    var inp = f.querySelector('input[type=email], input[name=email]');
    var email = inp ? inp.value.trim() : '';
    var msg = f.querySelector('[data-tk-subscribe-msg]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (msg) msg.textContent = 'Enter a valid email.'; return; }
    api.subscribe(email, true, f.getAttribute('data-tk-source') || 'footer').then(function (r) {
      if (msg) msg.textContent = r && r.ok ? 'Thanks — check your inbox.' : 'Something went wrong. Try again.';
      if (r && r.ok && inp) { try { inp.value = ''; } catch (e2) {} }
    });
  }, true);

  // After signing in, apply any wishlist item saved while signed out.
  try {
    if (api.isSignedIn()) {
      var pend = localStorage.getItem('tk_pending_save');
      if (pend) { localStorage.removeItem('tk_pending_save'); var it = JSON.parse(pend); if (it && it.ref) api.wishlistAdd(it.kind, it.ref, it.label); }
    }
  } catch (e) {}

  updateNav();
  window.dispatchEvent(new Event('tk-account-ready'));
})();
