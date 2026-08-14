// 🛡️ IL BADGE DELLA MEMORIA COERENTE — e perché non può più comprare il verde.
//
// AR-646. La riga era questa, dentro la rotta:
//
//     esito: cf.esito === "incoerenze" ? "incoerenze" : "ok"
//
// Il ramo buono era il DEFAULT. Quindi ogni etichetta che il guardiano ha imparato a scrivere dopo
// — «cieco» (AR-597: il registro dei fatti non c'è, non ho potuto guardare) e «non_verificato»
// (AR-211: ho aperto zero file) — arrivava a Nicola come lo scudo verde «Memoria coerente». La cosa
// peggiore che possa fare una superficie: dire che va tutto bene proprio quando non ha guardato.
//
// La cura non è aggiungere un `else if` per i due nomi noti: è che il default sia il buco. Un'etichetta
// che questo file non conosce diventa «sconosciuto», che si mostra come ⚪ — mai come ✅. Così il
// giorno che il guardiano ne inventerà una terza, il Pannello dirà «non lo so» invece di mentire.
//
// Pura e senza dipendenze: la prova la esegue senza montare React né chiamare la rotta.

/** Gli stati che questa superficie sa disegnare. Tutto il resto è «sconosciuto». */
export type StatoCoerenza = "ok" | "incoerenze" | "cieco" | "non_verificato" | "sconosciuto";

/** Le etichette che il guardiano `cervello/coerenza-fatti.mjs` scrive davvero nel suo report. */
const NOTI: StatoCoerenza[] = ["ok", "incoerenze", "cieco", "non_verificato"];

/**
 * Normalizza l'esito letto dal report del guardiano.
 *
 * Fail-closed: se non è una delle etichette che sappiamo leggere, è `sconosciuto`. Non è un rosso
 * (non abbiamo trovato niente di storto) e non è un verde (non abbiamo guardato): è un buco, e va
 * mostrato come tale.
 */
export function statoCoerenza(grezzo: unknown): StatoCoerenza {
  const v = grezzo === null || grezzo === undefined ? "" : String(grezzo);
  return (NOTI as string[]).includes(v) ? (v as StatoCoerenza) : "sconosciuto";
}

/**
 * AR-646, secondo giro — **il badge che sparisce è un badge verde.**
 *
 * La mappa qui sopra era già fail-closed sull'ESITO, ma non sulla LETTURA: la rotta faceva
 * `cf ? {…} : null`, e un `null` significava insieme «il guardiano non ha ancora girato» e «il suo
 * verdetto non sono riuscito a leggerlo». Nel secondo caso il badge non veniva disegnato affatto, e
 * una scheda senza badge si legge come «nessun problema» — la stessa bugia dello scudo verde, detta
 * col silenzio invece che col colore. È la malattia di questa corsia vista da un'altra angolazione:
 * ciò che non ho guardato non può uscire come «a posto», nemmeno tacendo.
 *
 * Tre uscite, come le tre della lettura:
 *   · verdetto letto           → l'esito vero, passato dalla mappa esaustiva
 *   · guardato e non c'era     → `null`: il guardiano non ha ancora girato, non c'è niente da dire
 *   · non l'ho potuto leggere  → esito `sconosciuto` + il motivo: a video diventa il tono ⚪
 *
 * Pura: la prova la esegue senza rete, senza disco e senza montare la rotta.
 */
export function coerenzaSenzaVerdetto(l: {
  letto?: boolean;
  motivo?: string | null;
}): { esito: StatoCoerenza; incoerenze: number; cacce_aperte: number; data: string; motivo: string | null } | null {
  if (l?.letto) return null; // guardato e non c'era: il guardiano non ha ancora girato, niente da dire
  return { esito: "sconosciuto", incoerenze: 0, cacce_aperte: 0, data: "", motivo: l?.motivo ?? null };
}

/** Il tono del badge: verde solo su `ok`, rosso su `incoerenze`, ⚪ su tutto ciò che non è misura. */
export function tonoBadge(stato: StatoCoerenza): "verde" | "rosso" | "cieco" {
  if (stato === "ok") return "verde";
  if (stato === "incoerenze") return "rosso";
  return "cieco";
}

/**
 * Cosa c'è scritto nel badge, in italiano e senza sigle: è il testo che legge Nicola.
 *
 * @param stato l'esito normalizzato.
 * @param incoerenze quante copie vecchie ha trovato (serve solo allo stato `incoerenze`).
 */
export function testoBadge(stato: StatoCoerenza, incoerenze = 0): string {
  switch (stato) {
    case "ok":
      return "Memoria coerente — nessuna copia vecchia in giro nei file.";
    case "incoerenze":
      return `${incoerenze} ${incoerenze === 1 ? "copia vecchia" : "copie vecchie"} di un fatto ancora in giro nei file: la memoria sta divergendo.`;
    case "cieco":
      return "Non ho potuto controllare la memoria: il registro dei fatti non era leggibile. Questo non vuol dire che sia a posto.";
    case "non_verificato":
      return "Il controllo è partito ma non ha aperto nessun file: la memoria non è stata verificata.";
    default:
      return "Il controllo ha risposto una cosa che non so leggere: meglio dirtelo che darti un verde che non ho misurato.";
  }
}
