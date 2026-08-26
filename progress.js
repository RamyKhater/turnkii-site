/* Turnkii progress media store — shared by the client account and the site admin.
   Prototype persistence: localStorage 'turnkii.progress'.
   In production this is the media + approvals API; keep the shapes. */
(function () {
  var KEY = 'turnkii.progress';

  var PROJECTS = [
    { ref: 'TK-2418', title: 'Finishing + full FF&E', property: 'Zed East 704', pm: 'Hoda Mansour' },
    { ref: 'TK-2419', title: 'Kitchen design & build', property: 'Zed East 704', pm: 'Hoda Mansour' },
    { ref: 'TK-2402', title: 'Chalet furnishing package', property: 'Hacienda Bay 12', pm: 'Karim Fahmy' },
    { ref: 'TK-2291', title: 'Villa reception fit-out', property: 'Katameya Villa', pm: 'Karim Fahmy' }
  ];

  var REJECT_REASONS = [
    'Not the agreed finish',
    'Workmanship not acceptable',
    'Wrong item or specification',
    'Damage visible',
    'Work not complete',
    'Does not match the drawing'
  ];

  var RESHOOT_REASONS = [
    'Too dark',
    'Too far away — need a close-up',
    'Too close — need the whole room',
    'Area behind is not shown',
    'Photo is blurred',
    'Send a video walk-through'
  ];

  var LIBRARY = [
    { src: 'assets/style-warm.jpg', label: 'Living room, north wall' },
    { src: 'assets/style-neoclassic.png', label: 'Reception panelling' },
    { src: 'assets/style-majlis.jpg', label: 'Majlis seating' },
    { src: 'assets/style-eclectic.jpg', label: 'Guest bedroom' },
    { src: 'assets/style-coastal.jpg', label: 'Terrace and doors' }
  ];

  function seed() {
    return [
      {
        id: 'u-2418-03', ref: 'TK-2418', stage: 'Week 5 · Joinery and doors', sentAt: '21 Aug 2026',
        milestone: 'Milestone 3 · Joinery and doors', amount: 412000, visit: 'Handover visit, Thu 4 Sep', signoff: null,
        note: 'Wardrobes hung in both bedrooms, doors primed. Handles arrive Sunday.',
        items: [
          { id: 'i1', type: 'photo', src: 'assets/style-warm.jpg', caption: 'Master wardrobe, doors hung', status: 'pending', reason: '', comment: '' },
          { id: 'i2', type: 'photo', src: 'assets/style-eclectic.jpg', caption: 'Second bedroom, primed', status: 'pending', reason: '', comment: '' },
          { id: 'i3', type: 'video', src: 'assets/style-majlis.jpg', caption: 'Walk-through, 0:42', status: 'pending', reason: '', comment: '' }
        ]
      },
      {
        id: 'u-2418-02', ref: 'TK-2418', stage: 'Week 4 · Plaster and paint', sentAt: '14 Aug 2026',
        milestone: 'Milestone 2 · Plaster and paint', amount: 336000, visit: 'Milestone visit, Mon 18 Aug', signoff: null,
        note: 'Two coats on all walls. Ceiling coves complete.',
        items: [
          { id: 'i1', type: 'photo', src: 'assets/style-neoclassic.png', caption: 'Living room, second coat', status: 'accepted', reason: '', comment: '' },
          { id: 'i2', type: 'photo', src: 'assets/style-coastal.jpg', caption: 'Corridor and coves', status: 'reshoot', reason: 'Too dark', comment: 'Can you shoot this with the lights on?' }
        ]
      },
      {
        id: 'u-2418-01', ref: 'TK-2418', stage: 'Week 2 · MEP rough-in', sentAt: '31 Jul 2026',
        milestone: 'Milestone 1 · MEP rough-in', amount: 288000, visit: 'Milestone visit, Tue 5 Aug', signoff: null,
        note: 'Conduits, drainage and AC lines pressure-tested.',
        items: [
          { id: 'i1', type: 'photo', src: 'assets/style-warm.jpg', caption: 'Kitchen wall, first fix', status: 'accepted', reason: '', comment: '' },
          { id: 'i2', type: 'photo', src: 'assets/style-majlis.jpg', caption: 'AC lines, ceiling void', status: 'rejected', reason: 'Does not match the drawing', comment: 'Second outlet is missing on the east wall.' }
        ]
      },
      {
        id: 'u-2402-01', ref: 'TK-2402', stage: 'Sample delivery', sentAt: '18 Aug 2026',
        milestone: 'Milestone 1 · Sample approval', amount: 96000, visit: 'Sample review call, Wed 20 Aug', signoff: null,
        note: 'Fabric and rattan samples photographed in daylight.',
        items: [
          { id: 'i1', type: 'photo', src: 'assets/style-coastal.jpg', caption: 'Bouclé and rattan samples', status: 'pending', reason: '', comment: '' }
        ]
      },
      {
        id: 'u-2291-01', ref: 'TK-2291', stage: 'Handover photography', sentAt: '2 Mar 2026',
        milestone: 'Milestone 5 · Handover', amount: 640000, visit: 'Handover visit, Fri 6 Mar',
        signoff: { ref: 'TK-SO-2291-05', name: 'Ramy Adel', role: 'Owner', at: '3 Mar 2026, 18:42 EET', items: 2, method: 'Account sign-off, verified mobile' },
        note: 'Final set after styling. Snag list closed.',
        items: [
          { id: 'i1', type: 'photo', src: 'assets/style-neoclassic.png', caption: 'Reception, styled', status: 'accepted', reason: '', comment: '' },
          { id: 'i2', type: 'video', src: 'assets/style-warm.jpg', caption: 'Full walk-through, 2:10', status: 'accepted', reason: '', comment: '' }
        ]
      }
    ];
  }

  /* Reads the store and migrates older records forward: stored fields win (they
     hold the client's decisions), missing fields come from the seed counterpart
     by id, then from defaults. `signoff` distinguishes absent (inherit) from
     null (deliberately voided). */
  function list() {
    var stored = null;
    try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!stored || !Array.isArray(stored)) return seed();

    var base = {};
    seed().forEach(function (u) { base[u.id] = u; });

    return stored.map(function (u) {
      var s = base[u.id] || {};
      return Object.assign({}, s, u, {
        milestone: u.milestone || s.milestone || u.stage,
        amount: (u.amount != null ? u.amount : s.amount) || 0,
        visit: u.visit || s.visit || 'the milestone visit',
        signoff: 'signoff' in u ? u.signoff : (s.signoff || null)
      });
    });
  }

  /* Returns false when the write failed (quota) so callers never claim success. */
  function save(next) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) {
      return false;
    }
    window.dispatchEvent(new Event('turnkii-progress-changed'));
    return true;
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    window.dispatchEvent(new Event('turnkii-progress-changed'));
  }

  /* patch one item: mutate(updateId, itemId, { status, reason, comment }) */
  function mutate(updateId, itemId, patch) {
    var next = list().map(function (u) {
      if (u.id !== updateId) return u;
      return Object.assign({}, u, {
        items: u.items.map(function (it) {
          return it.id === itemId ? Object.assign({}, it, patch) : it;
        })
      });
    });
    save(next);
    return next;
  }

  function removeItem(updateId, itemId) {
    var next = list().map(function (u) {
      if (u.id !== updateId) return u;
      return Object.assign({}, u, { items: u.items.filter(function (it) { return it.id !== itemId; }) });
    }).filter(function (u) { return u.items.length > 0; });
    save(next);
    return next;
  }

  function addUpdate(u) {
    return save([u].concat(list()));
  }

  /* an update is signable only when every shared item is accepted */
  function canSign(u) {
    return !!u && !u.signoff && u.items.length > 0 && u.items.every(function (it) { return it.status === 'accepted'; });
  }

  function acceptedCount(u) {
    return u.items.filter(function (it) { return it.status === 'accepted'; }).length;
  }

  /* Records the client's digital acceptance of a milestone. This record is the
     payment-release document: never edit it in place, never delete it — a
     withdrawal is a second, separate record. */
  function sign(updateId, who) {
    var next = list().map(function (u) {
      if (u.id !== updateId || !canSign(u)) return u;
      var d = new Date();
      return Object.assign({}, u, {
        signoff: {
          ref: 'TK-SO-' + u.ref.replace('TK-', '') + '-' + String(u.id).slice(-2),
          name: (who && who.name) || 'Account holder',
          role: (who && who.role) || 'Owner',
          at: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
              d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' EET',
          items: u.items.length,
          method: 'Account sign-off, verified mobile'
        }
      });
    });
    save(next);
    return next;
  }

  function withdrawSignoff(updateId) {
    var next = list().map(function (u) {
      return u.id === updateId ? Object.assign({}, u, { signoff: null }) : u;
    });
    save(next);
    return next;
  }

  function counts(ref) {
    var all = list().filter(function (u) { return !ref || u.ref === ref; });
    var out = { total: 0, pending: 0, accepted: 0, rejected: 0, reshoot: 0, updates: all.length, signed: 0, signable: 0, valueSigned: 0, valueHeld: 0 };
    all.forEach(function (u) {
      u.items.forEach(function (it) { out.total++; out[it.status] = (out[it.status] || 0) + 1; });
      if (u.signoff) { out.signed++; out.valueSigned += u.amount || 0; }
      else {
        out.valueHeld += u.amount || 0;
        if (canSign(u)) out.signable++;
      }
    });
    return out;
  }

  window.TurnkiiProgress = {
    PROJECTS: PROJECTS, REJECT_REASONS: REJECT_REASONS, RESHOOT_REASONS: RESHOOT_REASONS, LIBRARY: LIBRARY,
    list: list, save: save, reset: reset, mutate: mutate, removeItem: removeItem, addUpdate: addUpdate,
    counts: counts, canSign: canSign, acceptedCount: acceptedCount, sign: sign, withdrawSignoff: withdrawSignoff
  };
  window.dispatchEvent(new Event('turnkii-progress-ready'));
})();
