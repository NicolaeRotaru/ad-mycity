// 🚧 GLI STATI DEL CANTIERE — la casa unica di «quanti difetti ci sono» e «cosa vuol dire aperto».
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA: «un totale che salta uno stato»
// ─────────────────────────────────────────────────────────────────────────────
// Il cantiere ha TRE stati vivi — `aperto`, `in-corso`, `da-riverificare` — più `chiuso`. Quasi tutti
// i contatori ne conoscevano due, scritti a mano dentro un `.filter()`, e le schede del terzo stato
// **sparivano dai totali**. Non è un arrotondamento: un difetto che non entra in nessun ramo diventa
// un difetto risolto agli occhi di chi legge il numero, e sparisce sempre dalla parte comoda.
//
// Misurato il 15/8/2026 sul cantiere vero: **716 schede** (476 chiuse, 184 aperte, 56 da riverificare)
// mentre `cantiere.meta` — il conto scritto DENTRO il registro da `auto-fix.mjs` — diceva
// `{aperti: 156, in_corso: 0, chiusi: 476}`, cioè **632 contro 716: 84 difetti fuori dal numero che
// il registro dichiara di sé**. E chi legge il meta invece di ricontare eredita l'errore.
//
// I quattro punti che contavano ognuno a modo suo (AR-684 · AR-717 · AR-718 · AR-719):
//   · `cervello/auto-fix.mjs` → `ricalcolaMeta`, che scrive il conto sbagliato dentro il cantiere
//   · `cervello/allinea-scan-cantiere.mjs` → il blocco `sync_scan` che il Pannello legge
//   · `cervello/chiusura-dichiarata.mjs` → il debito delle prove deboli, contato solo sugli `aperto`
//   · `pannello/src/lib/cantiere-snello.ts` → la copia TypeScript, pinzata a questa da una prova
//
// Con lei viaggia la sorella: **la stessa parola definita in due posti che divergono in silenzio**.
// Per questo la regola sta QUI e non nei punti: chi ha bisogno della risposta la chiede, non se la
// riscrive. La copia del Pannello non può sparire (Next.js non importa `cervello/`), ma non è libera:
// `cervello/test/un-totale-che-salta-uno-stato.test.mjs` le confronta campo per campo.
//
// 🟢 Modulo PURO: nessun file, nessuna rete, nessun `process.env`, nessun orologio, nessuna riga di
// comando. Tutto ciò che serve arriva dagli argomenti — così un test lo può ESEGUIRE sui casi veri.
//
// Storia: queste funzioni sono nate in `cervello/atti-veri.mjs` (lotto 42), che però è la casa di
// un'altra parola — «quali lavori toccano il mondo». Due parole in una casa sola è la stessa malattia
// vista da lontano: qui hanno la loro. `atti-veri.mjs` le RIESPORTA, così chi le importava da lì
// continua a funzionare senza che ne esistano due copie.

// ═══════════════════════════════════════════════════════════════════════════
// ① GLI STATI — quali esistono, e cosa succede a quelli che non conosco
// ═══════════════════════════════════════════════════════════════════════════

/** L'unico stato che vuol dire «non è più lavoro». Tutto il resto è da fare, anche ciò che non conosco. */
export const STATO_CHIUSO = "chiuso";

/** Gli stati che questo file sa nominare. Quelli che non conosce NON spariscono: finiscono in `altri`. */
export const STATI_NOTI = Object.freeze(["chiuso", "aperto", "in-corso", "da-riverificare"]);

/** L'etichetta che il vuoto porta nel conto per stato. Anche il niente ha un nome, così si vede. */
export const STATO_ASSENTE = "(senza stato)";

/**
 * Lo stato di una scheda, normalizzato: senza spazi attorno, e con un nome anche quando manca.
 *
 * Gli spazi si tolgono apposta: in un JSON scritto a mano `" chiuso "` è un refuso, non un sesto
 * stato. Il giorno che uno ce ne finisse dentro, senza questa riga la stessa scheda risulterebbe
 * chiusa in una colonna e da fare in un'altra.
 */
