// AR-196 / AR-279 — da dove viene il numero su cui un freno decide.
//
// Due freni bloccanti, una sola malattia: **un numero che non c'è si traveste da numero misurato.**
//
//   AR-196 — il freno sui costi confronta `.oggi.token_totali // 0` con la soglia. Quel campo è 0 per
//     costruzione (ogni registrazione passa con --stima, e le stime stanno in un contatore separato per
//     onestà della misura, AR-043). Il `// 0` di jq trasforma «campo assente» in «zero token spesi».
//     Misurato il 27/7: 0 reali per SEI giorni di fila, 385.000 stimati nel solo 27/7, soglia 2.000.000.
//     Il freno confronta 0 con 2.000.000 e non scatta mai. È l'unica difesa contro un loop di rilanci
//     sulla voce di costo più grande dell'azienda (Claude 200 €/mese = 66% del burn).
//
//   AR-279 — il freno sul business estrae i giorni di stallo con una regex da una frase di STATO.md,
//     scritta dall'AD stessa. Misurato il 27/7 alle 01:06: il guardiano legge «9 ore» → 0,4 giorni →
//     sotto la soglia di 3 → **esce 0, via libera**, mentre la riga più in alto dello stesso file dice
//     «stallo 33 giorni». È un giudizio circolare: la macchina si valuta su un numero che ha scritto lei.
//
// La regola che li unisce: **un freno dichiara da dove viene il numero, e un buco non è uno zero.**
// Cosa succede al buio dipende dal freno, e i due sono OPPOSTI — perciò la regola non può essere
// «al buio blocca» né «al buio lascia passare»:
//
//   · freno del business — al buio resta CHIUSO. Non dare via libera costa un giro di lavoro; darla a
//     torto è quello che è successo per sette giorni con 107 merge e zero ordini.
//   · freno dei costi — al buio NON ferma la macchina (sarebbe un blocco totale su un campo mancante)
//     ma nemmeno dice «sotto soglia»: dichiara di non vedere, e il giro riceve un vincolo visibile.
//     È il contratto del guardiano cieco già in casa (AR-322: 0 passato · 1 bocciato · 2 cieco).
//
// Nessun accesso a disco, rete o vault: si esegue in un test senza preparare niente. L'unico import
// è `finestra-misura.mjs` (a sua volta puro), che risponde alla domanda gemella di questa: qui si
// dichiara DA DOVE viene un numero, lì DI QUANDO è e DI QUANTO parla.

import { bucketScaduto, FINESTRA } from "./finestra-misura.mjs";

/** Le provenienze possibili di un numero su cui si decide. */
export const FONTI = {
  REST: "rest", // letto dal database del marketplace — la fonte-di-verità
  MISURA: "misura", // contatore scritto da uno strumento della macchina (costo-ai.json)
  BASELINE: "baseline", // un file di memoria scritto dall'AD (la tabella di STATO.md)
  PROSA: "prosa", // estratto con una regex da un testo discorsivo ← mai per un gate
  ASSENTE: "assente", // il numero non c'è ← mai per un gate
  SCADUTA: "scaduta", // misura vera, ma di un giorno che è finito ← mai per un gate (AR-424)
};

/** Le provenienze che un gate hard non può usare per emettere un verdetto. */
export const FONTI_VIETATE_PER_GATE = [FONTI.PROSA, FONTI.ASSENTE, FONTI.SCADUTA];

/**
 * AR-279 ④ — ogni guardiano che produce un verdetto dichiara da dove viene il numero, e un gate hard
 * non può reggersi su una frase o su un campo mancante.
 */
export function gateAmmesso(fonte) {
  const f = String(fonte ?? "").trim();
  if (!f) return { ammesso: false, motivo: "fonte del numero non dichiarata: un gate senza provenienza non è una misura" };
  if (f === FONTI.PROSA)
    return { ammesso: false, motivo: "numero estratto da una frase: il verdetto dipenderebbe da come è scritto un testo, non dai fatti" };
  if (f === FONTI.ASSENTE)
    return { ammesso: false, motivo: "numero assente: un buco non è uno zero" };
  if (f === FONTI.SCADUTA)
    return { ammesso: false, motivo: "misura di un giorno già finito: un contatore fermo a ieri non dice niente su oggi" };
  return { ammesso: true, motivo: `fonte «${f}» ammessa` };
}

/**
 * Legge un contatore distinguendo **0 misurato** da **campo assente**. È la differenza che il `// 0`
 * di jq e il `|| 0` di JavaScript cancellano, ed è tutto il difetto AR-196.
 */
