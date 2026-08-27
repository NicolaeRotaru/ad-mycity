// ⚪ NON MISURATO NON È OK — le decisioni condivise di una sola malattia.
//
// LA MALATTIA. Un controllo non riesce a guardare — gli manca il riferimento, l'ambiente, la
// chiave, il tempo — e chi lo legge riceve la stessa cosa che riceverebbe se avesse guardato e
// trovato tutto a posto. L'assenza di misura entra nel sistema travestita da rassicurazione.
//
// Le tre forme in cui si presenta, misurate il 13/8 su otto difetti aperti del cantiere:
//
//   ① NIENTE DA CONFRONTARE → VERDE. `forma-json.mjs` non trova JSON nel diff ed esce 0 ✅, anche
//      quando ce ne sono sul disco che nessuno ha guardato (AR-473). Il passo delle mutazioni del
//      cancello sparisce dall'elenco quando la lista dei toccati è vuota, e il verdetto finale resta
//      «SI PUÒ CONSEGNARE» (AR-473). `verifica-automazione.mjs` salta i controlli su systemd fuori
//      dal VPS e li conta come avvisi, uscendo 0 (AR-370).
//
//   ② UNA MISURA VECCHIA LETTA COME FRESCA. Un sensore scrive `ok` e quel valore resta vero per
//      sempre: «non misurato da 36 ore» e «misurato adesso e va bene» sono lo stesso identico dato
//      per ogni consumatore (AR-363, AR-364).
//
//   ③ UN'ETICHETTA NON RICONOSCIUTA CHE COMPRA IL VERDE. `esito === "incoerenze" ? … : "ok"` —
//      ogni esito nuovo, «cieco» compreso, cade nel ramo buono per costruzione (AR-646).
//
// PERCHÉ UN MODULO E NON OTTO PATCH. Ogni punto malato aveva la sua decisione scritta dentro di sé,
// dove nessun test poteva eseguirla senza far girare tutto il programma: è per questo che otto
// difetti diversi hanno sbagliato nello stesso modo senza che nessuno se ne accorgesse. Qui la
// decisione è una, pura, e i punti la chiamano.
//
// IL CONTRATTO DEI CODICI D'USCITA (AR-322, già in uso nel cancello): 0 = passato · 1 = violazione
// trovata · 2 = NON HO POTUTO MISURARE. Un guardiano che esce 0 quando non ha guardato non è
// ottimista: sta dicendo una cosa falsa a chi lo legge.
//
// 🟢 Nessun I/O, nessuna dipendenza, nessun programma che parte all'import (AR-445).

/** «Ho guardato e va bene.» */
export const OK = "ok";
/** «Non ho potuto guardare» — non è un verde e non è un rosso: è un buco, e va detto. */
export const CIECO = "cieco";
/** «Ho guardato e ho trovato una violazione.» */
export const ROTTO = "rotto";

/**
 * Il verdetto di un controllo a partire da COSA HA DAVVERO GUARDATO.
 *
 * Fail-closed: la sola combinazione che produce `ok` è «avevo qualcosa da misurare (o so che non
 * c'era niente) e l'ho misurato tutto senza trovare violazioni». Ogni altra strada porta a `cieco`.
 *
 * @param {object} p
 * @param {number} p.misurati quante cose ha davvero guardato.
 * @param {number|null} p.daMisurare quante ce n'erano da guardare; `null` = non lo sa.
 * @param {number} p.violazioni quante ne ha trovate storte.
 * @param {string[]} p.nonMisurati i motivi di ciò che è rimasto fuori, uno per riga. Basta uno solo
 *   perché il verdetto non possa più essere `ok`: la copertura parziale è cecità dichiarata.
 * @returns {{esito: "ok"|"cieco"|"rotto", codice: 0|1|2, perche: string, non_misurati: string[]}}
 */