export function statoDi(d) {
  return String(d?.stato ?? "").trim() || STATO_ASSENTE;
}

/** Questa scheda è chiusa? La porta unica: chi conta, chi disegna e chi giudica passano da qui. */
export function eChiusa(d) {
  return statoDi(d) === STATO_CHIUSO;
}

/** Questa scheda è ancora lavoro? Tutto ciò che non è chiuso — compreso ciò che non so nominare. */
export function eDaFare(d) {
  return !eChiusa(d);
}

/** Lo stato di questa scheda è uno di quelli che so nominare? */
export function statoNoto(d) {
  return STATI_NOTI.includes(statoDi(d));
}

/**
 * LE SCHEDE IN UNO STATO IGNOTO — dette per nome, mai scartate in silenzio.
 *
 * È il pezzo che rende la malattia impossibile da ripetere: se domani nasce un sesto stato, non
 * sparisce dentro un totale né fa saltare la somma. Compare qui con la sua etichetta, il suo numero
 * e i primi id, e chi stampa lo può mostrare a Nicola come una riga in più invece che come un buco.
 */
export function statiIgnoti(difetti, maxId = 10) {
  if (!Array.isArray(difetti)) return null;
  const per = new Map();
  for (const d of difetti.filter(Boolean)) {
    if (statoNoto(d)) continue;
    const s = statoDi(d);
    if (!per.has(s)) per.set(s, { stato: s, quante: 0, ids: [] });
    const v = per.get(s);
    v.quante++;
    if (v.ids.length < maxId && d?.id) v.ids.push(String(d.id));
  }
  return [...per.values()].sort((a, b) => b.quante - a.quante);
}

// ═══════════════════════════════════════════════════════════════════════════
// ② IL CONTO — un metro solo, e la somma dei rami che fa il totale
// ═══════════════════════════════════════════════════════════════════════════

/** La data di nascita è leggibile? Un `nato` assente o illeggibile è un IGNOTO, non uno zero. */
export function haDataNascita(d) {
  return !Number.isNaN(Date.parse(String(d?.nato ?? "").slice(0, 10)));
}

/**
 * IL CONTO DEL CANTIERE — un metro solo, e la somma dei rami che fa il totale.
 *
 * Perché è una funzione e non un `.filter()`, in tre punti che sono tre difetti pagati:
 *
 *  ① **`da_fare` è tutto ciò che non è chiuso**, non «aperto + in-corso». Il 13/8 c'erano 225
 *     `aperto`, 0 `in-corso` e 56 `da-riverificare`: sommando i due stati previsti, 56 difetti veri
 *     sparivano dal numero che Nicola guarda (AR-684). Uno stato che non conosco non è un difetto
 *     risolto — è un difetto che non so nominare.
 *  ② **La somma dei rami DEVE fare il totale.** `chiusi + aperti + in_corso + da_riverificare +
 *     altri === totale`, e il test lo pretende sul cantiere vero. È la difesa che rende impossibile
 *     il buco di ①: se domani nasce un sesto stato finisce in `altri` e la somma continua a tornare.
 *  ③ **Non letto non è zero.** Se non ti è arrivata una lista, questa funzione non risponde `0`:
 *     risponde `letto: false` con tutti i conti a `null`. Uno zero è un fatto («non ci sono
 *     difetti»); un errore di lettura travestito da zero è la bugia che il 30/7 ha fatto scrivere
 *     alla Cabina «Nessun difetto aperto 👍» con 162 aperti, per dodici ore.
 *
 * `senza_data_nascita` è AR-671 visto dalla parte del dato: i difetti senza `nato` uscivano in
 * silenzio dalla statistica storica invece di essere dichiarati ignoti — e sbagliavano **nella
 * direzione ottimista**, cioè il burn-down migliorava da solo.
 */