export function leggiContatore(oggetto, campo) {
  const v = oggetto == null ? undefined : oggetto[campo];
  if (typeof v === "number" && Number.isFinite(v)) return { valore: v, fonte: FONTI.MISURA };
  return { valore: null, fonte: FONTI.ASSENTE };
}

/**
 * Il numero su cui il freno dei costi deve decidere: il PIÙ ALTO fra reali e stimati.
 * Finché nessuna chiamata passa un conteggio reale (oggi: nessuna), sono le stime a dover far scattare
 * l'allarme — meglio un margine di errore dichiarato che un freno che non frena mai.
 */
export function tokenPerGate(oggi, dataDiOggi = null) {
  const reali = leggiContatore(oggi, "token_totali");
  const stimati = leggiContatore(oggi, "token_stimati");
  if (reali.fonte === FONTI.ASSENTE && stimati.fonte === FONTI.ASSENTE) {
    return { valore: null, fonte: FONTI.ASSENTE, reali: null, stimati: null };
  }

  // AR-424 (c) — DI CHE GIORNO È QUESTO NUMERO?
  // Il contatore si azzera a mezzanotte, ma il blocco `oggi` resta quello dell'ultimo giro fatto:
  // finché nessuno gira, `oggi` è ieri. Misurato il 29/7: `oggi.data` valeva 2026-07-28 con
  // `token_totali: 0`, e il freno rispondeva «lascia, 0 token sotto la soglia di 2.000.000» — cioè
  // dava via libera alla spesa sulla base di un giorno già finito. Uno zero vecchio non è un
  // consumo basso, è nessuna informazione sul consumo di adesso.
  // Il confronto si fa solo se chi chiama dichiara la data di oggi: la funzione resta pura e i test
  // possono metterla in entrambe le condizioni senza dipendere dall'orologio.
  //
  // AR-368 — la domanda «di che giorno è questo secchio?» adesso ha UNA casa sola
  // (`finestra-misura.mjs → bucketScaduto`), perché non è una domanda del solo freno sui costi: ogni
  // altro consumatore dello stesso secchio (il letargo, il Pannello) se la riscriveva a modo suo, e
  // chi se la dimenticava leggeva ieri credendo di leggere oggi.
  //
  // ⚠️ La riga della condizione resta scritta per esteso di proposito: è l'ancora della mutazione di
  // AR-424 in `mutanti.json` («il freno torna a non guardare di che giorno è il contatore»).
  // Riscriverla come `if (finestra.scaduto)` spegnerebbe quel freno senza che nessuno se ne accorga.
  const suo = String(oggi?.data ?? "").trim();
  const finestra = bucketScaduto(oggi, dataDiOggi);
  if (dataDiOggi && suo && suo !== String(dataDiOggi).trim()) {
    return {
      valore: null,
      fonte: FONTI.SCADUTA,
      reali: null,
      stimati: null,
      giorno: finestra.giorno,
      atteso: finestra.atteso,
      motivo_finestra: finestra.motivo,
    };
  }

  // AR-368 (b) — IL SECCHIO SENZA DATA. Il caso che mancava: se chi chiama dichiara che giorno è
  // oggi e il secchio non dice di quando è, prima si tirava dritto e il numero veniva usato come se
  // fosse di adesso. Un contatore che non sa dichiarare il proprio giorno non è un contatore basso:
  // è un contatore di cui non so niente, e vale la stessa risposta del buco (AR-322: cieco, non 0).
  if (dataDiOggi && finestra.esito === FINESTRA.ASSENTE) {
    return {
      valore: null,
      fonte: FONTI.ASSENTE,
      reali: null,
      stimati: null,
      giorno: finestra.giorno,
      atteso: finestra.atteso,
      motivo_finestra: finestra.motivo,
    };
  }

  const r = reali.valore ?? 0;
  const s = stimati.valore ?? 0;

  // AR-424 (d) — un giorno con ZERO run non è una misura, è un foglio bianco.
  // `runs: 0` significa che la macchina non ha ancora girato oggi: i due contatori valgono 0 perché
  // nessuno ha consumato niente ANCORA, non perché il consumo sia basso. Farne un «lascia» è dare
  // il permesso di spendere basandosi sul fatto che non si è ancora speso — che è la stessa forma
  // di ragionamento del buco letto come zero.
  const runs = leggiContatore(oggi, "runs");
  if (runs.fonte === FONTI.MISURA && runs.valore === 0 && r === 0 && s === 0) {
    return { valore: null, fonte: FONTI.ASSENTE, reali: 0, stimati: 0, giorno: suo, motivo_vuoto: "nessun run registrato oggi" };
  }

  return { valore: Math.max(r, s), fonte: FONTI.MISURA, reali: r, stimati: s, giorno: suo };
}

