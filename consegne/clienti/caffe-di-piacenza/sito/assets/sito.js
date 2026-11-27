// Aperto o chiuso adesso (ora di Piacenza), il giorno di oggi negli orari, gli appuntamenti già passati.
(function () {
  var H = [[510,780],[450,1200],[450,1200],[450,1200],[450,1200],[450,1200],[450,1200]];
  var NOMI = ["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"];
  function hh(m) { return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function ora() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var v = function (t) { return (p.find(function (x) { return x.type === t; }) || {}).value; };
    return { g: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[v('weekday')], m: (+v('hour') % 24) * 60 + (+v('minute')), data: v('year') + '-' + v('month') + '-' + v('day') };
  }
  function stato(o) {
    var x = H[o.g];
    if (x && o.m >= x[0] && o.m < x[1]) return { aperto: true, testo: 'Aperto ora · chiude alle ' + hh(x[1]) };
    if (x && o.m < x[0]) return { aperto: false, testo: 'Chiuso · apre alle ' + hh(x[0]) };
    for (var i = 1; i < 8; i++) { var d = (o.g + i) % 7; if (H[d]) return { aperto: false, testo: 'Chiuso · apre ' + (i === 1 ? 'domani' : NOMI[d].toLowerCase()) + ' alle ' + hh(H[d][0]) }; }
    return { aperto: false, testo: 'Orari in verifica' };
  }
  function via() {
    var o = ora(), s = stato(o);
    document.querySelectorAll('[data-stato]').forEach(function (el) { el.textContent = s.testo; });
    document.querySelectorAll('.dot').forEach(function (el) { el.classList.toggle('off', !s.aperto); });
    document.querySelectorAll('.hours tr[data-giorno]').forEach(function (tr) {
      var oggi = +tr.getAttribute('data-giorno') === o.g;
      tr.classList.toggle('today', oggi);
      var th = tr.querySelector('th');
      if (oggi && th && th.textContent.indexOf('(oggi)') < 0) th.textContent += ' (oggi)';
    });
    document.querySelectorAll('[data-calendario] li[data-data]').forEach(function (li) { if (li.getAttribute('data-data') < o.data) li.classList.add('passato'); });
    var pr = document.querySelector('[data-prossimi]');
    if (pr) {
      var n = 0;
      pr.querySelectorAll('li[data-data]').forEach(function (li) { var tieni = li.getAttribute('data-data') >= o.data && n < 3; if (tieni) n++; li.hidden = !tieni; });
      if (!n) { pr.parentNode.hidden = true; }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', via); else via();
})();