export function contaDifetti(difetti) {
  if (!Array.isArray(difetti)) {
    return {
      letto: false,
      motivo: "non mi è arrivata una lista di schede: non ho potuto contare (e un non-contato non è uno zero)",
      totale: null,
      chiusi: null,
      aperti: null,
      in_corso: null,
      da_riverificare: null,
      altri: null,
      da_fare: null,
      senza_data_nascita: null,
      per_stato: null,
      stati_ignoti: null,
    };
  }
  const lista = difetti.filter(Boolean);
  const per_stato = {};
  let chiusi = 0;
  let aperti = 0;
  let in_corso = 0;
  let da_riverificare = 0;
  let altri = 0;
  let senza_data_nascita = 0;
  for (const d of lista) {
    const stato = statoDi(d);
    per_stato[stato] = (per_stato[stato] ?? 0) + 1;
    if (stato === "chiuso") chiusi++;
    else if (stato === "aperto") aperti++;
    else if (stato === "in-corso") in_corso++;
    else if (stato === "da-riverificare") da_riverificare++;
    else altri++;
    if (!haDataNascita(d)) senza_data_nascita++;
  }
  return {
    letto: true,
    motivo: null,
    totale: lista.length,
    chiusi,
    aperti,
    in_corso,
    da_riverificare,
    altri,
    // `da_fare` resta il nome con cui il Pannello chiama la stessa cosa: chiuso, oppure da fare.
    da_fare: lista.length - chiusi,
    senza_data_nascita,
    per_stato,
    // Gli stati che non so nominare, detti per nome: `altri` è il quanto, questo è il chi.
    stati_ignoti: statiIgnoti(lista),
  };
}

/**
 * La somma dei rami torna? Il conto si controlla da solo, così un ramo nuovo non può nascondersi.
 * Torna `null` se il conto non è stato letto: su un cieco non si emette un verdetto.
 */
export function sommaTorna(conto) {
  if (!conto || conto.letto !== true) return null;
  const rami = conto.chiusi + conto.aperti + conto.in_corso + conto.da_riverificare + conto.altri;
  return rami === conto.totale && conto.da_fare === conto.totale - conto.chiusi;
}

/**
 * QUANTI ERANO APERTI A UNA CERTA DATA — e quanti non lo so (AR-671).
 *
 * Prima era `if (nato == null) return false`: una scheda senza data di nascita usciva dal conteggio
 * **in silenzio**, né oggi né una settimana fa. Non è un arrotondamento: è un difetto che sparisce
 * dalla statistica, e sparisce sempre dalla parte comoda — il burn-down migliora da solo.
 *
 * Adesso escono due numeri: quelli che so contare e quelli che **non so collocare nel tempo**.
 * Chi disegna il burn-down deve poter scrivere «più o meno N», non un numero secco che non regge.
 */
export function apertiAllaData(difetti, tMs) {
  const conto = contaDifetti(difetti);
  if (!conto.letto) return { conteggio: null, ignoti: null, letto: false, motivo: conto.motivo };
  if (!Number.isFinite(tMs)) {
    return { conteggio: null, ignoti: null, letto: false, motivo: "non mi è arrivata una data valida: non ho potuto collocare niente nel tempo" };
  }
  const giorno = (iso) => {
    const t = Date.parse(String(iso ?? "").slice(0, 10));
    return Number.isNaN(t) ? null : t;
  };
  let conteggio = 0;
  let ignoti = 0;
  for (const d of difetti.filter(Boolean)) {
    const chiuso = giorno(d?.chiuso_il);
    const giaChiuso = chiuso != null && chiuso <= tMs;
    const nato = giorno(d?.nato);
    if (nato == null) {
      // Non so QUANDO è nato. Se a quella data non risulta ancora chiuso, era del lavoro da fare:
      // lo dichiaro ignoto invece di buttarlo via. Se risultava già chiuso, non è più un dubbio.
      if (!giaChiuso) ignoti++;
      continue;
    }
    if (nato > tMs) continue; // non ancora nato a quella data
    if (!giaChiuso) conteggio++;
  }
  return { conteggio, ignoti, letto: true, motivo: null };
}

