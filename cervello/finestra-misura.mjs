// finestra-misura.mjs — DA QUALE FINESTRA VIENE QUESTO NUMERO (lotto 41, corsia «il metro guarda la
// finestra sbagliata»).
//
// ─────────────────────────────────────────────────────────────────────────────
// LA MALATTIA CHE QUESTO FILE CURA
// ─────────────────────────────────────────────────────────────────────────────
// Un guardiano misura una cosa VICINA a quella che gli interessa e la spaccia per quella giusta.
// Il verdetto esce verde per costruzione, e nessuno se ne accorge, perché **un metro che non misura
// una strada non la dichiara scoperta: dice verde**. Quattro forme, tutte viste in casa:
//
//   ① la finestra del GIORNO — il freno sui costi legge il secchio di ieri e conclude che oggi non
//      abbiamo speso niente (AR-368/AR-424). Un secchio scaduto non è uno zero: è un «non lo so».
//   ② la finestra ROLLING — il muro vero della quota è una finestra di ~6 ore che scorre; la
//      misura giusta c'era (`sessione_rolling`) e la decisione continuava a girare sul totale del
//      giorno solare (AR-369). Misurare una cosa e deciderne un'altra è peggio che non misurare:
//      sembra che il numero sia sorvegliato.
//   ③ la finestra del PERIMETRO — il guardiano del peso pesa i quattro file scritti nella propria
//      configurazione e dichiara una copertura che coincide con essa (AR-425). Un guardiano non
//      deve poter definire da solo il proprio perimetro.
//   ④ la finestra del CANALE — la classe di un errore letta dalla prosa italiana dell'AD invece che
//      dalla riga che la macchina emette apposta (AR-294); e due quaderni che differiscono per una
//      maiuscola trattati come due cose diverse (AR-348). Il segnale va letto dal canale che lo
//      dichiara, e l'identità va normalizzata ALL'INGRESSO, non con un alias in fondo.
//
// La regola che le unisce: **prima di usare un numero si dichiara da quale finestra viene, e una
// finestra scaduta o vuota non produce uno zero — produce un «cieco» visibile.** È lo stesso
// contratto di `fonte-numero.mjs` (che risponde a «da dove viene») spostato di un passo: qui la
// domanda è «di QUANDO è, e di QUANTO parla».
//
// Import unico: `msDaTimbro` da `ora-piacenza.mjs`, che è a sua volta puro (zero import). Nessun
// accesso a disco, rete o vault: si esegue in un test senza preparare niente.

import { msDaTimbro } from "./ora-piacenza.mjs";

/** Lo stato di una finestra: cosa mi è concesso concludere dal numero che ne esce. */
export const FINESTRA = {
  VIVA: "viva", // il numero parla del periodo che mi interessa → si può decidere
  SCADUTA: "scaduta", // misura vera, di un periodo finito → mai un verdetto
  ASSENTE: "assente", // non c'è misura, o non so di quando è → mai un verdetto
  VUOTA: "vuota", // la finestra c'è ma non contiene campioni → un foglio bianco, non uno zero
};

/** Le finestre da cui un gate hard NON può emettere un verdetto. */
export const FINESTRE_CIECHE = [FINESTRA.SCADUTA, FINESTRA.ASSENTE, FINESTRA.VUOTA];

/** `true` se da questa finestra si può decidere. Un guardiano cieco esce 2 (AR-322), non 0. */
export function finestraDecidibile(esito) {
  return String(esito ?? "") === FINESTRA.VIVA;
}

// ─────────────────────────────────────────────────────────────────────────────
// ① LA FINESTRA DEL GIORNO — «di che giorno è questo secchio?» (AR-368)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Il secchio giornaliero (`{data, …}`) parla di OGGI o di un giorno già chiuso?
 *
 * Il contatore si azzera a mezzanotte, ma il blocco `oggi` resta quello dell'ultimo giro fatto:
 * finché nessuno gira, `oggi` è ieri — e ieri, sui contatori di consumo, vale sempre zero. Zero è
 * esattamente il valore che spegne ogni allarme: più la macchina è ferma, più i suoi indicatori
 * sembrano tranquilli. Questa è la funzione che rompe quel circolo.
 *
 * Pura per costruzione: la data di oggi ARRIVA DA FUORI, così un test può mettersi in entrambe le
 * condizioni senza spostare l'orologio del computer.
 *
 * @param {{data?: string}|null} bucket il blocco datato (es. `costo-ai.json → oggi`)
 * @param {string|null} adessoISO la data di oggi, «AAAA-MM-GG» (o un timbro che comincia così)
 * @returns {{scaduto: boolean, esito: string, giorno: string|null, atteso: string|null, motivo: string}}
 */
