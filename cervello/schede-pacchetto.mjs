#!/usr/bin/env node
// 🗂️ SCHEDE DEL PACCHETTO — prepara gli `args` di UN'ondata del sito, senza svegliare nessun agente.
//
// PERCHE' ESISTE. L'ondata 1 del piano del 15/10 l'ha orchestrata l'AD a mano: a ogni passo un turno
// del ciclo principale, e ogni turno del ciclo principale parte da circa 162.000 gettoni di contesto
// fisso (misura del 25/10). Ritrovare le schede di un pacchetto nel registro, tagliarle e dire se il
// pacchetto tocca soldi, dati o permessi e' lavoro MECCANICO: qui lo fa node, a zero agenti, e il
// workflow `ondata-sito` riceve il risultato pronto in `args.schede`.
//
// COSA NON PUO' PIU' SUCCEDERE, e perche':
//   ① La chiave che collega il piano al registro e' `chiaveProblema` di referti-sito.mjs, IMPORTATA.
//      Il referto del 28/8 conta 356 chiavi su 361 sbagliate fatte a mano: una sua imitazione qui
//      avrebbe scollegato in silenzio le chiusure dell'ondata.
//   ② Una scheda che non si ritrova NON diventa un pacchetto piu' corto. Esce 2, con l'elenco, e
//      sullo schermo non arriva nessun JSON: un `args` con difetti mancanti non si spaccia per
//      completo, perche' la squadra chiuderebbe il pacchetto e il difetto mancante resterebbe aperto
//      senza che nessuno se ne accorga.
//   ③ La scheda arriva tagliata a un tetto (TETTO_SCHEDA, in byte) e SENZA la storia: note di
//      riparazione, riverifiche e riaperture pesano fino a 11 KB a scheda e alla squadra non servono.
//   ④ Il rischio (soldi / dati / permessi / nessuno) si calcola prima con le regole della mappa delle
//      lenti (dimensioni-radiografia.json): se la mappa rinomina una dimensione, questo script esce 2
//      invece di dire «nessuno» per cecita'. Dove la mappa non distingue — a lei tutto lib/ e'
//      «architettura» — decidono i NOMI del percorso (RISCHIO_DAI_NOMI): il collaudo del 25/10 ha
//      trovato lib/auth/cookie-di-sessione.ts, lib/admin/esporta-utenti.ts e app/admin/payouts/
//      usciti «nessuno», cioe' con un collaudatore solo invece di due. E dove nemmeno i nomi bastano
//      decide la SCHEDA stessa (RISCHIO_DAL_TESTO, su titolo e impatto): lib/products/aiPatch.ts e'
//      «ai-endpoints» e non ha soldi nel nome, ma la sua scheda dice «cambiare un prezzo»; lo stesso
//      per lib/ai/tettoSpesa.ts (il tetto di spesa AI) e per la prova e2e della cassa (fuori mappa).
//   ⑤ Una scheda gia' chiusa nel registro (l'ondata 1 ne ha chiuse undici) non va a una squadra: esce
//      in `gia_chiusi`, dichiarata, e il conteggio lo dice.
//
// Uscita: 0 = piano letto e tutte le schede trovate · 2 = non ho potuto preparare l'ondata (piano o
// ondata inesistenti, schede mancanti, mappa cambiata, argomento storto). Mai un verde cieco.
// 🟢 Sola lettura: legge il piano, il registro e la mappa, stampa e basta.
//
// Uso:
//   node cervello/schede-pacchetto.mjs --piano consegne/audit/<piano>.json --ondata 2          riassunto
//   node cervello/schede-pacchetto.mjs --piano consegne/audit/<piano>.json --ondata 2 --json   args del workflow
//   (--registro <file> per un registro diverso da quello di casa, --tetto <byte> per il taglio)

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chiaveProblema } from "./referti-sito.mjs";
import { regolaPerFile, regolaCombacia } from "./radiografia-in-corsa.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const REGISTRO_SITO = "MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json";
export const MAPPA_LENTI = "cervello/dimensioni-radiografia.json";
/** Il nome del repo del sito nelle regole della mappa (`repo: "marketplace"`). */
export const REPO_SITO = "marketplace";

