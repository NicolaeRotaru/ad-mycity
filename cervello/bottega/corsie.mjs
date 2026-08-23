// 🛣️ LE CORSIE DELLA BOTTEGA — un negozio che va in loop non ferma gli altri quaranta.
//
// ─────────────────────────────────────────────────────────────────────────────
// PERCHÉ ESISTE
// ─────────────────────────────────────────────────────────────────────────────
// La BOTTEGA è una macchina sola per tutti i negozi. Il vantaggio è enorme — una miglioria si
// scrive una volta e la mattina dopo ce l'hanno tutti — e il prezzo è che la coda è condivisa. Con
// una coda in ordine d'arrivo basta un negozio che sbaglia per fermare tutti gli altri: mette
// dentro trenta lavori, o ne mette uno che va in loop, e i quaranta che hanno pagato il canone
// aspettano.
//
// `ARCHITETTURA-TRE-MACCHINE.md`, meccanismo ③: «Il worker prende i lavori A TURNO tra i negozi,
// non in ordine di arrivo. Ogni negozio ha la sua quota, il suo tetto di spesa e il suo
// interruttore». E meccanismo ⑥, guasto confinato: «Timeout, tentativi finiti, negozio in loop: si
// spegne quella corsia sola». Insieme sono la prova numero 3 del collaudo finale — «un negozio che
// va in loop non rallenta gli altri».
//
// Qui ci sono ③ e ⑥ insieme perché rispondono alla stessa domanda da due lati: *questo negozio può
// prendersi più di quello che gli spetta?* Il turno risponde sul tempo, il tetto sui soldi, il
// guasto confinato sul danno — e quest'ultimo è quello che spegne una corsia sola invece di tutte.
//
// La malattia non è ipotetica: `worker.sh` la porta scritta in cima al suo pezzo anti-veleno.
// «Il loop prende SEMPRE il lavoro in_attesa PIÙ VECCHIO (FIFO stretto)», e un lavoro avvelenato
// «restava in testa alla coda… tenendo bloccati TUTTI i lavori dietro». Con un padrone solo il
// rimedio è stato il dead-letter, che basta. Con quaranta padroni non basta più: il tempo perso è
// di qualcuno che paga un canone, e non è lo stesso di quello che l'ha causato.
//
// ─────────────────────────────────────────────────────────────────────────────
// LA FORMA: UNA FUNZIONE CHE NON PUÒ MENTIRE SUL TEMPO
// ─────────────────────────────────────────────────────────────────────────────
// Nessun orologio dentro, nessun caso: `prossimoLavoro` riceve lo stato e torna sempre la stessa
// risposta per lo stesso stato. Un turno che dipende da `Date.now()` non si può provare, e quello
// che non si prova si scopre in produzione — con quaranta negozi che aspettano.
//
// Il giro parte dall'ULTIMO negozio servito, non dal primo della lista. È la differenza fra un
// turno vero e un ordine di lista travestito da turno: senza quello, il primo dell'alfabeto
// prenderebbe sempre il lavoro appena la sua corsia si libera.
//
// 🟢 Modulo puro: nessun disco, nessuna rete, nessun database.
//
// Prova: node --test cervello/test/una-corsia-piena-non-ferma-le-altre.test.mjs

import { negozioDellaRiga } from "./lavoro.mjs";

/**
 * Sotto quanta parte del tetto si avvisa: a metà.
 *
 * La metà la chiede l'architettura («tetto mensile per negozio, avviso a metà strada, blocco
 * automatico»). Il freno costi che il CENTRO ha oggi NON lo fa: `costo-ai.mjs` ha due stati soli,
 * sotto soglia e sopra, e l'avviso a metà non esiste. Quindi qui non sto riusando una cosa che
 * c'è — la sto scrivendo per la prima volta, e vale la pena portarla anche al CENTRO.
 */
export const FRAZIONE_AVVISO = 0.5;