export function verdettoCopertura({ misurati = 0, daMisurare = null, violazioni = 0, nonMisurati = [] } = {}) {
  const fuori = (nonMisurati || []).filter(Boolean).map(String);
  const quanti = Number(misurati) || 0;
  const attesi = daMisurare === null || daMisurare === undefined ? null : Number(daMisurare) || 0;

  // Una violazione TROVATA è un fatto, e vale anche se la copertura è parziale: aver visto poco non
  // rende meno vero ciò che si è visto. Il rosso vince sul ⚪, così un buco non diventa un modo di
  // far sparire un'accusa già formulata.
  if (violazioni > 0) return esito(ROTTO, `${violazioni} violazioni trovate`, fuori);

  if (fuori.length) return esito(CIECO, `${fuori.length} cose non le ho potute guardare`, fuori);

  // C'era roba e non ne ho guardata nessuna: è il caso di AR-473 ①, quello che oggi stampa ✅.
  if (attesi !== null && attesi > 0 && quanti === 0) {
    return esito(CIECO, `c'erano ${attesi} cose da guardare e non ne ho misurata nessuna`, fuori);
  }

  // Non so quanto c'era da guardare E non ho guardato niente: il default è la cecità, non il verde.
  // È la riga che rende il modulo fail-closed anche per chi lo chiama male.
  if (attesi === null && quanti === 0) {
    return esito(CIECO, "non ho misurato niente e non so se c'era qualcosa da misurare", fuori);
  }

  return esito(OK, attesi === 0 ? "non c'era niente da misurare" : `${quanti} cose misurate, nessuna storta`, fuori);
}

function esito(nome, perche, non_misurati) {
  return { esito: nome, codice: codiceUscita(nome), perche, non_misurati };
}

/**
 * Il codice d'uscita del contratto 0/1/2.
 *
 * Un esito che non conosco NON diventa 0: diventa 2. La stessa regola fail-closed di `segnaleDa`,
 * applicata al codice d'uscita — perché il modo più comodo di aggirare questo modulo sarebbe
 * passargli una stringa nuova e ritrovarsi il verde.
 */
export function codiceUscita(esito) {
  if (esito === OK) return 0;
  if (esito === ROTTO) return 1;
  return 2;
}

/**
 * L'esito di `verdettoSensori` (lib-sensori-verdetto.mjs) tradotto nel contratto 0/1/2 — AR-662.
 *
 * Quel verdetto ha tre etichette e NON sono le tre di qui: vanno tradotte, non ricopiate.
 *
 *   · `ok`            → ho misurato l'ambiente e almeno un sensore risponde                    → 0
 *   · `cieco`         → i sensori d'ambiente c'ERANO (chiavi presenti) e NESSUNO ha risposto.
 *                       Il guardiano ha guardato e ha trovato il guasto: è una violazione vera  → 1
 *   · `non_misurato`  → da questa sessione non c'era NIENTE di misurabile (nessuna chiave).
 *                       Non è un guasto della macchina: è un buco nel punto d'osservazione      → 2
 *
 * PERCHÉ `cieco` NON diventa 2, contro quello che proponeva la scheda di AR-662. Due ragioni, e la
 * seconda è quella che si paga:
 *   ① di significato — «le chiavi ci sono e nessun sensore risponde» è una misura riuscita che ha
 *      trovato una cosa storta, non una misura mancata;
 *   ② di conseguenza — `cervello/salute.mjs` giudica questo comando con `rossoSe: (c) => c === 1` e
 *      SENZA `ciecoSe`. Portando `cieco` a 2 quel controllo cadrebbe nel ramo buono e stamperebbe
 *      «almeno un sensore dati vede il marketplace» proprio nel caso in cui le chiavi ci sono e non
 *      vede niente nessuno. Cioè: curando il nome sbagliato di un rosso ci si comprerebbe un verde
 *      falso — la stessa malattia, spostata di un file.
 *
 * Fail-closed sulle etichette: una che non conosco non compra il verde, esce 2.
 */
export function codiceUscitaSensori(esitoSensori) {
  const tradotto = {
    ok: OK,
    cieco: ROTTO,
    non_misurato: CIECO,
  }[String(esitoSensori ?? "")];
  return codiceUscita(tradotto ?? CIECO);
}

// ─────────────────────────────────────────────────────────────────────────────
// ② La misura ha una scadenza
// ─────────────────────────────────────────────────────────────────────────────

/** Il timbro di casa: `AAAA-MM-GG HH:MM` (o con la T, o coi secondi), ora di Piacenza, senza fuso scritto. */
const TIMBRO_NUDO = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;

