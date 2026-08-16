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
const IN_CASA = /^(?:memoria|vault|file|git|nota|coda|dati|report|consegn)/i;

// ─────────────────────────────────────────────────────────────────────────────
// AR-599 — «ROBA DI CASA» NON VUOL DIRE «INNOCUA».
//
// Fino al lotto 44 l'elenco qui sopra conteneva anche `github` e `marketplace`. La logica era:
// non arrivano a una persona, quindi non sono verso il mondo. Ed è vero — e completamente fuori
// bersaglio, perché il pericolo di quei due canali non è chi legge, è **cosa resta fatto**.
// Per il mansionario il merge di una richiesta di unione è l'azione più irreversibile della
// macchina (sempre 🔴) e sul catalogo del sito «niente si scrive senza il tuo ok» (🟡). Misurato
// prima del fix: `autoEseguibile("verde","github")` e `autoEseguibile("verde","marketplace")`
// rispondevano tutti e due **vero**.
//
// Restava in piedi un solo strato — il confronto di stringa sulla firma «nicola» contro «auto» —
// proprio sotto l'atto col raggio di danno più alto. La regola dei canali era nata apposta per
// essere il secondo strato, e su quei due canali dichiarava innocuo l'irreversibile.
//
// Il verso resta quello di sempre: si può solo ALZARE il colore, mai abbassarlo.
/** Atti che non si disfano: unire una richiesta, mandare in produzione, rilasciare. Minimo 🔴. */
const ATTO_IRREVERSIBILE =
  /^(?:github|merge|mergi|pr\b|pull-?request|richiesta-di-unione|unione|deploy|rilascio|produzione)/i;

/** Canali che SCRIVONO sul sito vero (catalogo, negozi, tabelle): minimo 🟡, mai da soli. */
const SCRIVE_SUL_SITO = /^(?:marketplace|catalogo|prodotti|negozi|supabase|db|database|sito)/i;

export function versoIlMondo(canale: string): boolean {
  const c = String(canale || "").trim();
  if (!c) return true; // canale non dichiarato ⇒ non so dove va ⇒ trattalo come esterno (fail-closed)
  if (IN_CASA.test(c)) return false;
  return VERSO_IL_MONDO.test(c);
}

/**
 * Il colore MINIMO che il canale impone, qualunque cosa dica il testo della card.
 *
 * Tre gradini invece di due: c'è chi non tocca niente fuori (verde), chi raggiunge una persona o
 * scrive sul sito (giallo), e chi compie un atto che non si disfa (rosso).
 *
 * Fail-closed su tutto ciò che non riconosco: un canale mai visto prima non è una prova che sia
 * innocuo. Prima un nome sconosciuto (`stripe`, `n8n`) cadeva fra i due elenchi e restava verde.
 */
export function minimoDalCanale(canale: string): Livello {
  const c = String(canale || "").trim();
  if (!c) return "giallo"; // canale non dichiarato: non so dove va
  if (ATTO_IRREVERSIBILE.test(c)) return "rosso";
  if (SCRIVE_SUL_SITO.test(c)) return "giallo";
  if (IN_CASA.test(c)) return "verde";
  return "giallo"; // canale sconosciuto: non è casa mia finché non me lo dimostra
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
  return almeno(livelloDaTesto, minimoDalCanale(canale));
}

/** Può l'autopilota eseguirla da solo? Solo se è verde DOPO la regola del canale. */
export function autoEseguibile(livelloDaTesto: Livello, canale: string): boolean {
  return livelloEffettivo(livelloDaTesto, canale) === "verde";
}