/**
 * ⑥ IL TETTO DI SPESA DI UN NEGOZIO — tre stati, non due.
 *
 * `ok` · `avviso` (metà tetto, si lavora ancora) · `stop` (si smette). Il terzo stato esiste perché
 * un tetto che passa da «tutto bene» a «bloccato» senza avvisare è un tetto che sorprende, e la
 * sorpresa la paga il negoziante che non capisce perché stamattina non risponde più niente.
 *
 * Un tetto assente NON è un tetto infinito: torna `stop` con il perché. Un negozio senza tetto
 * dichiarato è un negozio che può spendere quanto vuole, ed è la cosa che il freno esiste per
 * impedire. Meglio un negozio fermo che una bolletta senza fondo.
 */
export function statoSpesa({ speso = 0, tetto = null } = {}) {
  const s = Number(speso) || 0;
  if (!Number.isFinite(tetto) || tetto === null || tetto <= 0) {
    return { stato: "stop", puoLavorare: false, motivo: "questo negozio non ha un tetto di spesa dichiarato", frazione: null };
  }
  const frazione = s / tetto;
  if (s >= tetto) return { stato: "stop", puoLavorare: false, motivo: `tetto finito: ${s} su ${tetto}`, frazione };
  if (frazione >= FRAZIONE_AVVISO) {
    return { stato: "avviso", puoLavorare: true, motivo: `oltre metà del tetto: ${s} su ${tetto}`, frazione };
  }
  return { stato: "ok", puoLavorare: true, motivo: "", frazione };
}

/**
 * ⑥ IL GUASTO CONFINATO — si spegne quella corsia sola, non la macchina.
 *
 * «Timeout, tentativi finiti, negozio in loop: si spegne quella corsia sola. Il worker di oggi ha
 * già imparato a farlo sui lavori orfani — si riusa quella cura.»
 *
 * La cura del worker di oggi è il dead-letter: dopo N tentativi il lavoro esce dalla coda invece di
 * essere ripescato all'infinito. Funziona su UN lavoro. Qui serve un piano sopra: quando i guasti
 * sono di un NEGOZIO — non di un lavoro — è la sua corsia che va spenta, e solo la sua.
 *
 * Tre segnali, e ognuno spegne da solo:
 *   · `falliti` di fila oltre la soglia   → qualcosa in quel negozio è rotto, non è sfortuna
 *   · un lavoro `scaduto` (mai finito)    → è il caso del loop: consuma e non conclude
 *   · `spentoAMano`                       → l'interruttore, che vale sempre e batte tutto
 *
 * Torna sempre il perché. Una corsia spenta senza motivo è la chiamata di assistenza del lunedì
 * mattina, e «non lo so» costa più del freno.
 */
export const FALLITI_DI_FILA_PER_SPEGNERE = 3;

export function guastoConfinato({ falliti = 0, scaduti = 0, spentoAMano = false } = {}) {
  if (spentoAMano) return { spegni: true, motivo: "interruttore spento" };
  if (scaduti > 0) {
    return { spegni: true, motivo: `${scaduti} lavori scaduti senza finire: la corsia consuma e non conclude` };
  }
  if (falliti >= FALLITI_DI_FILA_PER_SPEGNERE) {
    return { spegni: true, motivo: `${falliti} lavori falliti di fila (soglia ${FALLITI_DI_FILA_PER_SPEGNERE}): non è sfortuna` };
  }
  return { spegni: false, motivo: "" };
}

/**
 * LA CORSIA DI UN NEGOZIO: può prendere un lavoro adesso, e se no perché.
 *
 * Il perché torna sempre, anche quando la risposta è sì. Una corsia ferma senza motivo è la
 * chiamata di assistenza del lunedì mattina, e la risposta «non lo so» costa più del freno.
 */