/**
 * Quanti minuti sono passati da un timbro, o `null` se il timbro non si sa leggere.
 *
 * Due formati, due strade, e la differenza conta:
 *   · un timbro con il fuso scritto (`Z` o `+02:00`) è un istante esatto → si sottrae e basta;
 *   · un timbro NUDO (`2026-08-13 22:16`) è l'ora di Piacenza scritta a parola. Confrontarlo con
 *     `Date.parse` lo farebbe leggere nel fuso del server, e su un VPS in UTC ogni misura
 *     sembrerebbe più fresca di 1-2 ore (è il difetto AR-647, in un altro punto). Qui si confronta
 *     con l'orologio da parete di Piacenza — la stessa scrittura, quindi lo stesso metro.
 *
 * Limite dichiarato: nelle due ore in cui cambia l'ora legale il confronto fra due orologi da parete
 * può sbagliare di 60 minuti. Su soglie da ore è rumore; su soglie da minuti non si usi il timbro nudo.
 *
 * @returns {number|null} minuti (può essere negativo se il timbro è nel futuro), `null` = illeggibile.
 */
export function etaMinuti(quando, adesso = new Date()) {
  const t = String(quando ?? "").trim();
  if (!t) return null;

  const nudo = t.match(TIMBRO_NUDO);
  if (nudo) {
    const oraDiCasa = oraDaParete(adesso);
    const mio = minutiDaParete(Number(nudo[1]), Number(nudo[2]), Number(nudo[3]), Number(nudo[4]), Number(nudo[5]));
    if (oraDiCasa === null || mio === null) return null;
    return Math.round(oraDiCasa - mio);
  }

  const ms = Date.parse(t);
  if (Number.isNaN(ms)) return null;
  return Math.round((adesso.getTime() - ms) / 60_000);
}

/** L'orologio da parete di Piacenza, in minuti dall'anno zero, per confrontarlo con un timbro nudo. */
function oraDaParete(adesso) {
  try {
    // `sv-SE` dà `AAAA-MM-GG HH:MM:SS`: è il formato ISO senza la T, cioè già la forma di casa.
    const s = adesso.toLocaleString("sv-SE", { timeZone: "Europe/Rome" });
    const m = s.match(TIMBRO_NUDO);
    if (!m) return null;
    return minutiDaParete(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]));
  } catch {
    return null;
  }
}

/** Minuti assoluti di un orologio da parete, senza fusi di mezzo: serve solo a fare la differenza. */
function minutiDaParete(anno, mese, giorno, ore, minuti) {
  const ms = Date.UTC(anno, mese - 1, giorno, ore, minuti);
  return Number.isNaN(ms) ? null : ms / 60_000;
}

/**
 * Una misura è scaduta?
 *
 * Fail-closed sul timbro: una misura SENZA data non si può dimostrare fresca, quindi è stantia.
 * È la riga che impedisce a un registro senza timbro di comprare il verde per sempre — che è
 * esattamente il modo in cui l'`ok` di un sensore MCP è rimasto vero per undici giorni (AR-364).
 *
 * @param {string|null|undefined} quando il timbro dell'ultima misura.
 * @param {number} sogliaMinuti oltre quanti minuti la misura non vale più.
 * @param {Date} adesso
 * @returns {{stantia: boolean, eta_min: number|null, perche: string}}
 */
export function misuraScaduta(quando, sogliaMinuti, adesso = new Date()) {
  const eta = etaMinuti(quando, adesso);
  if (eta === null) {
    return { stantia: true, eta_min: null, perche: quando ? `timbro illeggibile (${quando})` : "nessun timbro: non posso dimostrare che sia fresca" };
  }
  if (eta > sogliaMinuti) {
    return { stantia: true, eta_min: eta, perche: `misurata ${oreUmane(eta)} fa, il limite è ${oreUmane(sogliaMinuti)}` };
  }
  return { stantia: false, eta_min: eta, perche: `misurata ${oreUmane(Math.max(eta, 0))} fa` };
}