// ═══════════════════════════════════════════════════════════════════════════
// ③ IL GOVERNO DELLE SCHEDE — chi risponde di un difetto, ed entro quando (AR-432)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Quante schede da fare non hanno un responsabile, e quante hanno sforato la data.
 *
 * Sta qui e non nel guardiano perché è **un conto sul cantiere**, cioè la stessa famiglia di ①: se
 * vivesse dentro `cantiere-owner-check.mjs` insieme alla lettura di `.claude/agents/`, sarebbe di
 * nuovo una regola che un test può solo guardare da fuori. Il guardiano decide; qui si conta.
 *
 * `oggiMs` arriva da fuori apposta: un modulo che chiede l'ora all'orologio non si può provare due
 * volte con lo stesso risultato.
 */
export function contaGoverno(difetti, oggiMs) {
  if (!Array.isArray(difetti)) {
    return { letto: false, da_fare: null, senza_owner: null, senza_scadenza: null, scaduti: null, ids_senza_owner: null, ids_scaduti: null };
  }
  const daFare = difetti.filter(Boolean).filter(eDaFare);
  const senzaOwner = daFare.filter((d) => !String(d?.owner ?? "").trim());
  const senzaScadenza = daFare.filter((d) => Number.isNaN(Date.parse(String(d?.scadenza ?? "").slice(0, 10))));
  const scaduti = Number.isFinite(oggiMs)
    ? daFare.filter((d) => {
        const t = Date.parse(String(d?.scadenza ?? "").slice(0, 10));
        return !Number.isNaN(t) && t < oggiMs;
      })
    : [];
  return {
    letto: true,
    da_fare: daFare.length,
    senza_owner: senzaOwner.length,
    senza_scadenza: senzaScadenza.length,
    // Senza una data di riferimento non si dichiara «zero scaduti»: si dichiara che non l'ho guardato.
    scaduti: Number.isFinite(oggiMs) ? scaduti.length : null,
    ids_senza_owner: senzaOwner.map((d) => String(d?.id ?? "?")),
    ids_scaduti: Number.isFinite(oggiMs) ? scaduti.map((d) => String(d?.id ?? "?")) : null,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ④ IL META DEL CANTIERE — la forma unica del riassunto scritto nel registro
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Il blocco `meta` che va scritto dentro `cantiere-difetti.json`, e lo stesso che l'allineatore
 * delle radiografie mette in `sync_scan`.
 *
 * Perché una funzione e non due oggetti scritti a mano: il riassunto **dentro** il registro era il
 * punto peggiore in cui sbagliare, perché chi lo legge invece di ricontare eredita l'errore senza
 * accorgersene. Adesso porta con sé anche `somma_torna`: se un giorno non tornasse, il file lo dice
 * di sé invece di lasciarlo scoprire a una radiografia sei settimane dopo.
 *
 * I tre nomi storici (`aperti`, `in_corso`, `chiusi`) restano e continuano a voler dire lo stato
 * letterale, perché fuori da qui c'è chi li legge. Il numero onesto di «quanto lavoro resta» è
 * `da_fare`, ed è quello nuovo.
 */
export function metaCantiere(difetti, { oggiMs } = {}) {
  const c = contaDifetti(difetti);
  if (!c.letto) {
    return { letto: false, motivo: c.motivo, derivato_dalla_lista: true, somma_torna: null };
  }
  const g = contaGoverno(difetti, oggiMs);
  return {
    letto: true,
    totale: c.totale,
    aperti: c.aperti,
    in_corso: c.in_corso,
    da_riverificare: c.da_riverificare,
    chiusi: c.chiusi,
    altri: c.altri,
    da_fare: c.da_fare,
    senza_data_nascita: c.senza_data_nascita,
    per_stato: c.per_stato,
    stati_ignoti: c.stati_ignoti,
    // AR-432 — il cantiere è un registro di lavoro, e un lavoro senza un nome e una data non è
    // assegnato a nessuno. Qui diventa un numero invece di restare un'assenza.
    senza_owner: g.senza_owner,
    senza_scadenza: g.senza_scadenza,
    scaduti: g.scaduti,
    derivato_dalla_lista: true,
    somma_torna: sommaTorna(c),
  };
}