export function statoCorsia(negozio = {}, { inCorso = 0 } = {}) {
  const id = String(negozio.negozioId ?? "").trim();
  if (!id) return { negozioId: "", puoLavorare: false, motivo: "corsia senza negozio" };
  // Il guasto viene PRIMA di quota e tetto: se la corsia è rotta, dire «quota piena» sarebbe il
  // motivo sbagliato — quello che manda a cercare nel posto sbagliato.
  const guasto = guastoConfinato({
    falliti: negozio.falliti,
    scaduti: negozio.scaduti,
    spentoAMano: negozio.interruttore === "spento",
  });
  if (guasto.spegni) return { negozioId: id, puoLavorare: false, motivo: guasto.motivo, guasto };
  const quota = Number.isFinite(negozio.quota) && negozio.quota > 0 ? negozio.quota : 1;
  if (inCorso >= quota) {
    return { negozioId: id, puoLavorare: false, motivo: `quota piena: ${inCorso} lavori in corso su ${quota}` };
  }
  const spesa = statoSpesa({ speso: negozio.speso, tetto: negozio.tetto });
  if (!spesa.puoLavorare) return { negozioId: id, puoLavorare: false, motivo: spesa.motivo, spesa };
  return { negozioId: id, puoLavorare: true, motivo: "", spesa };
}

/**
 * ③ IL TURNO — il prossimo lavoro, preso a giro fra i negozi.
 *
 * Torna il lavoro scelto, oppure `null` col motivo per ogni corsia: quando la coda ha lavori e non
 * ne parte nessuno, la domanda vera non è «quale prendo» ma «perché nessuno». Un `null` muto
 * manderebbe a leggere i log; qui la risposta è dentro il verdetto.
 *
 * @param coda      i lavori in attesa, in ordine d'arrivo
 * @param negozi    le corsie: { negozioId, quota, tetto, speso, interruttore }
 * @param inCorso   quanti lavori sta già facendo ogni negozio: { "forno-a": 2 }
 * @param ultimo    l'ultimo negozio servito: il giro riparte da DOPO di lui
 */
export function prossimoLavoro({ coda = [], negozi = [], inCorso = {}, ultimo = null } = {}) {
  const corsie = negozi.map((n) => statoCorsia(n, { inCorso: Number(inCorso[String(n?.negozioId ?? "").trim()]) || 0 }));
  const ordine = daDopoIlUltimo(corsie.map((c) => c.negozioId).filter(Boolean), ultimo);
  const fermi = corsie.filter((c) => !c.puoLavorare).map((c) => ({ negozioId: c.negozioId, motivo: c.motivo }));

  for (const id of ordine) {
    const corsia = corsie.find((c) => c.negozioId === id);
    if (!corsia?.puoLavorare) continue;
    // Dentro la corsia di un negozio l'ordine è quello d'arrivo: il turno è FRA i negozi, non
    // dentro. Chi ha messo in coda prima, fra i suoi, parte prima.
    const lavoro = coda.find((l) => negozioDiLavoro(l) === id);
    if (lavoro) return { lavoro, negozioId: id, fermi };
  }
  return { lavoro: null, negozioId: null, fermi, motivo: motivoDelNulla(coda, corsie, fermi) };
}

/** Il negozio di un lavoro: sia quelli costruiti dalla porta sia le righe grezze della coda. */
function negozioDiLavoro(l) {
  if (l && typeof l.negozioId === "string" && l.negozioId.trim()) return l.negozioId.trim();
  return negozioDellaRiga(l);
}

/**
 * L'ordine del giro: si riparte da DOPO l'ultimo servito.
 *
 * Se `ultimo` non è nella lista — corsia appena chiusa, negozio nuovo — si riparte dal primo, che è
 * la cosa giusta: un ordine calcolato su un negozio che non c'è più non è un turno, è un caso.
 */
export function daDopoIlUltimo(ids, ultimo) {
  const i = ids.indexOf(ultimo);
  if (i < 0) return [...ids];
  return [...ids.slice(i + 1), ...ids.slice(0, i + 1)];
}

/** Perché non è partito niente: la risposta cambia il rimedio, quindi va detta. */
function motivoDelNulla(coda, corsie, fermi) {
  if (!coda.length) return "la coda è vuota";
  if (!corsie.length) return "nessuna corsia dichiarata: la coda ha lavori e non c'è nessun negozio che possa prenderli";
  if (fermi.length === corsie.length) return `tutte le corsie sono ferme: ${fermi.map((f) => `${f.negozioId} (${f.motivo})`).join(" · ")}`;
  return "le corsie libere non hanno lavori in coda";
}