/**
 * Il tetto di una scheda, in byte del JSON. 1.500 byte sono circa 750 gettoni (1,95 caratteri per
 * gettone, misura del 25/10 sul CLAUDE.md): un pacchetto da 12 schede resta sotto i 9.000 gettoni,
 * contro le schede intere che arrivano a 11.701 byte l'una.
 */
export const TETTO_SCHEDA = 1500;
const TETTO_MINIMO = 400; // sotto, la sola chiave e il titolo non ci stanno: un tetto cosi' e' un refuso

/**
 * I campi che la squadra legge, nell'ordine in cui li legge: [nome nell'args, campi del registro].
 * Il secondo campo e' il ripiego quando il primo e' vuoto (il registro ha 4 schede con `fix_proposto`).
 * Tutto il resto — nota_riparazione, riverifica, riaperto_da, giro, fonte… — e' storia e resta fuori.
 */
export const CAMPI_SCHEDA = Object.freeze([
  ["titolo", ["titolo"]],
  ["gravita", ["severita"]],
  ["dimensione", ["dimensione"]],
  ["dove", ["file"]],
  ["descrizione", ["descrizione"]],
  ["impatto", ["impatto", "impatto_crescita"]],
  ["fix", ["fix", "fix_proposto"]],
  ["causa_radice", ["causa_radice"]],
]);
/** Questi non si tagliano mai: sono identita' e classificazione, e sono corti. */
const INTOCCABILI = new Set(["chiave", "gravita", "dimensione"]);
/**
 * «dove» e' la sola strada della squadra verso il codice, e il taglio equo lo accorciava in 35 schede
 * su 105 del piano vero: la squadra perdeva i numeri di riga dei file dopo il primo. Ora ha una quota
 * sua (un terzo del tetto) e, se non ci sta, perde le spiegazioni fra parentesi e tiene TUTTE le
 * coordinate file:riga. Si taglia solo se nemmeno le coordinate ci stanno.
 */
const QUOTA_DOVE = 1 / 3;
const RE_COORDINATA = /[\w./@[\]-]+\.(?:tsx?|jsx?|sql|json|css|mjs|js|sh|md|ya?ml|svg|bats)(?::\d+(?:[-–]\d+)?(?:,\s*\d+(?:[-–]\d+)?)*)?/g;

/**
 * Il rischio di una dimensione della mappa. Una dimensione che non compare qui vale «nessuno».
 * `rls-database` e' «dati» e non «permessi» perche' la mappa ci manda migrations/ e supabase/: chi
 * tocca quei file cambia lo schema o le regole su cui stanno i dati, e la domanda del collaudo e'
 * «cosa succede ai dati veri in produzione», non solo «chi puo' leggerli».
 */
export const RISCHIO_DELLE_DIMENSIONI = Object.freeze({
  "pagamenti-stripe": "soldi",
  "rls-database": "dati",
  "privacy-legale": "dati",
  "sicurezza-auth": "permessi",
});
/** Quando un pacchetto ne tocca piu' d'uno, vince il primo: i soldi sono il percorso sacro. */
export const ORDINE_RISCHIO = Object.freeze(["soldi", "dati", "permessi"]);
/**
 * Le lenti CONSIGLIATE dalla mappa che portano un rischio anche quando la lente obbligatoria non lo
 * porta: app/checkout/ ha «qa-flussi» ma li' passano i soldi; lib/analytics ha «dati-analytics» ma
 * la mappa gli consiglia la privacy, perche' li' passano i dati delle persone. Le altre consigliate
 * (sicurezza-auth su quasi tutto lib/ e app/api/) qui non contano: farebbero «a rischio» tutto.
 */
