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
// Nessun import: si esegue in un test senza toccare disco, rete o vault.

/** Le provenienze possibili di un numero su cui si decide. */
export const FONTI = {
  REST: "rest", // letto dal database del marketplace — la fonte-di-verità
  MISURA: "misura", // contatore scritto da uno strumento della macchina (costo-ai.json)
  BASELINE: "baseline", // un file di memoria scritto dall'AD (la tabella di STATO.md)
  PROSA: "prosa", // estratto con una regex da un testo discorsivo ← mai per un gate
  ASSENTE: "assente", // il numero non c'è ← mai per un gate
};

/** Le due provenienze che un gate hard non può usare per emettere un verdetto. */
export const FONTI_VIETATE_PER_GATE = [FONTI.PROSA, FONTI.ASSENTE];

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
export function tokenPerGate(oggi) {
  const reali = leggiContatore(oggi, "token_totali");
  const stimati = leggiContatore(oggi, "token_stimati");
  if (reali.fonte === FONTI.ASSENTE && stimati.fonte === FONTI.ASSENTE) {
    return { valore: null, fonte: FONTI.ASSENTE, reali: null, stimati: null };
  }
  const r = reali.valore ?? 0;
  const s = stimati.valore ?? 0;
  return { valore: Math.max(r, s), fonte: FONTI.MISURA, reali: r, stimati: s };
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