export function bucketScaduto(bucket, adessoISO = null) {
  const giorno = String(bucket?.data ?? "").trim().slice(0, 10) || null;
  const atteso = String(adessoISO ?? "").trim().slice(0, 10) || null;

  if (!giorno)
    return {
      scaduto: false,
      esito: FINESTRA.ASSENTE,
      giorno: null,
      atteso,
      motivo: "il secchio non dichiara di che giorno è: senza data non posso dire se parla di oggi",
    };
  if (!atteso)
    return {
      scaduto: false,
      esito: FINESTRA.ASSENTE,
      giorno,
      atteso: null,
      motivo: `nessuna data di riferimento dichiarata: non posso confrontare il secchio del ${giorno} con oggi`,
    };
  if (giorno !== atteso)
    return {
      scaduto: true,
      esito: FINESTRA.SCADUTA,
      giorno,
      atteso,
      motivo: `il contatore è del ${giorno} e oggi è il ${atteso}: un numero di un giorno già finito non dice niente su adesso`,
    };
  return { scaduto: false, esito: FINESTRA.VIVA, giorno, atteso, motivo: `contatore del ${giorno}, cioè di oggi` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ② LA FINESTRA CHE SCORRE — «questa misura è ancora dentro la finestra?» (AR-369, AR-431)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Minuti fra un timbro («AAAA-MM-GG HH:MM», ora di Piacenza) e un istante. `null` se illeggibile.
 *
 * Una data SENZA ora («2026-07-02», la forma di `ultima_revisione` nel registro dei rischi) vale
 * mezzogiorno di quel giorno: è la convenzione già in uso in `chiusura-loop.mjs`, e tiene l'errore
 * sotto la mezza giornata in entrambi i versi. Senza questa riga un campo scritto nella forma
 * normale del vault sarebbe risultato «illeggibile», cioè il guardiano nascerebbe cieco sui dati
 * veri e verde su niente.
 */
export function etaMinuti(timbro, adessoMs) {
  const grezzo = String(timbro ?? "").trim();
  const t = msDaTimbro(/^\d{4}-\d{2}-\d{2}$/.test(grezzo) ? `${grezzo} 12:00` : grezzo);
  const ora = Number(adessoMs);
  if (!Number.isFinite(t) || !Number.isFinite(ora)) return null;
  return (ora - t) / 60000;
}

/** Giorni (con decimali) fra un timbro e un istante. `null` se illeggibile. */
export function etaGiorni(timbro, adessoMs) {
  const min = etaMinuti(timbro, adessoMs);
  return min == null ? null : min / 1440;
}

/**
 * Lo stato di una misura che vive dentro una finestra scorrevole.
 *
 * Serve a chi decide su un numero che «vale» solo per un certo tempo: la quota-sessione (6 ore), la
 * revisione di un rischio (30 giorni), un contatore aggiornato a ogni giro. Le tre risposte sbagliate
 * che questa funzione impedisce sono sempre le stesse: prendere una misura vecchia per attuale,
 * prendere un'assenza per uno zero, prendere una finestra vuota per una finestra tranquilla.
 *
 * @param {{valore?: number|null, timbro?: string|null, adessoMs?: number|null,
 *          finestraMin?: number|null, tolleranzaMin?: number, campioni?: number|null}} arg
 * @returns {{esito: string, valore: number|null, eta_min: number|null, finestra_min: number|null, motivo: string}}
 */
export function statoFinestra({
  valore = null,
  timbro = null,
  adessoMs = null,
  finestraMin = null,
  tolleranzaMin = 0,
  campioni = null,
} = {}) {
  // ⚠️ `Number(null)` vale 0 e `Number.isFinite(0)` è vero: senza questi due controlli espliciti un
  // campo ASSENTE entrerebbe qui come uno ZERO MISURATO — cioè proprio la malattia che il modulo
  // cura, riprodotta dentro il modulo stesso.
  const v = valore == null || valore === "" ? NaN : Number(valore);
  const eta = etaMinuti(timbro, adessoMs);
  const fin = finestraMin == null ? NaN : Number(finestraMin);
  const base = { valore: Number.isFinite(v) ? v : null, eta_min: eta, finestra_min: Number.isFinite(fin) ? fin : null };

  if (!Number.isFinite(v))
    return { ...base, esito: FINESTRA.ASSENTE, motivo: "la misura non c'è: un campo mancante non è uno zero" };
  if (!Number.isFinite(fin) || fin <= 0)
    return { ...base, esito: FINESTRA.ASSENTE, motivo: "nessuna ampiezza di finestra dichiarata: non so di quanto tempo parla questo numero" };
  if (eta == null)
    return { ...base, esito: FINESTRA.ASSENTE, motivo: "la misura non porta un timbro leggibile: non so a quale finestra appartiene" };

  const limite = fin + Math.max(0, Number(tolleranzaMin) || 0);
  if (eta > limite)
    return {
      ...base,
      esito: FINESTRA.SCADUTA,
      motivo: `misura di ${Math.round(eta)} minuti fa, oltre la finestra di ${Math.round(limite)}: parla di un periodo già passato`,
    };

  const camp = campioni == null ? NaN : Number(campioni);
  if (Number.isFinite(camp) && camp === 0)
    return {
      ...base,
      esito: FINESTRA.VUOTA,
      motivo: "nessun campione dentro la finestra: è un foglio bianco, non un consumo basso",
    };

  return { ...base, esito: FINESTRA.VIVA, motivo: `misura di ${Math.round(eta)} minuti fa, dentro la finestra di ${Math.round(fin)}` };
}

/**
 * Freschezza di un documento di governo, misurata in GIORNI (rischi, OKR, checklist, scadenzario).
 * Stessa forma di `statoFinestra`, unità diversa: qui la finestra è un tetto di anzianità.
 *
 * @returns {{esito: string, giorni: number|null, tetto_giorni: number|null, motivo: string}}
 */
export function statoRevisione({ timbro = null, adessoMs = null, tettoGiorni = null } = {}) {
  const giorni = etaGiorni(timbro, adessoMs);
  const tetto = Number(tettoGiorni);
  const base = { giorni: giorni == null ? null : Math.round(giorni * 10) / 10, tetto_giorni: Number.isFinite(tetto) ? tetto : null };
  if (!Number.isFinite(tetto) || tetto <= 0)
    return { ...base, esito: FINESTRA.ASSENTE, motivo: "nessun tetto di anzianità dichiarato: senza tetto non esiste uno «stantio»" };
  if (giorni == null)
    return { ...base, esito: FINESTRA.ASSENTE, motivo: "nessuna data di revisione leggibile: non so da quanto non lo guarda nessuno" };
  if (giorni > tetto)
    return { ...base, esito: FINESTRA.SCADUTA, motivo: `rivisto ${Math.floor(giorni)} giorni fa, oltre il tetto di ${tetto}` };
  return { ...base, esito: FINESTRA.VIVA, motivo: `rivisto ${Math.floor(giorni)} giorni fa (tetto ${tetto})` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ MAGAZZINO O RITMO — «quanti ne esistono» non è «quanti ne nascono» (AR-421)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Distingue lo STOCK (quanti asset esistono in tutto) dal RITMO (quanti ne sono nati nella
 * finestra). Un cancello che deve tenere lo sforzo su un obiettivo vivo va misurato sul ritmo:
 * ventisei cartelle vecchie tengono muto per sempre un cancello che conta il magazzino.
 *
 * `recenti === null` significa che la finestra non è misurabile (per esempio la storia di git è
 * troncata): l'esito è ASSENTE, non zero — è la differenza fra «non ho prodotto niente» e «non so
 * cosa ho prodotto».
 *
 * @returns {{esito: string, magazzino: number|null, recenti: number|null, giorni: number|null, motivo: string}}
 */
export function ritmoVsMagazzino({ magazzino = null, recenti = null, giorni = null } = {}) {
  const mag = Number.isFinite(Number(magazzino)) ? Number(magazzino) : null;
  const rec = recenti == null ? null : Number(recenti);
  const g = Number.isFinite(Number(giorni)) ? Number(giorni) : null;
  const base = { magazzino: mag, recenti: Number.isFinite(rec) ? rec : null, giorni: g };

  if (rec == null || !Number.isFinite(rec))
    return { ...base, esito: FINESTRA.ASSENTE, motivo: "la finestra non è misurabile: non posso distinguere il magazzino dal ritmo" };
  if (rec === 0)
    return {
      ...base,
      esito: FINESTRA.VUOTA,
      motivo: `nessun asset nuovo negli ultimi ${g ?? "?"} giorni (in magazzino ce ne sono ${mag ?? "?"}: sono vecchi, non sono produzione)`,
    };
  return { ...base, esito: FINESTRA.VIVA, motivo: `${rec} asset nuovi negli ultimi ${g ?? "?"} giorni` };
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ LA FINESTRA DEL PERIMETRO — «chi decide COSA viene misurato?» (AR-425)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Confronta il perimetro OSSERVATO (derivato dalla fonte vera: chi legge davvero quei file) con
 * quello DICHIARATO (la configurazione del guardiano). Chi sta nel primo e non nel secondo è
 * SCOPERTO: entra nel costo e non ha nessun tetto, quindi oggi non viene nemmeno pesato.
 *
 * È il difetto di forma di AR-339 e AR-425: un guardiano che deriva la propria copertura dalla
 * propria configurazione non può, per costruzione, accorgersi di ciò che è fuori.
 *
 * @returns {{scoperti: string[], dichiarati_assenti: string[], coperti: string[], copertura_pct: number|null}}
 */
export function perimetroScoperto(osservati = [], dichiarati = []) {
  const oss = [...new Set((osservati || []).map((s) => String(s).trim()).filter(Boolean))];
  const dic = new Set((dichiarati || []).map((s) => String(s).trim()).filter(Boolean));
  const scoperti = oss.filter((f) => !dic.has(f));
  const coperti = oss.filter((f) => dic.has(f));
  const dichiaratiAssenti = [...dic].filter((f) => !oss.includes(f));
  return {
    scoperti,
    dichiarati_assenti: dichiaratiAssenti,
    coperti,
    copertura_pct: oss.length ? Math.round((coperti.length / oss.length) * 1000) / 10 : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ LA FINESTRA DEL CANALE — «il segnale lo emette la macchina o lo scrivo io?» (AR-294)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Legge una riga che la macchina emette APPOSTA per dichiarare qualcosa, nella forma `[marca] valore`.
 *
 * Finché il canale della diagnosi è lo stesso canale del contenuto, ogni parola scritta dall'AD può
 * cambiare il comportamento della macchina: una relazione italiana che parla di «quota di mercato»
 * convince il worker di aver sbattuto contro il limite del motore. Un errore va classificato da un
 * segnale emesso apposta, non da come è scritta una relazione.
 *
 * @returns {{valore: string|null, dichiarato: boolean, riga: string|null}}
 */
export function segnaleDichiarato(testo, marca = "classe") {
  const t = String(testo ?? "");
  const m = String(marca ?? "").trim();
  if (!t || !m) return { valore: null, dichiarato: false, riga: null };
  const re = new RegExp(`^[ \\t>]*\\[${m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\][ \\t]*(.+)$`, "gim");
  let ultimo = null;
  let mm;
  while ((mm = re.exec(t)) !== null) ultimo = mm; // vince l'ULTIMA dichiarazione: è l'esito finale
  if (!ultimo) return { valore: null, dichiarato: false, riga: null };
  return { valore: ultimo[1].trim(), dichiarato: true, riga: ultimo[0].trim() };
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑥ LA FINESTRA DELL'IDENTITÀ — «due nomi, lo stesso secchio» (AR-348)
// ─────────────────────────────────────────────────────────────────────────────

/** Forma canonica di una chiave: niente @, niente spazi ai bordi, minuscolo. */
export function chiaveNormalizzata(nome) {
  return String(nome ?? "")
    .replace(/^@/, "")
    .trim()
    .toLowerCase();
}

/** Distanza di Levenshtein, per suggerire i nomi vicini quando uno non esiste. */
export function distanza(a, b) {
  const s = String(a ?? "");
  const t = String(b ?? "");
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  let prec = Array.from({ length: t.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s.length; i++) {
    const cur = [i];
    for (let j = 1; j <= t.length; j++) {
      cur[j] = Math.min(prec[j] + 1, cur[j - 1] + 1, prec[j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1));
    }
    prec = cur;
  }
  return prec[t.length];
}

/**
 * Risolve un nome contro un elenco canonico NORMALIZZANDO ALL'INGRESSO.
 *
 * Il quaderno dell'AD è finito in due case (`AD.md` e `ad.md`) perché il comando accettava qualunque
 * nome: un dato scritto col nome sbagliato non è un dato mancante, è un dato che esiste, sembra vero
 * e non troverà nessun lettore. La cura non è un alias in coda, è la normalizzazione all'ingresso —
 * e il rifiuto, con i nomi vicini, di ciò che non esiste.
 *
 * @param {string} nome il nome così com'è stato digitato
 * @param {string[]} roster i nomi canonici (fonte di verità)
 * @param {string[]} deroghe nomi ammessi che NON stanno nel roster (es. «ad», che non è un agente)
 * @returns {{ok: boolean, canonico: string|null, chiesto: string, normalizzato: string,
 *            deroga: boolean, esatto: boolean, simili: string[], motivo: string}}
 */
export function chiaveCanonica(nome, roster = [], deroghe = []) {
  const chiesto = String(nome ?? "").replace(/^@/, "").trim();
  const norm = chiaveNormalizzata(nome);
  const lista = (roster || []).map((r) => String(r));
  const der = (deroghe || []).map((d) => chiaveNormalizzata(d));

  if (!norm)
    return { ok: false, canonico: null, chiesto, normalizzato: norm, deroga: false, esatto: false, simili: [], motivo: "nome vuoto" };

  const trovato = lista.find((r) => chiaveNormalizzata(r) === norm);
  if (trovato)
    return {
      ok: true,
      canonico: trovato,
      chiesto,
      normalizzato: norm,
      deroga: false,
      esatto: trovato === chiesto,
      simili: [],
      motivo: trovato === chiesto ? "nome esatto" : `«${chiesto}» e «${trovato}» sono lo stesso nome scritto in due modi: vale il canonico`,
    };

  if (der.includes(norm))
    return {
      ok: true,
      canonico: norm,
      chiesto,
      normalizzato: norm,
      deroga: true,
      esatto: norm === chiesto,
      simili: [],
      motivo: `«${norm}» è una deroga dichiarata: non sta nel roster ma è ammessa`,
    };

  const simili = lista
    .map((r) => ({ r, d: distanza(norm, chiaveNormalizzata(r)) }))
    .sort((a, b) => a.d - b.d || a.r.localeCompare(b.r))
    .slice(0, 3)
    .map((x) => x.r);
  return {
    ok: false,
    canonico: null,
    chiesto,
    normalizzato: norm,
    deroga: false,
    esatto: false,
    simili,
    motivo: `«${chiesto}» non esiste fra i nomi ammessi`,
  };
}

/**
 * Due chiavi che normalizzate coincidono sono LA STESSA COSA in due case: qui si trovano.
 * Estende il metro di AR-342 dentro la stessa cartella.
 *
 * @returns {Array<{normalizzato: string, varianti: string[]}>}
 */
export function chiaviDoppie(nomi = []) {
  const per = new Map();
  for (const n of nomi || []) {
    const k = chiaveNormalizzata(n);
    if (!k) continue;
    if (!per.has(k)) per.set(k, []);
    if (!per.get(k).includes(String(n))) per.get(k).push(String(n));
  }
  return [...per.entries()].filter(([, v]) => v.length > 1).map(([normalizzato, varianti]) => ({ normalizzato, varianti }));
}