export const RISCHIO_DALLE_CONSIGLIATE = Object.freeze({
  "pagamenti-stripe": "soldi",
  "privacy-legale": "dati",
});
/**
 * Il rischio dai NOMI del percorso, dove la mappa non arriva. Un pezzo del percorso (fra / . - _ e
 * le maiuscole di CamelCase) che COMINCIA con una di queste radici accende il rischio. Vale solo per
 * i file che la mappa conosce: un file fuori perimetro (tests/…) resta fuori.
 * Il costo di un falso «a rischio» e' un collaudatore in piu'; quello di un falso «nessuno» e' un
 * fix sui soldi collaudato da uno solo. Per questo le radici sono larghe («ordin» prende anche
 * «ordinamento»): l'errore e' voluto dalla parte che costa meno.
 */
export const RISCHIO_DAI_NOMI = Object.freeze({
  soldi: ["stripe", "payout", "pagament", "payment", "checkout", "cassa", "cash", "rimbors", "refund", "fattur", "invoice",
    "commission", "wallet", "saldo", "ordin", "order", "annull", "incass", "prezz", "price", "coupon", "spesa", "spese", "spend"],
  dati: ["backup", "restore", "migrat", "migraz", "supabase", "database", "db", "sql", "esport", "export", "cancellaz",
    "delet", "elimin", "gdpr", "privacy", "consens", "consent", "utent", "users", "rls"],
  permessi: ["auth", "login", "logout", "sessio", "cookie", "admin", "middleware", "permess", "ruol", "role", "token",
    "password", "otp", "mfa", "kyc", "portiere"],
});

/**
 * Il rischio dal TESTO della scheda (titolo e impatto), dove ne' la mappa ne' i nomi arrivano. Le
 * radici qui sono STRETTE, al contrario di quelle dei nomi: nella prosa «ordinare», «utente»,
 * «account» e «costo» stanno in quasi ogni scheda, e con quelle tutto diventerebbe «a rischio» e il
 * dosaggio delle lenti non risparmierebbe piu' niente. Tarate sui 15 pacchetti «nessuno» del piano
 * del 15/10: accendono aiPatch («prezzo»), tettoSpesa («spesa»), la prova e2e della cassa («soldi»),
 * catalogBatch («cancella» il catalogo) e il sorvegliante degli incassi; lasciano «nessuno» la
 * Navbar («accessi», «costo»), la home («ordinare»), le pagine vuote («pagine» non e' «paga»).
 * «spesso» non e' «spesa»: per questo le radici sono «spesa»/«spese» e non «spes».
 */
export const RISCHIO_DAL_TESTO = Object.freeze({
  soldi: ["soldi", "prezz", "paga", "payment", "rimbors", "refund", "incass", "addebit", "commission", "fattur", "payout",
    "stripe", "checkout", "cassa", "spesa", "spese", "spend", "speso", "acquist", "scont", "iban", "bonific"],
  dati: ["cancell", "elimin", "sovrascriv", "backup", "ripristin", "migrazion", "gdpr", "privacy", "consens", "personali", "rls"],
  permessi: ["password", "session", "login", "autorizz", "permess", "otp"],
});

// ── il taglio, in byte veri ────────────────────────────────────────────────────────────────────

const byte = (s) => Buffer.byteLength(s, "utf8");
/** Quanto pesa un testo DENTRO il JSON: virgolette escluse, escape compresi (\n, \", \\). */
const pesoJson = (s) => byte(JSON.stringify(String(s))) - 2;
const PUNTINI = "…"; // 3 byte in UTF-8, e il JSON non lo scappa

/**
 * Taglia un testo perche' pesi al massimo `quota` byte nel JSON, puntini compresi. Taglia per punti
 * di codice, non per unita' UTF-16: una lettera accentata o un'emoji non si spezzano a meta'.
 */
export function tagliaTesto(testo, quota) {
  const s = String(testo ?? "");
  if (pesoJson(s) <= quota) return s;
  if (quota < byte(PUNTINI)) return "";
  let fuori = "";
  let peso = 0;
  for (const c of s) {
    const p = pesoJson(c);
    if (peso + p + byte(PUNTINI) > quota) break;
    fuori += c;
    peso += p;
  }
  return fuori.trimEnd() + PUNTINI;
}