/** «135 minuti» detto come lo direbbe una persona. */
export function oreUmane(minuti) {
  const m = Math.round(Number(minuti) || 0);
  if (m < 60) return `${m} min`;
  const ore = Math.floor(m / 60);
  if (ore < 48) return `${ore}h${String(m % 60).padStart(2, "0")}`;
  return `${Math.floor(ore / 24)} giorni`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ③ Un'etichetta che non conosco non compra il verde
// ─────────────────────────────────────────────────────────────────────────────

// Il gemello di questa decisione per il Pannello sta in `pannello/src/lib/badge-coerenza.ts`: una
// pagina Next non può importare un `.mjs` del cervello, quindi la regola vive due volte. È una
// duplicazione DICHIARATA, non una svista — e ognuna delle due ha la sua prova.

/**
 * Traduce uno stato in un segnale con una mappa ESAUSTIVA.
 *
 * La forma malata è la catena di ternari: `stato === "critico" ? "errore" : stato === "sconosciuto"
 * ? "warn" : "ok"`. Sembra completa e non lo è — ogni stato che non hai nominato cade nell'ultimo
 * ramo, e l'ultimo ramo è quasi sempre il verde. È così che `attenzione` («runway sotto i sei mesi»)
 * arrivava al Pannello come «ok»: nessuno l'aveva scritto nella catena, e chi legge non ha modo di
 * accorgersene, perché un verde non chiede spiegazioni.
 *
 * Qui una chiave che non c'è nella mappa NON prende il ramo buono: prende `seNonSo`.
 *
 * @param {unknown} stato lo stato da tradurre.
 * @param {Record<string, string>} mappa tutte le chiavi che sai leggere, verde compreso.
 * @param {string} seNonSo cosa dire di una chiave che non conosci. Mai «ok».
 */
export function segnaleDa(stato, mappa, seNonSo = "warn") {
  const k = stato === null || stato === undefined ? "" : String(stato);
  return Object.hasOwn(mappa || {}, k) ? mappa[k] : seNonSo;
}

// ─────────────────────────────────────────────────────────────────────────────
// ④ Chi non ha potuto guardare non cancella chi aveva guardato
// ─────────────────────────────────────────────────────────────────────────────
//
// La quarta forma, ed è quella che costa di più (AR-337, AR-568). Un file di stato condiviso tiene
// insieme due generi che sembrano uno solo:
//   · ciò che si MISURA DA FUORI  — ordini, incassi, sensori: si vede solo da dove ci sono le chiavi;
//   · ciò che si RICORDA DI SÉ    — tick, cosa ho già accodato, storia: si sa sempre, ovunque.
// Una guardia sola non può servirli entrambi. «Non scrivo niente» fa ri-accodare le stesse card a
// ogni tick (si cura una bugia creandone una peggiore); «scrivo tutto» fa sì che una sessione senza
// chiavi riscriva a `null` i numeri che il VPS aveva misurato davvero. La cura è separarli DENTRO la
// scrittura: la memoria di sé va sempre, i campi misurati da fuori restano di chi li ha misurati.

/** Il campo che dice, dentro il dato stesso, «questi valori non li ho misurati io». */
export const MARCA_NON_MISURATO = "non_misurato_in_questo_ambiente";

/**
 * Fonde la misura nuova con quella già scritta, tenendo per sé SOLO ciò che ha potuto misurare.
 *
 * @param {object|null|undefined} prima  lo stato già sul disco (di chi le chiavi ce le aveva).
 * @param {object} misura                i campi appena calcolati in questa esecuzione.
 * @param {object} p
 * @param {boolean} p.misurato   il dominio era davvero misurabile da qui (chiavi presenti)?
 * @param {string[]} p.campi     i nomi dei campi che dipendono da quel dominio: gli unici che questa
 *                               esecuzione ha il diritto di sovrascrivere, e solo se ha misurato.
 * @param {string} p.quando      il timbro di questa esecuzione, per dire QUANDO si è stati ciechi.
 * @param {string} p.motivo      che cosa mancava, in parole umane.
 * @returns {object} il documento da scrivere.
 */
export function conservaSeCieco(prima, misura, { misurato, campi = [], quando = "", motivo = "" } = {}) {
  const fuori = { ...(misura || {}) };
  if (misurato) {
    // Chi ha misurato davvero ripulisce anche la marca lasciata dai ciechi che sono passati prima.
    delete fuori[MARCA_NON_MISURATO];
    return fuori;
  }
  for (const c of campi) {
    // `hasOwn` e non un `??`: un `null` misurato davvero (zero ordini letti come nulli) è un valore,
    // e va conservato. Se il campo non c'era proprio, resta quello che la misura cieca ha messo —
    // di solito `null`, che è la verità: nessuno l'ha mai visto.
    if (prima && Object.hasOwn(prima, c)) fuori[c] = prima[c];
  }
  fuori[MARCA_NON_MISURATO] = `${quando}: ${motivo}`.trim();
  return fuori;
}

/**
 * Da DOVE è stata presa una misura. Serve a leggere un file di stato e sapere se chi l'ha scritto
 * poteva vedere: `vps` (le chiavi ce le ha) · `cloud` (sessione dell'agente, quasi sempre cieca) ·
 * `locale` (la macchina di casa). Senza questo campo una misura è anonima, e una misura anonima non
 * si può confrontare con nessuna.
 */
export function origineMisura(env = process.env) {
  if (env.MYCITY_ORIGINE) return String(env.MYCITY_ORIGINE);
  if (env.VPS === "1" || env.MYCITY_VPS === "1") return "vps";
  if (env.CLAUDE_CODE_REMOTE || env.CODESPACES || env.CI) return "cloud";
  return "locale";
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-859 — IL LATO PRODUTTORE: chi non ha nemmeno un 2 da perdere.
//
// `vincoli-senza-cieco.mjs` (AR-843) guarda il lato CONSUMATORE: i blocchi di `giro.sh` che si
// compongono un vincolo a mano senza trattare il cieco. Ma la sua condizione ② pretende che il
// guardiano dichiari un'uscita 2 nel proprio sorgente — quindi gli attrezzi che il 2 non ce l'hanno
// affatto gli sono INVISIBILI per costruzione. Sono proprio quelli messi peggio: il loro ramo del
// cieco esce 1, cioe' la stessa cosa che dicono quando hanno guardato e trovato un problema vero.
//
// Da fuori i due stati non si distinguono. Chi legge va a riparare il problema sbagliato: cerca la
// violazione che il guardiano avrebbe trovato, e invece il guardiano non ha guardato niente.
//
// Il contratto e' scritto qui sopra e ha tre anni di casa dietro (AR-322): 0 passato · 1 violazione
// · 2 NON HO POTUTO MISURARE. Questi lo violano.

/** Le parole con cui un ramo dichiara di non aver potuto guardare. */
// Le frasi vere variano: «STATO.md non trovato», ma anche «il registro non e' stato trovato». Un
// metro che pretende le due parole attaccate perde la seconda — ed e' la stessa forma di difetto che
// AR-375 racconta, quindi qui si tollerano fino a tre parole in mezzo.
export const PAROLE_DEL_CIECO = /non\s+(?:\S+\s+){0,3}trovat|assente|CIECO|cieco|non esiste|vuoto|non c'e/i;

/**
 * Un sorgente confonde ⚪ e ❌? Funzione PURA: entra il testo di un programma, esce il giudizio.
 *
 * Confonde quando tutt'e due sono vere:
 *   · ha un ramo che dichiara di non aver misurato e da li' esce **1**;
 *   · usa **1** anche per dire «ho guardato e ho trovato un problema».
 *
 * Non conta il ramo di `catch`: un programma che crepa esce 1 ed e' giusto cosi', non e' un cieco.
 */
export function confondeCiecoEdErrore(sorgente = "") {
  const righe = String(sorgente).split("\n");
  let ciecoEsceUno = null;
  let unoEAncheVerdetto = false;
  righe.forEach((riga, i) => {
    const m = riga.match(/process\.exit\(([^)]*)\)/);
    if (!m) return;
    const arg = m[1].trim();
    const contesto = righe.slice(Math.max(0, i - 6), i + 1).join(" ");
    const cieco = PAROLE_DEL_CIECO.test(contesto);
    const dentroUnCatch = /catch\s*\(|\.catch\(/.test(contesto);
    if (cieco && arg === "1") ciecoEsceUno = i + 1;
    if (/\?/.test(arg) && /\b1\b/.test(arg)) unoEAncheVerdetto = true;
    else if (arg === "1" && !cieco && !dentroUnCatch) unoEAncheVerdetto = true;
  });
  return { confonde: Boolean(ciecoEsceUno && unoEAncheVerdetto), riga: ciecoEsceUno };
}