/**
 * Il freno sui costi. Tre esiti, non due: al buio non dice «sotto soglia».
 * @returns {{azione: "frena"|"lascia"|"cieco", motivo: string}}
 */
export function decidiFrenoCosto({ valore = null, fonte = FONTI.ASSENTE, soglia = 0 } = {}) {
  const s = Number(soglia);
  if (!Number.isFinite(s) || s <= 0)
    return { azione: "cieco", motivo: "soglia non configurata: senza tetto non esiste un superamento" };
  const { ammesso, motivo } = gateAmmesso(fonte);
  if (!ammesso) return { azione: "cieco", motivo };
  const v = Number(valore);
  if (!Number.isFinite(v)) return { azione: "cieco", motivo: "numero non leggibile" };
  if (v > s) return { azione: "frena", motivo: `${v} token oltre la soglia di ${s}` };
  return { azione: "lascia", motivo: `${v} token sotto la soglia di ${s}` };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-442 — IL CONTATORE SI AZZERA A MEZZANOTTE, LA SPESA NO.
// ─────────────────────────────────────────────────────────────────────────────
// Il lotto 34 aveva già tolto la bugia («cieco» invece di «lascia» su un contatore di ieri) e il
// lotto 40 aveva costruito il numero giusto — `sessione_rolling.token_sessione_rolling`, una coda
// continua potata dalla finestra e non dal calendario. Restava il pezzo che chiude il titolo del
// difetto: **chi frena guardava ancora il solo giorno solare.** Alle 00:10 la macchina poteva aver
// bruciato l'intera quota fra le 18 e le 24, il conto del giorno ripartiva da 1.000 e il freno
// diceva «lascia». Il numero c'era nel file e non lo guardava nessuno.
//
// Due tetti distinti, e vince il più severo: il giorno e la finestra scorrevole. Basta che UNO dei
// due sia superato perché si freni — è la (b) del fix proposto sulla scheda.

/**
 * Il numero della finestra scorrevole, con la sua provenienza.
 *
 * La stessa disciplina del contatore del giorno (AR-424): una misura che non si aggiorna da più
 * della finestra stessa non è una spesa bassa, è una misura **scaduta**. Senza questa riga il freno
 * di sessione si spegnerebbe da solo il giorno in cui costo-ai smettesse di girare — cioè
 * esattamente quando serve.
 *
 * @param {object} sessione il blocco `sessione_rolling` di costo-ai.json
 * @param {number} adessoMs l'istante, passato da fuori: la funzione resta pura
 * @param {(t:string)=>number} msDa come si legge un timbro «AAAA-MM-GG HH:MM» (iniettato)
 */
export function tokenSessionePerGate(sessione, adessoMs, msDa) {
  const letto = leggiContatore(sessione, "token_sessione_rolling");
  if (letto.fonte === FONTI.ASSENTE) {
    return { valore: null, fonte: FONTI.ASSENTE, motivo: "nessun conto della finestra scorrevole nel file" };
  }
  const finestraMin = Number(sessione?.finestra_min);
  const t = typeof msDa === "function" ? msDa(sessione?.aggiornato) : NaN;
  if (Number.isFinite(adessoMs) && Number.isFinite(finestraMin) && finestraMin > 0) {
    if (!Number.isFinite(t)) {
      return { valore: null, fonte: FONTI.ASSENTE, motivo: "la finestra scorrevole non dice di quando è" };
    }
    if (adessoMs - t > finestraMin * 60 * 1000) {
      return {
        valore: null,
        fonte: FONTI.SCADUTA,
        motivo: `il conto della finestra è fermo a ${sessione?.aggiornato}, più vecchio della finestra stessa (${finestraMin} min)`,
      };
    }
  }
  return { valore: letto.valore, fonte: FONTI.MISURA, motivo: "" };
}

/**
 * Il freno sui costi con DUE tetti: il giorno solare e la finestra scorrevole.
 * Vince il più severo. Cieco solo se non vede né l'uno né l'altro — se una gamba vede e l'altra no,
 * si decide con quella che vede e la cecità dell'altra si DICHIARA, non si tace.
 *
 * @returns {{azione:"frena"|"lascia"|"cieco", motivo:string, giorno:object, sessione:object}}
 */
export function decidiFrenoCostoDoppio({ giorno = {}, sessione = {} } = {}) {
  const g = decidiFrenoCosto(giorno);
  const s = decidiFrenoCosto(sessione);
  const eti = { giorno: "nel giorno", sessione: "nelle ultime ore" };
  const dettaglio = { giorno: g, sessione: s };
  if (g.azione === "frena" || s.azione === "frena") {
    const quali = [
      g.azione === "frena" ? `${eti.giorno}: ${g.motivo}` : null,
      s.azione === "frena" ? `${eti.sessione}: ${s.motivo}` : null,
    ].filter(Boolean);
    return { azione: "frena", motivo: quali.join(" · "), ...dettaglio };
  }
  if (g.azione === "cieco" && s.azione === "cieco") {
    return { azione: "cieco", motivo: `nessuno dei due tetti è misurabile — ${eti.giorno}: ${g.motivo} · ${eti.sessione}: ${s.motivo}`, ...dettaglio };
  }
  const cieca = g.azione === "cieco" ? `⚪ ${eti.giorno}: ${g.motivo}` : s.azione === "cieco" ? `⚪ ${eti.sessione}: ${s.motivo}` : "";
  const viste = [g.azione === "lascia" ? `${eti.giorno}: ${g.motivo}` : null, s.azione === "lascia" ? `${eti.sessione}: ${s.motivo}` : null].filter(Boolean);
  return { azione: "lascia", motivo: [viste.join(" · "), cieca].filter(Boolean).join(" · "), ...dettaglio };
}

/** Giorni interi fra un istante ISO e adesso. `null` se la data non si legge. */
export function giorniDa(iso, adessoMs) {
  const t = Date.parse(String(iso ?? ""));
  if (!Number.isFinite(t)) return null;
  const ora = Number.isFinite(+adessoMs) ? +adessoMs : null;
  if (ora == null) return null;
  return Math.floor((ora - t) / 86_400_000);
}

/**
 * Il freno sul business. Lo stallo si misura da un CONTEGGIO e da un TIMESTAMP, mai da una frase.
 *
 * Il caso che conta di più è anche il più semplice: **zero ordini pagati non ha bisogno di un
 * timestamp**. Se non ne è mai stato pagato uno, lo stallo è totale per definizione — ed è esattamente
 * lo stato reale dal 24/6. Il vecchio guardiano ci arrivava passando da una regex su un testo, e la
 * regex prendeva la frase sbagliata.
 *
 * @returns {{stallo: boolean, giorni: number|null, gate: "aperto"|"chiuso"|"cieco", fonte: string, motivo: string}}
 */
export function decidiStallo({
  ordiniPagati = null,
  ultimoPagatoIso = null,
  adessoMs = null,
  sogliaGiorni = 3,
  fonte = FONTI.ASSENTE,
} = {}) {
  const { ammesso, motivo } = gateAmmesso(fonte);
  if (!ammesso) return { stallo: true, giorni: null, gate: "cieco", fonte: FONTI.ASSENTE, motivo };

  const n = Number(ordiniPagati);
  if (!Number.isFinite(n))
    return { stallo: true, giorni: null, gate: "cieco", fonte, motivo: "conteggio ordini pagati non leggibile" };

  if (n === 0)
    return {
      stallo: true,
      giorni: null,
      gate: "chiuso",
      fonte,
      motivo: "nessun ordine pagato: lo stallo è totale, non serve nessun timestamp",
    };

  const giorni = giorniDa(ultimoPagatoIso, adessoMs);
  if (giorni == null)
    return {
      stallo: true,
      giorni: null,
      gate: "cieco",
      fonte,
      motivo: `${n} ordini pagati ma nessuna data leggibile dell'ultimo: non so da quanto siamo fermi`,
    };

  const soglia = Number(sogliaGiorni);
  const oltre = Number.isFinite(soglia) && giorni >= soglia;
  return {
    stallo: oltre,
    giorni,
    gate: oltre ? "chiuso" : "aperto",
    fonte,
    motivo: oltre
      ? `ultimo ordine pagato ${giorni} giorni fa (soglia ${soglia})`
      : `ultimo ordine pagato ${giorni} giorni fa: sotto la soglia di ${soglia}`,
  };
}

/** Il codice d'uscita di un guardiano, secondo il contratto AR-322. */
export function codiceUscita(gate) {
  if (gate === "aperto") return 0;
  if (gate === "chiuso") return 1;
  return 2;
}