const primoPieno = (scheda, campi) => {
  for (const c of campi) {
    const v = scheda?.[c];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return null;
};

/**
 * La scheda compatta che arriva alla squadra, entro `tetto` byte di JSON.
 *
 * Il taglio e' EQUO (max-min): i campi corti restano interi, e quello che avanza si divide fra i
 * lunghi. Tagliare sempre la descrizione per prima butterebbe via proprio il campo che spiega il
 * difetto; tagliare tutti della stessa percentuale accorcerebbe anche il titolo, che sta gia' stretto.
 */
/** Le sole coordinate file:riga di un «dove», nell'ordine e senza doppioni. */
export function soloCoordinate(dove) {
  return [...new Set(String(dove ?? "").match(RE_COORDINATA) || [])].join(" · ");
}

/** «dove» entro `quota` byte: intero se ci sta, poi le sole coordinate, e solo alla fine tagliato. */
export function doveCompatto(dove, quota) {
  const s = String(dove ?? "");
  if (pesoJson(s) <= quota) return s;
  return tagliaTesto(soloCoordinate(s) || s, quota); // le coordinate intere, se ci stanno, non si toccano
}

export function schedaCompatta(scheda, tetto = TETTO_SCHEDA) {
  const piena = { chiave: chiaveProblema(scheda) };
  for (const [nome, campi] of CAMPI_SCHEDA) {
    const v = primoPieno(scheda, campi);
    if (v !== null) piena[nome] = v;
  }
  if (byte(JSON.stringify(piena)) <= tetto) return piena;

  // Lo scheletro con i campi tagliabili vuoti: quello che resta del tetto e' il budget da dividere.
  // `tagliato: true` entra nel conto, cosi' il segnale non sfonda il tetto che dichiara.
  const tagliabili = Object.keys(piena).filter((k) => !INTOCCABILI.has(k) && k !== "dove");
  const scheletro = { ...piena, tagliato: true };
  for (const k of tagliabili) scheletro[k] = "";
  if (piena.dove !== undefined) {
    scheletro.dove = "";
    const quotaDove = Math.min(Math.floor(tetto * QUOTA_DOVE), Math.max(0, tetto - byte(JSON.stringify(scheletro))));
    scheletro.dove = doveCompatto(piena.dove, quotaDove);
  }
  let budget = tetto - byte(JSON.stringify(scheletro));
  const quota = {};
  const perPeso = [...tagliabili].sort((a, b) => pesoJson(piena[a]) - pesoJson(piena[b]));
  perPeso.forEach((k, i) => {
    const parte = Math.max(0, Math.floor(budget / (perPeso.length - i)));
    quota[k] = Math.min(pesoJson(piena[k]), parte);
    budget -= quota[k];
  });
  const fuori = {};
  for (const k of Object.keys(piena)) {
    fuori[k] = k === "dove" ? scheletro.dove : INTOCCABILI.has(k) ? piena[k] : tagliaTesto(piena[k], quota[k]);
  }
  fuori.tagliato = true;
  return fuori;
}

// ── i file del pacchetto ───────────────────────────────────────────────────────────────────────

// La STESSA espressione di pacchetti-lotto.mjs (RE_FILE): e' quella che ha deciso quali pacchetti
// stanno insieme in un'ondata, e il territorio di una squadra deve essere lo stesso insieme di file
// su cui la disgiunzione e' stata misurata. Non la importo perche' pacchetti-lotto.mjs gira appena
// lo si apre (e chiude il processo); la prova schede-pacchetto.test.mjs confronta le due righe e
// diventa rossa se divergono.
const RE_FILE = /[\w./@[\]-]+\.(tsx?|jsx?|sql|json|css|mjs|js|sh|md|ya?ml|svg|bats)/g;
const TETTO_CAMPO = 20_000;

/**
 * Le cartelle che nel registro fanno da radice del sito in un percorso assoluto: la copia del sito
 * (/home/user/mycity/…) e quella collegata dentro l'AD (/home/user/ad-mycity/marketplace/…).
 */
const RE_RADICE_SITO = /^\/(?:[^/]+\/)*?(?:mycity|mycity-live|marketplace)\/(.+)$/;
/** Le prime cartelle di un percorso assoluto che NON e' del sito: la macchina, non il codice. */
const RADICI_DEL_DISCO = new Set(["home", "root", "tmp", "srv", "var", "opt", "mnt", "usr", "etc", "users", "private"]);

/**
 * Un percorso citato nel registro, riportato alla radice del sito; null se non e' un file del sito.
 * Prima toglieva solo la prima barra: «/home/user/mycity/lib/x.ts» entrava nel territorio come
 * «home/user/mycity/lib/x.ts», e l'ondata 1 riceveva «home/user/ad-mycity/consegne/…», un file
 * dell'AD. Un assoluto sotto una radice del sito diventa relativo; uno sotto il disco (home/, tmp/…)
 * resta fuori; «/app/x.tsx», scritto con la barra davanti, e' del sito.
 */
export function percorsoDelSito(f) {
  const s = String(f ?? "").replace(/\\/g, "/");
  if (!s.startsWith("/")) return s.replace(/^(?:\.\/)+/, "").replace(/^marketplace\//, "");
  const m = s.match(RE_RADICE_SITO);
  if (m) return m[1];
  const primo = s.slice(1).split("/")[0].toLowerCase();
  return RADICI_DEL_DISCO.has(primo) ? null : s.slice(1);
}

/** I file con un percorso (un «page.tsx» nudo indirizza a decine di file e non conta). */
export function fileCitati(testo) {
  const grezzi = String(testo ?? "").slice(0, TETTO_CAMPO).match(RE_FILE) || [];
  const puliti = new Set();
  for (const f of grezzi) {
    const n = percorsoDelSito(f);
    if (n && n.includes("/")) puliti.add(n);
  }
  return [...puliti];
}

/** Il territorio: il file che da' il nome al pacchetto, poi quelli citati dalle sue schede. */
export function fileDelPacchetto(chiavePacchetto, schede) {
  const territorio = String(chiavePacchetto ?? "").replace(/\s*\(parte \d+ di \d+\)\s*$/, "").trim();
  const tutti = new Set();
  if (territorio && !territorio.startsWith("(") && fileCitati(territorio).length) tutti.add(territorio);
  for (const s of schede) for (const f of fileCitati(s?.file)) tutti.add(f);
  return [...tutti];
}

// ── rischio e lenti ────────────────────────────────────────────────────────────────────────────

/** La regola della mappa che decide un file (la prima che combacia, come in radiografia-in-corsa). */
function regolaDi(mappa, percorso) {
  if (!regolaPerFile(mappa, { repo: REPO_SITO, percorso })) return null; // fuori perimetro o senza regola
  return (mappa.regole || []).find((r) => (!r.repo || r.repo === REPO_SITO) && regolaCombacia(r, percorso)) || null;
}

/**
 * Le dimensioni della tabella del rischio che la mappa non conosce piu'. Vuoto = la tabella e' viva.
 * Una dimensione rinominata nella mappa farebbe dire «nessuno» a un pacchetto di pagamenti.
 */
export function dimensioniSconosciute(mappa, tabella = RISCHIO_DELLE_DIMENSIONI) {
  const note = new Set(mappa?.case?.[REPO_SITO]?.dimensioni || []);
  return Object.keys(tabella).filter((d) => !note.has(d));
}

/** I pezzi di un percorso, in minuscolo: «lib/auth/cookie-di-sessione.ts» → lib, auth, cookie, di, sessione, ts. */
export function pezziDelPercorso(percorso) {
  return String(percorso ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Il primo rischio che i nomi del percorso accendono, con la radice che l'ha acceso. */
export function rischioDalNome(percorso, tabella = RISCHIO_DAI_NOMI) {
  const pezzi = pezziDelPercorso(percorso);
  for (const r of ORDINE_RISCHIO) {
    for (const radice of tabella[r] || []) {
      const pezzo = pezzi.find((x) => x.startsWith(radice));
      if (pezzo) return { rischio: r, pezzo };
    }
  }
  return null;
}

/** Il primo rischio che il testo di una scheda accende (radici strette di RISCHIO_DAL_TESTO). */
export function rischioDalTesto(testo, tabella = RISCHIO_DAL_TESTO) {
  return rischioDalNome(testo, tabella);
}

/**
 * Il rischio di un pacchetto: dalle dimensioni delle sue schede, dai suoi file e dal testo delle
 * schede. Un file conta per tre strade: la sua lente obbligatoria nella mappa, le lenti che la mappa
 * gli consiglia (RISCHIO_DALLE_CONSIGLIATE), e i nomi del suo percorso (RISCHIO_DAI_NOMI) — tutte e
 * tre solo se la mappa lo conosce. Il testo (titolo e impatto, RISCHIO_DAL_TESTO) vale sempre: e'
 * la scheda che dice cosa si rompe. Vince il rischio piu' alto in ORDINE_RISCHIO.
 * @returns {{rischio: "soldi"|"dati"|"permessi"|"nessuno", perche: string[]}}
 */
export function rischioDi({ dimensioni = [], file = [], testi = [] } = {}, mappa = {}) {
  const visti = new Map(); // rischio -> motivi
  const segna = (r, motivo) => {
    if (!r) return;
    if (!visti.has(r)) visti.set(r, []);
    if (!visti.get(r).includes(motivo)) visti.get(r).push(motivo);
  };
  for (const d of dimensioni) segna(RISCHIO_DELLE_DIMENSIONI[d], `scheda di ${d}`);
  for (const f of file) {
    const r = regolaDi(mappa, f);
    if (!r) continue;
    segna(RISCHIO_DELLE_DIMENSIONI[r.dimensione], `${f} → ${r.dimensione}`);
    for (const c of r.consigliate || []) segna(RISCHIO_DALLE_CONSIGLIATE[c], `${f} → consigliata ${c}`);
    const n = rischioDalNome(f);
    if (n) segna(n.rischio, `${f} → nome «${n.pezzo}»`);
  }
  for (const t of testi) {
    const n = rischioDalTesto(t);
    if (n) segna(n.rischio, `scheda «${tagliaTesto(t, 48)}» → «${n.pezzo}»`);
  }
  const rischio = ORDINE_RISCHIO.find((r) => visti.has(r)) || "nessuno";
  return { rischio, perche: rischio === "nessuno" ? [] : visti.get(rischio).slice(0, 3) };
}

/** file → lente obbligatoria (la dimensione della sua regola). I file senza regola restano fuori. */
export function lentiPerFile(file, mappa) {
  const fuori = {};
  for (const f of file) {
    const r = regolaPerFile(mappa, { repo: REPO_SITO, percorso: f });
    if (r) fuori[f] = r.dimensione;
  }
  return fuori;
}

/** La lente del pacchetto: la dimensione piu' frequente fra le sue schede (ripiego del riesame). */
export function lenteDominante(schede) {
  const conta = new Map();
  for (const s of schede) if (s?.dimensione) conta.set(s.dimensione, (conta.get(s.dimensione) || 0) + 1);
  let meglio = null;
  for (const [d, n] of conta) if (!meglio || n > meglio[1]) meglio = [d, n];
  return meglio ? meglio[0] : "qa-flussi";
}

// ── il cuore: dall'ondata del piano agli args ──────────────────────────────────────────────────

/**
 * Prepara gli args di un'ondata. Funzione pura: piano, registro e mappa arrivano gia' letti.
 * @returns {{ok: true, args: object, conti: object} | {ok: false, motivo: string, mancanti?: object[]}}
 */
export function preparaOndata({ piano, registro, mappa, ondata, nomePiano = "", tetto = TETTO_SCHEDA }) {
  if (!piano || !Array.isArray(piano.ondate)) return { ok: false, motivo: "il piano non ha l'elenco «ondate»: non e' l'uscita di pacchetti-lotto.mjs --scrivi" };
  if (piano.registro && piano.registro !== "sito") return { ok: false, motivo: `il piano e' del registro «${piano.registro}», non del sito` };
  if (!Number.isInteger(ondata) || ondata < 1 || ondata > piano.ondate.length) {
    return { ok: false, motivo: `l'ondata ${ondata} non esiste: il piano ne ha ${piano.ondate.length} (si contano da 1)` };
  }
  if (!registro || !Array.isArray(registro.problemi)) return { ok: false, motivo: "il registro non ha l'elenco «problemi»: ha cambiato forma" };
  const sconosciute = dimensioniSconosciute(mappa);
  if (sconosciute.length) return { ok: false, motivo: `la mappa delle lenti non conosce piu' ${sconosciute.join(", ")}: la tabella del rischio va riallineata` };

  const perChiave = new Map();
  for (const s of registro.problemi) {
    const k = chiaveProblema(s);
    if (!perChiave.has(k)) perChiave.set(k, []);
    perChiave.get(k).push(s);
  }

  const mancanti = [];
  const pacchetti = [];
  const lenti = {};
  let giaChiusi = 0;
  for (const p of piano.ondate[ondata - 1] || []) {
    const trovate = [];
    const chiuse = [];
    for (const d of p?.difetti || []) {
      const s = perChiave.get(d?.chiave);
      if (!s) { mancanti.push({ pacchetto: p?.chiave, chiave: d?.chiave }); continue; }
      // Due schede con la stessa chiave non si sono mai viste (1.396 schede, 1.396 chiavi il 25/10):
      // se succede, la squadra riceve quella aperta, e l'ambiguita' si dichiara invece di sceglierne una a caso.
      if (s.length > 1 && !s.some((x) => x.stato === "aperto")) { chiuse.push({ chiave: d.chiave, stato: s[0].stato }); continue; }
      const scheda = s.find((x) => x.stato === "aperto") || s[0];
      if (scheda.stato !== "aperto") chiuse.push({ chiave: d.chiave, stato: scheda.stato });
      else trovate.push(scheda);
    }
    giaChiusi += chiuse.length;
    const file = fileDelPacchetto(p?.chiave, trovate.length ? trovate : []);
    const testi = trovate.map((s) => [primoPieno(s, ["titolo"]), primoPieno(s, ["impatto", "impatto_crescita"])].filter(Boolean).join(" · "));
    const { rischio, perche } = rischioDi({ dimensioni: trovate.map((s) => s.dimensione), file, testi }, mappa);
    Object.assign(lenti, lentiPerFile(file, mappa));
    const pac = {
      chiave: p?.chiave,
      file,
      rischio,
      perche_rischio: perche,
      lente: lenteDominante(trovate),
      difetti: trovate.map((s) => schedaCompatta(s, tetto)),
    };
    if (chiuse.length) pac.gia_chiusi = chiuse;
    pacchetti.push(pac);
  }
  if (mancanti.length) return { ok: false, motivo: `${mancanti.length} schede del piano non si ritrovano nel registro`, mancanti };

  const args = { piano: nomePiano, ondata, pacchetti, lenti_per_file: lenti };
  const conti = {
    pacchetti: pacchetti.length,
    schede: pacchetti.reduce((a, p) => a + p.difetti.length, 0),
    gia_chiusi: giaChiusi,
    tagliate: pacchetti.reduce((a, p) => a + p.difetti.filter((d) => d.tagliato).length, 0),
    a_rischio: pacchetti.filter((p) => p.rischio !== "nessuno").length,
    byte_args: byte(JSON.stringify(args)),
  };
  return { ok: true, args, conti };
}

// ── la riga di comando ─────────────────────────────────────────────────────────────────────────

const NOTI = new Set(["--piano", "--ondata", "--json", "--registro", "--tetto"]);
const CON_VALORE = new Set(["--piano", "--ondata", "--registro", "--tetto"]);

/** Gli argomenti, validati: un refuso esce 2, non diventa un'ondata sbagliata. */
export function leggiArgomenti(argv) {
  const o = { json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!NOTI.has(a)) return { errore: `«${a}» non e' un argomento che conosco (servono --piano <file> --ondata <N>, facoltativi --json --registro --tetto)` };
    if (a === "--json") { o.json = true; continue; }
    const v = argv[i + 1];
    if (CON_VALORE.has(a) && (v === undefined || v.startsWith("--"))) return { errore: `${a} vuole un valore dopo` };
    o[a.slice(2)] = v;
    i++;
  }
  if (!o.piano) return { errore: "manca --piano <file del piano scritto da pacchetti-lotto.mjs --scrivi>" };
  if (o.ondata === undefined) return { errore: "manca --ondata <N>" };
  const n = Number(o.ondata);
  if (!Number.isInteger(n) || n < 1) return { errore: `--ondata vuole un intero da 1 in su, non «${o.ondata}»` };
  o.ondata = n;
  if (o.tetto !== undefined) {
    const t = Number(o.tetto);
    if (!Number.isInteger(t) || t < TETTO_MINIMO) return { errore: `--tetto vuole un intero da ${TETTO_MINIMO} byte in su, non «${o.tetto}»` };
    o.tetto = t;
  } else o.tetto = TETTO_SCHEDA;
  return o;
}

function leggiJson(percorso) {
  try {
    return { j: JSON.parse(readFileSync(percorso, "utf8")) };
  } catch (e) {
    return { errore: e.message };
  }
}

const trova = (p) => {
  if (isAbsolute(p)) return p;
  const daQui = resolve(process.cwd(), p);
  return existsSync(daQui) ? daQui : join(ROOT, p);
};

function main() {
  const o = leggiArgomenti(process.argv.slice(2));
  const esci = (motivo, extra = []) => {
    console.error(`⚪ non ho preparato l'ondata: ${motivo}`);
    for (const r of extra) console.error(`   • ${r}`);
    process.exit(2);
  };
  if (o.errore) esci(o.errore);

  const filePiano = trova(o.piano);
  if (!existsSync(filePiano)) esci(`il piano ${o.piano} non esiste`);
  const piano = leggiJson(filePiano);
  if (piano.errore) esci(`non riesco a leggere il piano: ${piano.errore}`);
  const fileRegistro = trova(o.registro || REGISTRO_SITO);
  const registro = leggiJson(fileRegistro);
  if (registro.errore) esci(`non riesco a leggere il registro ${relative(ROOT, fileRegistro)}: ${registro.errore}`);
  const mappa = leggiJson(join(ROOT, MAPPA_LENTI));
  if (mappa.errore) esci(`non riesco a leggere la mappa delle lenti: ${mappa.errore}`);

  const nomePiano = filePiano.startsWith(ROOT + "/") ? relative(ROOT, filePiano) : filePiano;
  const e = preparaOndata({ piano: piano.j, registro: registro.j, mappa: mappa.j, ondata: o.ondata, nomePiano, tetto: o.tetto });
  if (!e.ok) {
    esci(e.motivo, (e.mancanti || []).slice(0, 40).map((m) => `${m.pacchetto}: ${m.chiave}`)
      .concat((e.mancanti || []).length > 40 ? [`e altre ${e.mancanti.length - 40}`] : []));
  }

  if (o.json) {
    console.log(JSON.stringify(e.args));
    process.exit(0);
  }
  const c = e.conti;
  console.log(`📦 Ondata ${o.ondata} di ${piano.j.ondate.length} · ${nomePiano}`);
  for (const p of e.args.pacchetti) {
    const rischio = p.rischio === "nessuno" ? "rischio nessuno" : `rischio ${p.rischio} (${p.perche_rischio[0]})`;
    const chiuse = p.gia_chiusi ? ` · ${p.gia_chiusi.length} gia' chiuse` : "";
    console.log(`  • ${p.chiave} — ${p.difetti.length} schede · ${p.file.length} file · ${rischio}${chiuse}`);
  }
  console.log(`${c.schede} schede trovate${c.gia_chiusi ? ` (+${c.gia_chiusi} gia' chiuse, fuori dalle squadre)` : ""} · ${c.tagliate} tagliate a ${o.tetto} byte · ${c.a_rischio} pacchetti su ${c.pacchetti} a rischio · args da ${c.byte_args} byte`);
  console.log(`Per il workflow: aggiungi --json e passa l'uscita come args.schede di ondata-sito.`);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
