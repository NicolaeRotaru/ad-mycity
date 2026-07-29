// AR-140 — il colore che decide l'esecuzione automatica è testo libero.
//
// `livelloDi()` prende il livello dall'emoji scritta nel markdown della card, e l'autopilota esegue
// da solo tutto ciò che risulta "verde". L'emoji la scrive un senior mentre accoda l'azione: è una
// dichiarazione di intenti, non un fatto riverificato. Basta un 🟢 di troppo su una card che manda
// una mail e parte una mail vera a una persona vera, senza che nessuno l'abbia letta.
//
// Misurato il 28/7 sulla coda reale: **zero** card verdi con un canale verso il mondo. Il cancello
// nasce quindi VERDE, e serve esattamente per il primo che comparirà — un cancello che nasce rosso
// su mezza coda viene disattivato entro la settimana, e allora non protegge niente.
//
// La regola, e il verso in cui funziona: **può solo ALZARE il colore, mai abbassarlo.** Un 🔴 resta
// 🔴 anche se il canale è innocuo; un 🟢 su un canale che raggiunge una persona diventa 🟡 e passa
// dalle mani di Nicola. È lo stesso principio della regola d'oro («nel dubbio sali di colore») e lo
// stesso di `livelloDi`, che già fa vincere il colore più restrittivo presente nel testo. Qui la
// differenza è che il vincolo non arriva dal testo: arriva dal canale, che il testo non decide.
//
// Nessuna dipendenza: si esegue sui valori passati, così una prova la misura su casi finti.

export type Livello = "verde" | "giallo" | "rosso" | "?";

/** L'ordine di severità. Alzare = andare avanti in questa lista, mai indietro. */
const SEVERITA: Livello[] = ["verde", "giallo", "rosso"];

/**
 * I canali che raggiungono una persona fuori da questa macchina. Non è l'elenco dei canali
 * collegati: è l'elenco di quelli che, se collegati, fanno arrivare qualcosa a qualcuno.
 * Telegram c'è dentro anche se oggi va solo alla chat di Nicola — il giorno che punta altrove,
 * la regola dev'essere già in piedi.
 */
const VERSO_IL_MONDO =
  /e-?mail|mail|telegram|whats-?app|sms|notifica|push|in-?app|instagram|facebook|ig\b|linkedin|tiktok|pec|newsletter|telefon|chiamata|stampa|pubblic/i;

/** Canali interni dichiarati: toccano solo file e dati di casa, non persone. */
const IN_CASA = /^(?:memoria|vault|file|git|github|nota|coda|marketplace|dati|report|consegn)/i;

export function versoIlMondo(canale: string): boolean {
  const c = String(canale || "").trim();
  if (!c) return true; // canale non dichiarato ⇒ non so dove va ⇒ trattalo come esterno (fail-closed)
  if (IN_CASA.test(c)) return false;
  return VERSO_IL_MONDO.test(c);
}

/** Alza `a` fino ad almeno `minimo`. Non abbassa mai. */
export function almeno(a: Livello, minimo: Livello): Livello {
  if (a === "?") return minimo === "verde" ? "?" : minimo;
  const ia = SEVERITA.indexOf(a);
  const im = SEVERITA.indexOf(minimo);
  if (ia < 0) return minimo;
  return im > ia ? minimo : a;
}

/**
 * Il livello con cui l'azione va trattata DAVVERO: quello scritto nel testo, alzato a giallo se il
 * canale raggiunge qualcuno fuori. Un "?" su canale esterno diventa giallo: non sapere che colore
 * abbia una cosa che esce non è un motivo per farla partire da sola.
 */
export function livelloEffettivo(livelloDaTesto: Livello, canale: string): Livello {
  if (!versoIlMondo(canale)) return livelloDaTesto;
  return almeno(livelloDaTesto, "giallo");
}

/** Può l'autopilota eseguirla da solo? Solo se è verde DOPO la regola del canale. */
export function autoEseguibile(livelloDaTesto: Livello, canale: string): boolean {
  return livelloEffettivo(livelloDaTesto, canale) === "verde";
}
