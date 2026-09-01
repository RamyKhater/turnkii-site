/* Turnkii month-calendar helper — a tiny, dependency-free date-grid builder
   shared by every care/maintenance booking flow (window.TurnkiiCal). It returns
   a full-month matrix of cells; each page styles the cells + binds selection. */
(function () {
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); }

  // build(offset, selectedId, opts)
  //   offset      — months from the current month (0 = this month)
  //   selectedId  — the chosen day's id ("YYYY-MM-DD"), for highlighting
  //   opts.maxOffset  — furthest month you can page to (default 4)
  //   opts.closedDows — array of closed weekday numbers (default [5] = Friday)
  function build(offset, selectedId, opts) {
    opts = opts || {};
    offset = offset || 0;
    var maxOffset = opts.maxOffset != null ? opts.maxOffset : 4;
    var closed = opts.closedDows || [5];
    var base = new Date();
    var todayId = ymd(base);
    var view = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    var y = view.getFullYear(), m = view.getMonth();
    var startDow = new Date(y, m, 1).getDay();
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    var cells = [];
    var i;
    for (i = 0; i < startDow; i++) cells.push({ blank: true });
    for (var d = 1; d <= daysInMonth; d++) {
      var dt = new Date(y, m, d);
      var id = ymd(dt);
      var isClosed = closed.indexOf(dt.getDay()) !== -1;
      cells.push({
        blank: false, id: id, day: d, dow: dt.getDay(),
        long: WEEKDAYS[dt.getDay()] + ' ' + d + ' ' + MONTHS[m].slice(0, 3),
        disabled: (id < todayId) || isClosed,
        selected: !!selectedId && id === selectedId,
        today: id === todayId
      });
    }
    while (cells.length % 7 !== 0) cells.push({ blank: true });

    return {
      title: MONTHS[m] + ' ' + y,
      weekdays: WEEKDAYS.slice(),
      cells: cells,
      prevDisabled: offset <= 0,
      nextDisabled: offset >= maxOffset
    };
  }

  window.TurnkiiCal = { build: build };
})();
