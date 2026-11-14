/* Bar Piacenza — logica del sito. Script classico (niente moduli: deve girare anche da file://).
   Le funzioni pure stanno in BP.orari e BP.util e sono provate da tools/test-orari.mjs. */
(() => {
  'use strict';
  const BP = (window.BP = window.BP || {});

  /* ───────────── Funzioni pure: date, orari, testi ───────────── */
  const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const DAY = 864e5;
  const formatori = {};

  // Data e ora "da orologio" nel fuso del locale, qualunque sia il fuso di chi visita.
  // giorno = numero del giorno dal 1/1/1970, min = minuti dalla mezzanotte.
  function oraLocale(istante, fuso) {
    const f = formatori[fuso] || (formatori[fuso] = new Intl.DateTimeFormat('en-GB', {
      timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }));
    const v = {};
    f.formatToParts(istante).forEach((p) => { v[p.type] = p.value; });
    return { giorno: Date.UTC(+v.year, v.month - 1, +v.day) / DAY, min: (v.hour % 24) * 60 + +v.minute };
  }
  const data = (n) => new Date(n * DAY);
  const iso = (n) => data(n).toISOString().slice(0, 10);
  const numeroDa = (s) => Date.UTC(+s.slice(0, 4), s.slice(5, 7) - 1, +s.slice(8, 10)) / DAY;
  const settimana = (n) => data(n).getUTCDay();
  const minuti = (s) => s.slice(0, 2) * 60 + +s.slice(3, 5);
  const orario = (s) => s.replace(/^0(\d)/, '$1'); // '06:30' → '6:30'
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };
  const maiusc = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const plurale = (n) => (n === 1 ? '1 minuto' : `${n} minuti`);
  const dataLunga = (n) => { const d = data(n); return `${GIORNI[d.getUTCDay()]} ${d.getUTCDate()} ${MESI[d.getUTCMonth()]}`; };
  const dataBreve = (n) => { const d = data(n); return `${d.getUTCDate()} ${MESI[d.getUTCMonth()]}`; };

  // Le fasce di un giorno: eccezione > ferie > settimana tipo.
  function fasceDelGiorno(n, orari) {
    const g = iso(n);
    const ecc = (orari.eccezioni || []).find((e) => e.data === g);
    if (ecc) return { fasce: ecc.fasce, nota: ecc.nota, speciale: true };
    const ferie = (orari.ferie || []).find((f) => g >= f.dal && g <= f.al);
    if (ferie) return { fasce: [], nota: ferie.nota, speciale: true };
    return { fasce: orari.settimana[settimana(n)] || [], speciale: false };
  }

  // Intervalli di apertura in minuti dalla mezzanotte di "oggi" (ieri incluso, per le fasce
  // che passano la mezzanotte). Fasce contigue o sovrapposte vengono unite.
  function intervalli(oggi, giorni, orari) {
    const lista = [];
    for (let k = -1; k <= giorni; k++) {
      fasceDelGiorno(oggi + k, orari).fasce.forEach(([a, b]) => {
        const da = k * 1440 + minuti(a);
        let fine = k * 1440 + minuti(b);
        if (fine <= da) fine += 1440;
        lista.push({ da, a: fine });
      });
    }
    lista.sort((x, y) => x.da - y.da);
    return lista.reduce((uniti, i) => {
      const u = uniti[uniti.length - 1];
      if (u && i.da <= u.a) u.a = Math.max(u.a, i.a);
      else uniti.push({ ...i });
      return uniti;
    }, []);
  }

  const momento = (oggi, ass) => { const k = Math.floor(ass / 1440); return { giorno: oggi + k, delta: k, min: ass - k * 1440 }; };

  // Stato in un istante: aperto? fra quanto cambia? nota del giorno (eccezione o ferie).
  function stato(istante, orari) {
    const L = oraLocale(istante, orari.fuso);
    const iv = intervalli(L.giorno, 70, orari);
    const nota = fasceDelGiorno(L.giorno, orari).nota || null;
    const dentro = iv.find((i) => L.min >= i.da && L.min < i.a);
    if (dentro) return { aperto: true, tra: dentro.a - L.min, quando: momento(L.giorno, dentro.a), nota };
    const dopo = iv.find((i) => i.da > L.min);
    return { aperto: false, tra: dopo ? dopo.da - L.min : null, quando: dopo ? momento(L.giorno, dopo.da) : null, nota };
  }

  function quandoTesto(q, chiusura) {
    const ora = hhmm(q.min);
    if (chiusura && q.delta === 1 && q.min === 0) return 'a mezzanotte';
    if (q.delta === 0 || (chiusura && q.delta === 1 && q.min < 360)) return `alle ${ora}`;
    if (q.delta === 1) return `domani alle ${ora}`;
    const d = data(q.giorno), g = GIORNI[d.getUTCDay()];
    return q.delta < 7 ? `${g} alle ${ora}` : `${dataLunga(q.giorno)} alle ${ora}`;
  }

  // Il testo del cartello. tipo: aperto | presto | chiuso.
  function testoStato(s) {
    let t;
    if (s.aperto) {
      t = s.tra <= 30
        ? { tipo: 'presto', titolo: 'Aperto ora', dettaglio: `chiude tra ${plurale(s.tra)}` }
        : { tipo: 'aperto', titolo: 'Aperto ora', dettaglio: `chiude ${quandoTesto(s.quando, true)}` };
    } else if (s.tra !== null && s.tra <= 60) {
      t = { tipo: 'presto', titolo: `Apre tra ${plurale(s.tra)}`, dettaglio: `alle ${hhmm(s.quando.min)}` };
    } else {
      t = { tipo: 'chiuso', titolo: 'Chiuso', dettaglio: s.quando ? `apre ${quandoTesto(s.quando, false)}` : '' };
    }
    t.nota = s.nota ? `Oggi: ${s.nota}` : '';
    t.frase = t.titolo + (t.dettaglio ? `, ${t.dettaglio}` : '');
    return t;
  }

  const fasceTesto = (f) => (f && f.length ? f.map(([a, b]) => `${orario(a)}–${orario(b)}`).join(', ') : 'chiuso');

  // ["Lun–ven 6:30–20:00", "Sab 7:00–23:00", "Dom chiuso"]
  function sintesiOrari(sett) {
    const gruppi = [];
    [1, 2, 3, 4, 5, 6, 0].forEach((g) => {
      const testo = fasceTesto(sett[g]), u = gruppi[gruppi.length - 1];
      if (u && u.testo === testo) u.a = g; else gruppi.push({ da: g, a: g, testo });
    });
    return gruppi.map((x) => `${maiusc(BREVI[x.da] + (x.a !== x.da ? `–${BREVI[x.a]}` : ''))} ${x.testo}`);
  }

  // Eccezioni e ferie da oggi ai prossimi `giorni`.
  function speciali(oggi, giorni, orari) {
    const fine = oggi + giorni, out = [];
    (orari.eccezioni || []).forEach((e) => {
      const n = numeroDa(e.data);
      if (n >= oggi && n <= fine) out.push({ n, testo: `${dataLunga(n)}, ${e.nota}`, orari: fasceTesto(e.fasce), oggi: n === oggi });
    });
    (orari.ferie || []).forEach((f) => {
      const da = numeroDa(f.dal), a = numeroDa(f.al);
      if (a >= oggi && da <= fine) out.push({ n: da, testo: `dal ${dataBreve(da)} al ${dataBreve(a)}, ${f.nota}`, orari: 'chiuso', oggi: da <= oggi });
    });
    return out.sort((x, y) => x.n - y.n);
  }

  // Eventi: orari "da orologio" del locale, confrontati come testo AAAA-MM-GGTHH:MM.
  const due = (n) => String(n).padStart(2, '0');
  const adessoTesto = (ist, fuso) => { const L = oraLocale(ist, fuso); return `${iso(L.giorno)}T${due(Math.floor(L.min / 60))}:${due(L.min % 60)}`; };
  const piuOre = (s, ore) => new Date(Date.UTC(+s.slice(0, 4), s.slice(5, 7) - 1, +s.slice(8, 10), +s.slice(11, 13) + ore, +s.slice(14, 16))).toISOString().slice(0, 16);
  const eventiFuturi = (lista, ist, fuso) => {
    const ora = adessoTesto(ist, fuso);
    return (lista || []).filter((e) => (e.fine || piuOre(e.inizio, 2)) > ora).sort((x, y) => (x.inizio < y.inizio ? -1 : 1));
  };
  // Date relative per l'anteprima: '+3T19:00' = fra tre giorni alle 19:00.
  function risolviRelative(lista, ist, fuso) {
    const oggi = oraLocale(ist, fuso).giorno;
    const r = (s) => { const m = /^\+(\d+)T(.*)$/.exec(s || ''); return m ? `${iso(oggi + +m[1])}T${m[2]}` : s; };
    return (lista || []).map((e) => ({ ...e, inizio: r(e.inizio), fine: r(e.fine) }));
  }

  // File .ics (RFC 5545) con il fuso Europe/Rome.
  function ics(ev, luogo, adessoUtc) {
    const t = (s) => `${s.replace(/[-:]/g, '')}00`;
    const e = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
    const uid = `${t(ev.inizio)}-${ev.titolo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}@bar-piacenza`;
    const righe = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bar Piacenza//Sito//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:Europe/Rome',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0100', 'TZOFFSETTO:+0200', 'TZNAME:CEST', 'DTSTART:19700329T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0100', 'TZNAME:CET', 'DTSTART:19701025T030000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
      'END:VTIMEZONE', 'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${adessoUtc}`,
      `DTSTART;TZID=Europe/Rome:${t(ev.inizio)}`, `DTEND;TZID=Europe/Rome:${t(ev.fine || piuOre(ev.inizio, 2))}`,
      `SUMMARY:${e(`${ev.titolo} al Bar Piacenza`)}`, `DESCRIPTION:${e(ev.testo)}`, `LOCATION:${e(luogo)}`,
      'END:VEVENT', 'END:VCALENDAR'];
    // Righe piegate a 60 caratteri: sotto i 75 byte anche con le lettere accentate.
    return righe.map((r) => {
      let out = r.slice(0, 60);
      for (let i = 60; i < r.length; i += 59) out += `\r\n ${r.slice(i, i + 59)}`;
      return out;
    }).join('\r\n') + '\r\n';
  }

  // Modulo di prenotazione: ritorna { campo: 'messaggio' } per ogni errore.
  function validaPrenotazione(v, istante, orari) {
    const err = {}, L = oraLocale(istante, orari.fuso);
    if (v.nome.trim().length < 2) err.nome = 'Scrivi il tuo nome.';
    else if (v.nome.length > 60) err.nome = 'Il nome può avere al massimo 60 caratteri.';
    let g = null, info = null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.giorno)) err.giorno = 'Scegli il giorno.';
    else {
      g = numeroDa(v.giorno); info = fasceDelGiorno(g, orari);
      if (g < L.giorno) err.giorno = 'Scegli un giorno da oggi in poi.';
      else if (g > L.giorno + 90) err.giorno = 'Si può prenotare fino a tre mesi da oggi.';
      else if (!info.fasce.length) err.giorno = `${maiusc(dataLunga(g))} siamo chiusi${info.nota ? ` (${info.nota})` : ''}: scegli un altro giorno.`;
    }
    if (!/^\d{2}:\d{2}$/.test(v.ora)) err.ora = 'Scegli l’ora.';
    else if (g !== null && !err.giorno) {
      const m = minuti(v.ora);
      const ok = info.fasce.some(([a, b]) => { const da = minuti(a), fi = minuti(b); return fi <= da ? m >= da || m < fi : m >= da && m < fi; });
      if (!ok) err.ora = `A quell’ora siamo chiusi: ${dataLunga(g)} siamo aperti ${fasceTesto(info.fasce).replace(/(\d+:\d+)–(\d+:\d+)/g, 'dalle $1 alle $2')}.`;
      else if (g === L.giorno && m <= L.min) err.ora = 'Quest’ora è già passata: scegli un orario più avanti.';
    }
    const p = String(v.persone).trim();
    if (!/^\d+$/.test(p) || +p < 1 || +p > 20) err.persone = 'Scrivi un numero di persone tra 1 e 20.';
    if (v.note.length > 300) err.note = 'Le note possono avere al massimo 300 caratteri.';
    return err;
  }

  function messaggioPrenotazione(v, nome) {
    const r = [`Ciao, vorrei prenotare un tavolo al ${nome}.`, `Nome: ${v.nome.trim()}`, `Giorno: ${dataLunga(numeroDa(v.giorno))}`,
      `Ora: ${orario(v.ora)}`, `Persone: ${String(v.persone).trim()}`];
    if (v.note.trim()) r.push(`Note: ${v.note.trim()}`);
    return r.join('\n');
  }

  const indirizzoCompleto = ({ indirizzo: i }) => `${i.via}, ${i.cap} ${i.citta} ${i.provincia}`;
  function link(L) {
    const enc = encodeURIComponent, dove = enc(`${L.nome}, ${indirizzoCompleto(L)}`), s = L.social;
    return {
      tel: `tel:${L.telefono.e164}`,
      wa: L.whatsapp ? `https://wa.me/${L.whatsapp}` : null,
      mail: `mailto:${L.email}`,
      indicazioni: `https://www.google.com/maps/dir/?api=1&destination=${dove}`,
      gmaps: `https://www.google.com/maps/search/?api=1&query=${dove}`,
      amaps: `https://maps.apple.com/?q=${enc(L.nome)}&address=${enc(indirizzoCompleto(L))}&ll=${L.geo.lat},${L.geo.lng}`,
      embed: `https://maps.google.com/maps?q=${dove}&z=17&output=embed`,
      instagram: s.instagram && s.instagram.url, facebook: s.facebook && s.facebook.url, tiktok: s.tiktok && s.tiktok.url
    };
  }

  // Modelli HTML puri: li usa il browser e li usa tools/sincronizza.mjs per scrivere le pagine statiche.
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const icona = (id) => `<svg class="icona" aria-hidden="true" focusable="false"><use href="#i-${id}"/></svg>`;
  const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
  function foto(base, alt, w, h, sizes, subito) {
    const set = (ext) => [480, 960, 1600].map((x) => `assets/img/${base}-${x}.${ext} ${x}w`).join(', ');
    return `<picture><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
      `<img src="assets/img/${base}-960.jpg" srcset="${set('jpg')}" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${subito ? '' : ' loading="lazy" decoding="async"'}></picture>`;
  }
  const H = {
    giornata: (D) => (D.giornata || []).map((g) => `<li class="giornata__voce"><p class="giornata__ora">${esc(g.ora)}</p><h3>${esc(g.titolo)}</h3><p>${esc(g.testo)}</p></li>`).join(''),
    prodotti: (D) => (D.prodottiFirma || []).map((p, i) => {
      const sizes = i ? '(min-width: 60rem) 17rem, (min-width: 36rem) 45vw, 46vw' : '(min-width: 60rem) 36rem, (min-width: 36rem) 45vw, 92vw';
      return `<li class="vetrina__voce"><article class="prodotto"><div class="foto">${foto(p.img, p.alt, 1600, 1600, sizes)}</div>` +
        `<div><h3>${esc(p.nome)}</h3><p>${esc(p.testo)}</p>${p.prezzo ? `<p class="prodotto__prezzo">${euro.format(p.prezzo)}</p>` : ''}</div></article></li>`;
    }).join(''),
    galleria: (D) => (D.galleria || []).map((f, i) => `<li><button class="galleria__apri" type="button" data-i="${i}" aria-label="Ingrandisci: ${esc(f.alt)}">${foto(f.img, '', f.w, f.h, '(min-width: 48rem) 33vw, 50vw')}</button></li>`).join(''),
    orari: (sett) => [1, 2, 3, 4, 5, 6, 0].map((g) => `<tr data-g="${g}"><th scope="row">${maiusc(GIORNI[g])}</th><td>${maiusc(fasceTesto(sett[g]))}</td></tr>`).join(''),
    sintesi: (sett) => sintesiOrari(sett).map((r) => `<li>${esc(r)}</li>`).join(''),
    social: (s) => ['instagram', 'facebook', 'tiktok'].filter((k) => s[k]).map((k) =>
      `<li><a href="${esc(s[k].url)}" rel="noopener">${icona(k)}${esc(k === 'instagram' ? `Instagram ${s[k].nome}` : s[k].nome)}</a></li>`).join(''),
    categorie: (D) => D.menu.map((c) => `<li><a class="chip" href="#${c.id}">${esc(c.nome)}</a></li>`).join(''),
    allergeni: (D) => D.allergeni.map((n) => `<li>${esc(n)}</li>`).join(''),
    filtri: (D) => Object.keys(D.etichette).map((t) => `<button class="chip" type="button" aria-pressed="false" data-tag="${t}">${icona('spunta')}${esc(D.etichette[t])}</button>`).join(''),
    esito: (D) => `Tutte le ${D.menu.reduce((n, c) => n + c.voci.length, 0)} voci.`,
    menu(D) {
      const nomi = D.allergeni, et = D.etichette, chiavi = Object.keys(et);
      const ha = (v, t) => v.tag.includes(t) || (t === 'veg' && v.tag.includes('vegan'));
      const voce = (v) => {
        const tag = v.tag.length ? `<ul class="etichette" role="list">${v.tag.map((t) => `<li class="etichetta">${icona(t === 'sg' ? 'spiga' : 'foglia')}${esc(et[t])}</li>`).join('')}</ul>` : '';
        const all = v.all.length ? `<p class="voce__allergeni"><span aria-hidden="true">Allergeni: ${v.all.join(', ')}</span><span class="vh">Allergeni: ${v.all.map((n) => nomi[n - 1].toLowerCase()).join(', ')}</span></p>` : '';
        return `<li class="voce" data-tag="${chiavi.filter((t) => ha(v, t)).join(' ')}"><div class="voce__riga"><h3 class="voce__nome">${esc(v.nome)}</h3><span class="voce__punti" aria-hidden="true"></span><span class="voce__prezzo">${euro.format(v.prezzo)}</span></div>` +
          (v.testo ? `<p class="voce__testo">${esc(v.testo)}</p>` : '') + (tag || all ? `<div class="voce__info">${tag}${all}</div>` : '') + '</li>';
      };
      return D.menu.map((c) => `<section class="listino__sezione" id="${c.id}" aria-labelledby="t-${c.id}"><h2 id="t-${c.id}">${esc(c.nome)}</h2><ul class="voci" role="list">${c.voci.map(voce).join('')}</ul></section>`).join('') +
        '<p class="menu-vuoto" hidden>Nessuna voce con questi filtri. Togli un filtro per vedere tutto il menu.</p>';
    }
  };

  BP.orari = { oraLocale, fasceDelGiorno, intervalli, stato, testoStato, sintesiOrari, fasceTesto, speciali };
  // Impronta di un blocco HTML (FNV-1a): tools/sincronizza.mjs la scrive nel commento <!-- bp:nome #impronta -->.
  const firma = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
  BP.util = { eventiFuturi, risolviRelative, ics, validaPrenotazione, messaggioPrenotazione, link, indirizzoCompleto, firma };
  BP.html = H;

  if (typeof document === 'undefined' || !BP.data) return;

  /* ───────────── Interfaccia ───────────── */
  const D = BP.data, L = D.locale, U = link(L), O = D.orari;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const ridotto = matchMedia('(prefers-reduced-motion: reduce)');
  const oggiN = () => oraLocale(new Date(), O.fuso).giorno;
  // Riempie un contenitore, ma salta il lavoro se l'HTML statico è già uguale ai dati (stessa impronta).
  const riempi = (el, nome, html) => {
    const c = el.firstChild;
    if (!(c && c.nodeType === 8 && c.data === ` bp:${nome} #${firma(html)} `)) el.innerHTML = html;
    return el;
  };
  const render = (nome, html) => { const el = $(`[data-render="${nome}"]`); return el && riempi(el, nome, html); };

  // Link e testi presi da site-data.js (l'HTML statico ne tiene una copia per chi non ha JS).
  function collega() {
    const i = L.indirizzo, testi = {
      telefono: L.telefono.testo, email: L.email, via: i.via, 'cap-citta': `${i.cap} ${i.citta} ${i.provincia}`,
      'indirizzo-breve': `${i.via}, ${i.zona}`, zona: `${maiusc(i.zona)}.`, instagram: L.social.instagram ? L.social.instagram.nome : '',
      ragione: L.ragioneSociale, piva: L.partitaIva, agenzia: L.agenzia.nome, anno: String(new Date().getFullYear()),
      parcheggio: L.parcheggio, mezzi: L.mezzi
    };
    $$('[data-bp]').forEach((el) => { const u = U[el.dataset.bp]; if (u) el.href = u; else el.hidden = true; });
    $$('[data-se-no-wa]').forEach((el) => { el.hidden = !!L.whatsapp; });
    $$('[data-bp-testo]').forEach((el) => { const t = testi[el.dataset.bpTesto]; if (t != null) el.textContent = t; });
    $$('[data-render="sintesi"]').forEach((el) => riempi(el, 'sintesi', H.sintesi(O.settimana)));
  }

  function statoLive() {
    const cartello = $('#stato'), insegna = $('#insegna');
    let ultimo = '', primo = true;
    const aggiorna = () => {
      const s = stato(new Date(), O), t = testoStato(s);
      if (insegna) insegna.dataset.luce = s.aperto ? 'accesa' : 'spenta';
      if (t.frase + t.nota !== ultimo) {
        ultimo = t.frase + t.nota;
        if (cartello) {
          cartello.dataset.stato = t.tipo;
          $('.cartello__testo', cartello).innerHTML = `<span class="cartello__titolo">${esc(t.titolo)}${t.dettaglio ? ',' : ''}</span>${esc(t.dettaglio)}` +
            (t.nota ? `<span class="cartello__nota">${esc(t.nota)}</span>` : '');
        }
        $$('[data-stato-testo]').forEach((el) => { el.textContent = `${t.frase}.`; });
        evidenziaOggi();
      }
      if (primo && cartello) { cartello.classList.add('is-appena'); primo = false; }
    };
    aggiorna();
    setTimeout(() => { aggiorna(); setInterval(aggiorna, 6e4); }, 6e4 - (Date.now() % 6e4) + 50);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) aggiorna(); });
  }

  function tabellaOrari() {
    render('orari', H.orari(O.settimana));
    const lista = speciali(oggiN(), 45, O), box = $('[data-speciali]');
    if (!box) return;
    box.hidden = !lista.length;
    render('speciali', lista.map((x) => `<li><span>${esc(maiusc(x.testo))}${x.oggi ? ' <strong>(oggi)</strong>' : ''}</span><span>${esc(maiusc(x.orari))}</span></li>`).join(''));
  }
  function evidenziaOggi() {
    const g = settimana(oggiN());
    $$('[data-render="orari"] tr').forEach((tr) => {
      const si = +tr.dataset.g === g, th = tr.firstElementChild, et = $('.orari__oggi', th);
      tr.classList.toggle('is-oggi', si);
      if (si) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
      if (si && !et) th.insertAdjacentHTML('beforeend', ' <span class="orari__oggi">oggi</span>');
      if (!si && et) et.remove();
    });
  }

  function navigazione() {
    const bottone = $('.testata__apri'), nav = $('#nav');
    if (!bottone || !nav) return;
    const fuori = () => $$('main, .piede, .barra-azioni, .testata__marchio, .testata__chiama, .salta');
    const focabili = () => [...$$('a[href], button:not([disabled])', nav), bottone];
    const tasti = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); chiudi(true); return; }
      if (e.key !== 'Tab') return;
      const f = focabili(), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };
    const segna = (aperta) => {
      nav.classList.toggle('is-aperta', aperta);
      bottone.setAttribute('aria-expanded', String(aperta));
      bottone.setAttribute('aria-label', aperta ? 'Chiudi la navigazione' : 'Apri la navigazione');
      document.documentElement.classList.toggle('nav-aperta', aperta);
      fuori().forEach((el) => { el.inert = aperta; });
      document[aperta ? 'addEventListener' : 'removeEventListener']('keydown', tasti);
    };
    function chiudi(ridai) { if (!nav.classList.contains('is-aperta')) return; segna(false); if (ridai) bottone.focus(); }
    bottone.addEventListener('click', () => {
      if (nav.classList.contains('is-aperta')) chiudi(true);
      else { segna(true); const a = $('a', nav); if (a) a.focus(); }
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) chiudi(false); });
    matchMedia('(min-width: 60rem)').addEventListener('change', (e) => { if (e.matches) chiudi(false); });
  }

  // Header che si compatta e voce di navigazione della sezione visibile (niente scroll handler).
  function osservatori() {
    const testata = $('.testata'), insegna = $('#insegna');
    if (!('IntersectionObserver' in window)) { if (testata) testata.classList.add('is-compatta'); return; }
    if (testata && insegna) {
      new IntersectionObserver(([v]) => testata.classList.toggle('is-compatta', !v.isIntersecting), { rootMargin: '-72px 0px 0px 0px' }).observe(insegna);
    }
    const voci = $$('.nav__lista a[href^="#"]');
    const attiva = (id) => voci.forEach((a) => { if (a.hash === `#${id}`) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    const io = new IntersectionObserver((v) => v.forEach((x) => { if (x.isIntersecting) attiva(x.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    voci.forEach((a) => { const s = document.getElementById(a.hash.slice(1)); if (s) io.observe(s); });
    const hero = $('.hero');
    if (hero && voci.length) new IntersectionObserver(([v]) => { if (v.isIntersecting) attiva(''); }, { rootMargin: '0px 0px -60% 0px' }).observe(hero);
  }

  function video() {
    const v = D.video, box = $('.hero__media');
    if (!v || !v.attivo || !box || ridotto.matches || (navigator.connection && navigator.connection.saveData)) return;
    const el = document.createElement('video'), b = document.createElement('button');
    Object.assign(el, { muted: true, loop: true, autoplay: true, playsInline: true, poster: v.poster });
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = 'position:absolute;inset:0';
    el.innerHTML = `<source src="${v.webm}" type="video/webm"><source src="${v.mp4}" type="video/mp4">`;
    b.type = 'button'; b.className = 'hero__pausa';
    const disegna = () => { b.innerHTML = el.paused ? `${icona('play')}<span>Riprendi il video</span>` : `${icona('pausa')}<span>Metti in pausa il video</span>`; };
    b.addEventListener('click', () => (el.paused ? el.play() : el.pause()));
    el.addEventListener('play', disegna); el.addEventListener('pause', disegna);
    box.append(el, b); disegna();
  }

  const giornata = () => render('giornata', H.giornata(D));
  const prodotti = () => render('prodotti', H.prodotti(D));

  function eventi() {
    const box = $('[data-render="eventi"]');
    if (!box) return;
    const anteprima = /[?&]anteprima=eventi(&|$)/.test(location.search), adesso = new Date();
    const lista = eventiFuturi(anteprima ? risolviRelative(D.eventiAnteprima, adesso, O.fuso) : D.eventi, adesso, O.fuso);
    if (!lista.length) {
      box.innerHTML = `<div class="vuoto">${icona('calendario')}<div><p>Nessuna serata in calendario: le nuove date escono prima su Instagram.</p>` +
        (U.instagram ? `<a class="pulsante pulsante--secondario" href="${esc(U.instagram)}" rel="noopener">${icona('instagram')}Segui ${esc(L.social.instagram.nome)} su Instagram</a>` : '') + '</div></div>';
      return;
    }
    box.innerHTML = (anteprima ? '<p class="evento__esempio">Anteprima: serate d’esempio, non in programma.</p>' : '') +
      '<ul class="eventi" role="list">' + lista.map((e, i) => {
        const n = numeroDa(e.inizio), d = data(n), ore = orario(e.inizio.slice(11)) + (e.fine ? `–${orario(e.fine.slice(11))}` : '');
        return `<li class="evento"><article class="evento__corpo" aria-labelledby="ev-${i}">` +
          `<p class="evento__data" aria-hidden="true"><span class="evento__mese">${MESI[d.getUTCMonth()]}</span><span class="evento__giorno">${d.getUTCDate()}</span><span class="evento__settimana">${GIORNI[d.getUTCDay()]}</span></p>` +
          `<div class="evento__testo"><h3 id="ev-${i}">${esc(e.titolo)}</h3><p class="evento__ora"><time datetime="${e.inizio}">${maiusc(dataLunga(n))}, ${ore}</time></p>${e.testo ? `<p>${esc(e.testo)}</p>` : ''}</div>` +
          `<button class="pulsante pulsante--secondario pulsante--piccolo" type="button" data-ics="${i}">${icona('calendario')}Aggiungi al calendario</button></article></li>`;
      }).join('') + '</ul>';
    box.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-ics]');
      if (!b) return;
      const e = lista[+b.dataset.ics], a = document.createElement('a');
      const testo = ics(e, `${L.nome}, ${indirizzoCompleto(L)}`, `${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`);
      a.href = URL.createObjectURL(new Blob([testo], { type: 'text/calendar;charset=utf-8' }));
      a.download = `bar-piacenza-${e.inizio.slice(0, 10)}.ics`;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
  }

  function galleria() {
    const ul = $('[data-render="galleria"]'), dlg = $('#lightbox'), lista = D.galleria || [], n = lista.length;
    if (!ul || !n) return;
    let ora = 0, origine = null, x0 = null;
    riempi(ul, 'galleria', H.galleria(D));
    if (!dlg || typeof dlg.showModal !== 'function') return;
    const scena = $('.lightbox__scena', dlg);
    const mostra = (i) => {
      ora = (i + n) % n;
      const f = lista[ora];
      scena.innerHTML = foto(f.img, f.alt, f.w, f.h, '100vw', true);
      $('.lightbox__conta', dlg).textContent = `${ora + 1} di ${n}`;
      $('.lightbox__didascalia', dlg).textContent = f.alt;
    };
    ul.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (!b) return;
      origine = b; mostra(+b.dataset.i); dlg.showModal();
      document.documentElement.classList.add('nav-aperta');
      $('[data-azione="chiudi"]', dlg).focus();
    });
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-azione]');
      if (!b) return;
      if (b.dataset.azione === 'chiudi') dlg.close(); else mostra(ora + (b.dataset.azione === 'succ' ? 1 : -1));
    });
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); mostra(ora + (e.key === 'ArrowRight' ? 1 : -1)); }
    });
    dlg.addEventListener('close', () => { document.documentElement.classList.remove('nav-aperta'); if (origine) origine.focus(); });
    scena.addEventListener('pointerdown', (e) => { x0 = e.clientX; }, { passive: true });
    scena.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) mostra(ora + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function recensioni() {
    const r = D.recensioni || {};
    if (!r.showReviews || !r.voci || !r.voci.length) return; // resta il link statico a Google
    render('recensioni', '<ul class="recensioni__lista" role="list">' + r.voci.map((v) => {
      const s = Math.max(0, Math.min(5, Math.round(v.stelle)));
      return `<li><figure class="recensione"><p class="recensione__stelle" role="img" aria-label="${s} stelle su 5">${icona('stella').repeat(s)}</p>` +
        `<blockquote><p>${esc(v.testo)}</p></blockquote><figcaption>${esc(v.nome)}${v.data ? `, ${esc(v.data)}` : ''}</figcaption></figure></li>`;
    }).join('') + `</ul><p class="mt-5"><a class="pulsante pulsante--secondario" href="${esc(U.gmaps)}" rel="noopener">Leggi le recensioni su Google</a></p>`);
  }

  function mappa() {
    const b = $('.mappa__facciata');
    if (!b) return;
    b.addEventListener('click', () => {
      const f = document.createElement('iframe');
      Object.assign(f, { src: U.embed, title: `Mappa di Google con la posizione del ${L.nome}`, referrerPolicy: 'no-referrer-when-downgrade', allowFullscreen: true });
      b.parentNode.append(f);
      b.remove();
      const d = $('.mappa__disegno'); if (d) d.remove();
      f.focus();
    });
  }

  function modulo() {
    const f = $('#modulo-prenota');
    if (!f) return;
    if (!D.prenotazioni) { f.hidden = true; return; }
    if (!L.whatsapp) $('.modulo__invio span', f).textContent = 'Scrivici un’email';
    const campi = ['nome', 'giorno', 'ora', 'persone', 'note'], esito = $('#esito-modulo');
    let tentato = false;
    f.elements.giorno.min = iso(oggiN());
    const valori = () => Object.fromEntries(campi.map((c) => [c, f.elements[c].value]));
    const mostra = (err) => campi.forEach((c) => {
      const el = f.elements[c], box = $(`#errore-${c}`);
      if (err[c]) { el.setAttribute('aria-invalid', 'true'); box.innerHTML = `${icona('avviso')}<span>${esc(err[c])}</span>`; }
      else { el.removeAttribute('aria-invalid'); box.textContent = ''; }
    });
    f.addEventListener('input', () => { if (tentato) mostra(validaPrenotazione(valori(), new Date(), O)); });
    f.addEventListener('submit', (e) => {
      e.preventDefault(); tentato = true;
      const v = valori(), err = validaPrenotazione(v, new Date(), O), primo = campi.find((c) => err[c]);
      mostra(err);
      if (primo) { esito.textContent = ''; f.elements[primo].focus(); return; }
      const testo = encodeURIComponent(messaggioPrenotazione(v, L.nome));
      if (L.whatsapp) {
        const url = `https://wa.me/${L.whatsapp}?text=${testo}`;
        if (!window.open(url, '_blank', 'noopener')) location.href = url;
        esito.textContent = 'Si è aperto WhatsApp con il messaggio pronto: premi invia per mandarlo. Ti confermiamo il tavolo nella chat.';
      } else {
        location.href = `${U.mail}?subject=${encodeURIComponent('Prenotazione dal sito')}&body=${testo}`;
        esito.textContent = `Si è aperta la tua email con il messaggio pronto. Se preferisci, chiamaci al ${L.telefono.testo}.`;
      }
    });
  }

  function menu() {
    const box = $('[data-render="menu"]');
    if (!box) return;
    const et = D.etichette;
    riempi(box, 'menu', H.menu(D));
    render('categorie', H.categorie(D));
    const filtri = render('filtri', H.filtri(D));
    render('allergeni', H.allergeni(D));
    const esito = $('.filtri__esito'), tutteTesto = H.esito(D);
    if (esito.textContent !== tutteTesto) esito.textContent = tutteTesto;
    filtri.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tag]');
      if (!b) return;
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      const scelti = $$('[aria-pressed="true"]', filtri).map((x) => x.dataset.tag);
      let viste = 0;
      $$('.voce', box).forEach((li) => { const t = li.dataset.tag.split(' '), ok = scelti.every((s) => t.includes(s)); li.hidden = !ok; viste += ok; });
      $$('.listino__sezione', box).forEach((s) => {
        const vuota = !$('.voce:not([hidden])', s), chip = $(`.categorie a[href="#${s.id}"]`);
        s.hidden = vuota; if (chip) chip.parentNode.hidden = vuota;
      });
      $('.menu-vuoto', box).hidden = viste > 0;
      esito.textContent = scelti.length ? `${viste === 1 ? '1 voce' : `${viste} voci`} con i filtri: ${scelti.map((s) => et[s].toLowerCase()).join(', ')}.` : tutteTesto;
    });
    // Categoria visibile evidenziata nella barra.
    const barra = $('.categorie__lista');
    if ('IntersectionObserver' in window && barra) {
      const io = new IntersectionObserver((v) => v.forEach((x) => {
        if (!x.isIntersecting) return;
        $$('a', barra).forEach((a) => {
          if (a.hash !== `#${x.target.id}`) { a.removeAttribute('aria-current'); return; }
          a.setAttribute('aria-current', 'true');
          barra.scrollTo({ left: a.parentNode.offsetLeft - 16, behavior: ridotto.matches ? 'auto' : 'smooth' });
        });
      }), { rootMargin: '-30% 0px -65% 0px' });
      $$('.listino__sezione', box).forEach((s) => io.observe(s));
      const testa = $('.menu-testa');
      if (testa) new IntersectionObserver(([v]) => { if (v.isIntersecting) { $$('a', barra).forEach((a) => a.removeAttribute('aria-current')); barra.scrollTo({ left: 0 }); } }).observe(testa);
    }
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
  }

  const social = () => render('social', H.social(L.social));

  // Dati strutturati schema.org, generati da site-data.js così restano allineati.
  function datiLocale() {
    const dom = L.dominio.replace(/\/$/, ''), EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const gruppi = {}, chiude = (s) => (s === '24:00' ? '23:59' : s), oggi = iso(oggiN()), spec = [];
    [1, 2, 3, 4, 5, 6, 0].forEach((g) => (O.settimana[g] || []).forEach(([a, b]) => {
      (gruppi[a + b] = gruppi[a + b] || { '@type': 'OpeningHoursSpecification', dayOfWeek: [], opens: a, closes: chiude(b) }).dayOfWeek.push(EN[g]);
    }));
    const giorno = (dal, al, f) => ({ '@type': 'OpeningHoursSpecification', validFrom: dal, validThrough: al, opens: f[0], closes: chiude(f[1]) });
    (O.eccezioni || []).filter((e) => e.data >= oggi).forEach((e) => (e.fasce.length ? e.fasce : [['00:00', '00:00']]).forEach((f) => spec.push(giorno(e.data, e.data, f))));
    (O.ferie || []).filter((f) => f.al >= oggi).forEach((f) => spec.push(giorno(f.dal, f.al, ['00:00', '00:00'])));
    const i = L.indirizzo, s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': L.tipo, '@id': `${dom}/#locale`, name: L.nome, url: `${dom}/`,
      image: [`${dom}/og-image.jpg`, `${dom}/assets/img/bancone-mattino-1600.jpg`], telephone: L.telefono.e164, email: L.email,
      priceRange: L.prezzi, servesCuisine: ['Italiana', 'Piacentina'], hasMenu: `${dom}/menu.html`, acceptsReservations: !!D.prenotazioni,
      address: { '@type': 'PostalAddress', streetAddress: i.via, postalCode: i.cap, addressLocality: i.citta, addressRegion: i.provincia, addressCountry: 'IT' },
      geo: { '@type': 'GeoCoordinates', latitude: L.geo.lat, longitude: L.geo.lng },
      openingHoursSpecification: Object.values(gruppi), specialOpeningHoursSpecification: spec,
      sameAs: ['instagram', 'facebook', 'tiktok'].map((k) => U[k]).filter(Boolean)
    });
    document.head.append(s);
  }

  function avvia() {
    [collega, tabellaOrari, statoLive, navigazione, osservatori, video, giornata, prodotti, eventi, galleria, recensioni, mappa, modulo, menu, social]
      .forEach((p) => { try { p(); } catch (e) { console.warn('Bar Piacenza:', p.name, e); } });
    if (document.body.classList.contains('pagina-home')) datiLocale();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia); else avvia();
})();
