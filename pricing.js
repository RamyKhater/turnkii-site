/* Turnkii pricing engine — single source of truth for every live estimate.
   Admin-editable: overrides are stored in localStorage under 'turnkii.pricing'.
   Consumed by: Turnkii v3 (brief rail), Turnkii Pricing Admin, Turnkii Request. */
(function () {
  var KEY = 'turnkii.pricing';

  var DEFAULTS = {
    currency: 'EGP',
    minJob: 280000,
    apr: 18.5,
    downPct: 20,
    saverDiscount: 5,
    spreadFloor: 5,        // ± % at full confidence
    spreadCeiling: 16,     // ± % with almost nothing answered
    multiUnitDiscount: 8,  // % off for 5 units or more
    styleRate: {           // EGP per m², finishing at Signature spec
      warm: 7400, neoclassic: 9600, majlis: 8900, eclectic: 8100, coastal: 6900
    },
    packageFactor: {       // furniture cost as a share of the style rate
      none: 0, essential: 0.24, signature: 0.42, bespoke: 0.62
    },
    serviceRate: {         // EGP per m² added on top
      kitchen: 1150, hvac: 640, shutters: 310, outdoor: 390
    },
    propertyFactor: {      // adjusts the finishing rate by unit type
      'Apartment': 1, 'Villa / townhouse': 1.08, 'Multiple units': 0.94,
      'Short-stay rental': 0.96, 'Commercial / hospitality': 1.12
    },
    serviceWeeks: {
      finishing: 6, furnishing: 3, ffe: 4, kitchen: 3, hvac: 2, shutters: 1, outdoor: 2
    },
    care: {                // post-handover services
      cleaningPerM2: 55,   // EGP per m² per deep clean
      cleaningMin: 1800,   // minimum visit charge
      maintenanceCallout: 750,
      planDiscount: 12     // % off when booked as a yearly plan
    },
    baseWeeks: 3
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function merge(base, over) {
    var out = clone(base);
    Object.keys(over || {}).forEach(function (k) {
      if (out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = Object.assign({}, out[k], over[k]);
      } else { out[k] = over[k]; }
    });
    return out;
  }

  function rates() {
    var over = null;
    try { over = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    return merge(DEFAULTS, over);
  }

  function save(next) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
    window.dispatchEvent(new Event('turnkii-pricing-changed'));
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    window.dispatchEvent(new Event('turnkii-pricing-changed'));
  }

  function isOverridden() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  }

  /* input: { services:[ids], area:Number, units:Number, style:id, pkg:id,
              ptype:String, months:Number, answered:Number, answerTotal:Number } */
  function estimate(input, configOverride) {
    var p = configOverride || rates();
    var i = input || {};
    var area = Number(i.area) > 0 ? Number(i.area) : 0;
    var units = Math.max(1, Number(i.units) || 1);
    var services = i.services && i.services.length ? i.services : [];
    var has = function (id) { return services.indexOf(id) !== -1; };

    var styleRate = p.styleRate[i.style] || p.styleRate.warm;
    var ptypeFactor = p.propertyFactor[i.ptype] || 1;
    var pkgFactor = i.pkg in p.packageFactor ? p.packageFactor[i.pkg] : p.packageFactor.signature;

    var rate = 0, weeks = p.baseWeeks, lines = [];
    function line(label, r) { if (r > 0) { rate += r; lines.push({ label: label, rate: r }); } }

    if (has('finishing')) { line('Finishing', styleRate * ptypeFactor); weeks += p.serviceWeeks.finishing; }
    if (has('furnishing') || has('ffe')) {
      line('Furniture package', styleRate * pkgFactor);
      weeks += has('ffe') ? p.serviceWeeks.ffe : p.serviceWeeks.furnishing;
    }
    ['kitchen', 'hvac', 'shutters', 'outdoor'].forEach(function (k) {
      if (has(k)) { line(labelOf(k), p.serviceRate[k]); weeks += p.serviceWeeks[k]; }
    });
    if (!services.length) { rate = styleRate * 0.35; lines = [{ label: 'Scope to be surveyed', rate: rate }]; }

    var perUnit = Math.max(p.minJob, rate * (area || 0));
    if (!area) perUnit = 0;
    var total = perUnit * units;
    if (units >= 5) total = total * (1 - p.multiUnitDiscount / 100);

    var answered = Number(i.answered) || 0;
    var answerTotal = Math.max(1, Number(i.answerTotal) || 8);
    var confidence = Math.round(40 + (answered / answerTotal) * 54);
    var spread = (p.spreadCeiling - (confidence / 100) * (p.spreadCeiling - p.spreadFloor)) / 100;

    var months = Math.max(6, Number(i.months) || 36);
    var r = p.apr / 100 / 12;
    var financed = total * (1 - p.downPct / 100);
    var monthly = r > 0 ? financed * r / (1 - Math.pow(1 + r, -months)) : financed / months;

    return {
      config: p, ready: total > 0, lines: lines,
      rate: rate, perUnit: perUnit, total: total, units: units,
      lo: total * (1 - spread), hi: total * (1 + spread),
      spreadPct: Math.round(spread * 1000) / 10,
      confidence: confidence, weeks: Math.round(weeks * (0.75 + Math.min(1, (area || 150) / 400) * 0.45)),
      monthly: monthly, down: total * p.downPct / 100,
      saver: total * (1 - p.saverDiscount / 100)
    };
  }

  /* post-handover care quote: { service:'cleaning'|'maintenance', area, plan:'once'|'plan' } */
  function careQuote(input, configOverride) {
    var p = configOverride || rates();
    var c = p.care;
    var i = input || {};
    var area = Number(i.area) > 0 ? Number(i.area) : 0;
    var perVisit = i.service === 'maintenance'
      ? c.maintenanceCallout
      : Math.max(c.cleaningMin, area * c.cleaningPerM2);
    var visits = i.service === 'maintenance' ? 4 : 3;
    var annual = perVisit * visits * (1 - c.planDiscount / 100);
    return {
      ready: i.service === 'maintenance' ? true : area > 0,
      perVisit: perVisit, visits: visits, annual: annual,
      planDiscount: c.planDiscount,
      due: i.plan === 'plan' ? annual : perVisit
    };
  }

  function labelOf(k) {
    return { kitchen: 'Kitchen', hvac: 'HVAC', shutters: 'Shutters & blinds', outdoor: 'Outdoor' }[k] || k;
  }

  function money(n) {
    if (!n) return '—';
    if (n >= 1000000) return 'EGP ' + (n / 1000000).toFixed(n >= 10000000 ? 1 : 2) + 'M';
    return 'EGP ' + Math.round(n / 1000) + 'k';
  }
  function full(n) { return 'EGP ' + Math.round(n || 0).toLocaleString('en-US'); }
  /* one currency prefix for the pair: "EGP 2.15M – 2.40M" */
  function range(lo, hi) {
    if (!lo || !hi) return '—';
    return money(lo) + ' – ' + money(hi).replace(/^EGP\s*/, '');
  }

  window.TurnkiiPricing = {
    DEFAULTS: DEFAULTS, rates: rates, save: save, reset: reset,
    isOverridden: isOverridden, estimate: estimate, careQuote: careQuote, money: money, full: full, range: range, labelOf: labelOf
  };
  window.dispatchEvent(new Event('turnkii-pricing-ready'));
})();
