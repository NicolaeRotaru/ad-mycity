// AR-250 · AR-221 — la Cabina spedisce e disegna cose che nessuno guarda.
//
// Misurato il 28/7 sul cantiere vero:
//
//   · `cantiere-difetti.json` intero = **607.409 byte**, 271 difetti, e la scheda Radiografia lo
//     riscarica ogni 30 secondi. Sul telefono, con la rete di Nicola.
//   · i **135 chiusi** pesano 283.571 byte e a video sono un muro di righe piatte che non si può
//     richiudere (AR-221): la lista degli aperti — quella che serve — sta sotto.
//   · dei 136 aperti si mandano solo i campi che la scheda disegna — non `verifica`, non i campi
//     interni che nessuna riga mostra.
//
// Risultato misurato: **607.409 → 301.210 byte, il 50% in meno a ogni ricarica.**
//
// (Una stima precedente diceva 83%: era calcolata su una lista di campi indovinata invece che
// derivata dal type `Difetto` del componente. `fix_proposto` e `causa_radice` sono i due campi
// grossi e stanno davvero a video, dentro «Dettagli tecnici» — quindi viaggiano. Il numero buono è
// quello misurato, non quello che suonava meglio.)
//
// ⚠️ **Resta scoperto, e va detto:** sulla stessa rotta viaggia `auto-radiografia.json`, **659.679
// byte**, ancora inoltrato intero. È la metà più grossa del problema e non è in questo lotto:
// snellirlo richiede di derivare i campi letti dalle sue schede, che è un lavoro suo.
//
// ── Una correzione al difetto stesso ────────────────────────────────────────
//
// AR-250 diceva «dei chiusi manda solo il conteggio, l'elenco completo non è a video». Guardando il
// componente (`RadiografiaDiSe.tsx`, blocco «Chiusi») quell'elenco **è** a video: 135 righe con
// titolo e data. Mandare solo un numero avrebbe svuotato una sezione che Nicola usa.
//
// Quindi l'intento resta — non spedire ciò che non si mostra — ma applicato ai fatti veri: dei chiusi
// si mandano i **tre campi che la riga disegna** (id, titolo, data), non l'oggetto intero con
// fix_proposto, causa_radice, note e verifica. E si manda una finestra recente, dichiarando il totale.
//
// Nessuna dipendenza: si esegue in un test senza React, senza rete, senza disco.

/** Quanti chiusi si mandano. Sono lo storico: contano i più recenti, il resto è archivio. */
export const MAX_CHIUSI = 40;

/** I campi che la scheda LEGGE di un difetto aperto. Ricavati dal type `Difetto` del componente. */
export const CAMPI_APERTO = [
  "id",
  "titolo",
  "dimensione",
  "gravita",
  "impatto_crescita",
  "causa_radice",
  "fix_proposto",
  "stato",
  "nato",
  "chiuso_il",
  "nota_fix",
  "nota",
  "chiuso_come",
] as const;

/** Di un difetto chiuso la riga disegna solo questi tre. Il resto è peso morto sulla rete. */
export const CAMPI_CHIUSO = ["id", "titolo", "chiuso_il"] as const;

type Difetto = Record<string, unknown>;

function soloCampi(d: Difetto, campi: readonly string[]): Difetto {
  const out: Difetto = {};
  for (const k of campi) if (d?.[k] != null) out[k] = d[k];
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// GLI STATI DEL CANTIERE — il gemello di cervello/stati-cantiere.mjs
// ═══════════════════════════════════════════════════════════════════════════
//
// PERCHÉ ESISTE UNA COPIA, E PERCHÉ NON È LIBERA. Next.js non importa da `cervello/`: il Pannello
// gira in un altro processo, con un altro bundler, e il modulo del cervello non gli arriva. La
// scelta non è quindi «una casa o due», è «due case pinzate o due case libere» — e due case libere
// sono esattamente la malattia (`una parola con due padroni`).
//
// L'altra strada era servire al Pannello il numero GIÀ CALCOLATO, cioè `cantiere.meta` scritto da
// `auto-fix.mjs`. Scartata, e il motivo è un difetto pagato: AR-456. Un totale scritto in un file
// invecchia appena qualcuno aggiunge una scheda senza toccarlo — il 13/8 diceva 223 mentre i non
// chiusi erano 281. **Un numero derivato dalla lista non può invecchiare; un numero letto sì.**
//
// Quindi: la regola resta scritta due volte, e `cervello/test/un-totale-che-salta-uno-stato.test.mjs`
// le confronta campo per campo — sul cantiere vero e su una tabella di casi limite. Il giorno che
// una delle due cambia senza l'altra, il test diventa rosso.

/** Gli stati che questo file sa nominare. Chi non c'è NON sparisce: finisce in `altri`. */
export const STATI_NOTI = ["chiuso", "aperto", "in-corso", "da-riverificare"] as const;

/** L'etichetta che il vuoto porta nel conto per stato. Anche il niente ha un nome, così si vede. */
export const STATO_ASSENTE = "(senza stato)";

/** Lo stato di una scheda, normalizzato: senza spazi attorno, e con un nome anche quando manca. */
export function statoDi(d: Difetto): string {
  return String(d?.stato ?? "").trim() || STATO_ASSENTE;
}

/** Un difetto è chiuso se lo dice il suo stato. Tutto il resto (aperto, in-corso, da-riverificare) è «da fare». */
export function eChiuso(d: Difetto): boolean {
  return String(d?.stato ?? "") === "chiuso";
}

/**
 * ⚠️ L'UNICA DIFFERENZA FRA LE DUE CASE, DICHIARATA QUI E NON NASCOSTA.
 *
 * `eChiuso` qui sopra NON toglie gli spazi; `eChiusa` nel cervello sì. Su una scheda scritta
 * `" chiuso "` le due danno verdetti diversi. Il verso giusto è togliere gli spazi — uno spazio in
 * un JSON è un refuso, non un sesto stato — ma le DUE risposte opposte sono pinzate, una per parte,
 * da `cervello/test/parola-senza-padrone.test.mjs`, che non appartiene a questa corsia: allinearle
 * lascerebbe rosso il test di qualcun altro. Quindi la differenza resta, e resta MISURATA: la patch
 * (una riga qui, un caso lì) è in mano all'AD.
 *
 * Quanto costa oggi: **niente di misurabile**. Nessuna delle 716 schede del cantiere ha uno stato
 * con spazi attorno — verificato una per una da `cervello/test/un-totale-che-salta-uno-stato.test.mjs`,
 * che è anche la trappola: il giorno che ne comparisse una, quel test diventa rosso invece di
 * lasciare che i due totali divergano di uno senza che nessuno lo veda.
 */
export type ContoStati = {
  letto: boolean;
  motivo: string | null;
  totale: number | null;
  chiusi: number | null;
  aperti: number | null;
  in_corso: number | null;
  da_riverificare: number | null;
  altri: number | null;
  da_fare: number | null;
  senza_data_nascita: number | null;
  per_stato: Record<string, number> | null;
  stati_ignoti: { stato: string; quante: number }[] | null;
};

/** La data di nascita è leggibile? Un `nato` assente o illeggibile è un IGNOTO, non uno zero. */
export function haDataNascita(d: Difetto): boolean {
  return !Number.isNaN(Date.parse(String(d?.nato ?? "").slice(0, 10)));
}

/**
 * IL CONTO CON TUTTI I RAMI — il gemello di `contaDifetti` del cervello, stesso nome dei campi.
 *
 * ① `da_fare` è tutto ciò che non è chiuso, non «aperto + in-corso»: il 13/8 le 56 schede
 *    `da-riverificare` sparivano dal numero perché la loro etichetta non era prevista (AR-684).
 * ② la somma dei rami DEVE fare il totale: se domani nasce un sesto stato finisce in `altri` e la
 *    somma continua a tornare, invece di aprire un buco dove le schede scompaiono.
 * ③ non letto non è zero: senza una lista i conti restano `null` col motivo, perché uno zero è un
 *    fatto e un errore di lettura travestito da zero è la bugia peggiore che la Cabina possa dire.
 */
export function contoCantiere(difetti: unknown): ContoStati {
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
  const lista = (difetti as Difetto[]).filter(Boolean);
  const per_stato: Record<string, number> = {};
  let chiusi = 0;
  let aperti = 0;
  let in_corso = 0;
  let da_riverificare = 0;
  let altri = 0;
  let senza_data_nascita = 0;
  const ignoti = new Map<string, number>();
  for (const d of lista) {
    const stato = statoDi(d);
    per_stato[stato] = (per_stato[stato] ?? 0) + 1;
    // «Chiusa» lo decide `eChiuso`, la porta unica di questo file — non un confronto in più scritto
    // qui, che sarebbe la terza definizione della stessa parola dentro lo stesso modulo.
    if (eChiuso(d)) chiusi++;
    else if (stato === "aperto") aperti++;
    else if (stato === "in-corso") in_corso++;
    else if (stato === "da-riverificare") da_riverificare++;
    else {
      altri++;
      ignoti.set(stato, (ignoti.get(stato) ?? 0) + 1);
    }
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
    da_fare: lista.length - chiusi,
    senza_data_nascita,
    per_stato,
    stati_ignoti: [...ignoti.entries()].map(([stato, quante]) => ({ stato, quante })).sort((a, b) => b.quante - a.quante),
  };
}

/** La somma dei rami torna? Su un conto non letto non si emette un verdetto: `null`. */
export function sommaTorna(conto: ContoStati): boolean | null {
  if (!conto || conto.letto !== true) return null;
  const rami = (conto.chiusi ?? 0) + (conto.aperti ?? 0) + (conto.in_corso ?? 0) + (conto.da_riverificare ?? 0) + (conto.altri ?? 0);
  return rami === conto.totale && conto.da_fare === (conto.totale ?? 0) - (conto.chiusi ?? 0);
}

/**
 * QUANTI ERANO APERTI A UNA CERTA DATA — e quanti non lo so (AR-671).
 *
 * La rotta della salute onesta se n'era scritta una versione sua, con dentro il difetto originale:
 * `if (nato == null) return false`, cioè una scheda senza data di nascita usciva dalla statistica
 * **in silenzio**, né oggi né una settimana fa — e sempre dalla parte comoda, perché il burn-down
 * migliorava da solo. Qui gli ignoti si contano e si dichiarano: chi disegna il confronto deve poter
 * scrivere «più o meno N» invece di un numero secco che non regge.
 */
export function apertiAllaData(
  difetti: unknown,
  tMs: number,
): { conteggio: number | null; ignoti: number | null; letto: boolean; motivo: string | null } {
  if (!Array.isArray(difetti)) {
    return { conteggio: null, ignoti: null, letto: false, motivo: "non mi è arrivata una lista di schede: non ho potuto contare" };
  }
  if (!Number.isFinite(tMs)) {
    return { conteggio: null, ignoti: null, letto: false, motivo: "non mi è arrivata una data valida: non ho potuto collocare niente nel tempo" };
  }
  const giorno = (iso: unknown): number | null => {
    const t = Date.parse(String(iso ?? "").slice(0, 10));
    return Number.isNaN(t) ? null : t;
  };
  let conteggio = 0;
  let ignoti = 0;
  for (const d of (difetti as Difetto[]).filter(Boolean)) {
    const chiuso = giorno(d?.chiuso_il);
    const giaChiuso = chiuso != null && chiuso <= tMs;
    const nato = giorno(d?.nato);
    if (nato == null) {
      if (!giaChiuso) ignoti++;
      continue;
    }
    if (nato > tMs) continue;
    if (!giaChiuso) conteggio++;
  }
  return { conteggio, ignoti, letto: true, motivo: null };
}

/**
 * AR-456 — **IL RIASSUNTO PIÙ VECCHIO DELLA LISTA CHE RIASSUME.**
 *
 * In `cantiere-difetti.json` convivono due cose: la LISTA dei difetti e un totale SCRITTO in
 * `meta.aperti`, che aggiorna chi passa. Al primo che aggiunge una scheda senza toccare il meta le due
 * divergono, e il Pannello leggeva il riassunto. Misurato il 13/8/2026 sul file vero: `meta.aperti`
 * diceva **223**, i difetti non chiusi erano **281** — 58 di scarto, e nessun guardiano che confrontasse
 * il riassunto con ciò che riassume. È la stessa famiglia di AR-175: due numeri diversi alla stessa
 * domanda, e vince quello comodo, cioè il più piccolo.
 *
 * Il conto qui si DERIVA dalla lista a ogni lettura: un numero derivato non può invecchiare.
 *
 * Due scelte che questa funzione fa apposta, ed è il motivo per cui è una funzione e non un `.filter`:
 *
 *   1. **`da_fare` è tutto ciò che NON è chiuso**, non «aperto + in-corso». Lo stesso 13/8 c'erano 225
 *      `aperto`, 0 `in-corso` e **56 `da-riverificare`**: sommando solo i due stati previsti, 56 difetti
 *      veri sparivano dal numero che Nicola guarda. Uno stato che non conosco non è un difetto risolto.
 *   2. **`per_stato` è esaustivo**: qualunque etichetta appaia finisce lì dentro con il suo conto, così
 *      una nuova non può nascondersi dentro un totale.
 */
export type ContoCantiere = {
  totale: number;
  chiusi: number;
  da_fare: number;
  per_stato: Record<string, number>;
};

/**
 * La faccia STORICA del conto: quattro campi, e zeri quando la lista non c'è.
 *
 * Non conta più per conto suo — deriva da `contoCantiere`, che è l'unica regola. Resta perché la
 * usano la rotta, la scheda della Cabina e due prove che pretendono esattamente questa forma; il
 * conto pieno (con i rami per stato e il `letto: false` sui ciechi) è l'altro.
 *
 * ⚠️ Lo zero su una lista assente è un DEBITO, non una scelta: `contoCantiere` risponde `letto:
 * false`, che è la risposta giusta, e qui viene appiattito a `0` perché così lo pretende
 * `cervello/test/contatore-piu-vecchio-dei-difetti.test.mjs`. Chi decide qualcosa di importante
 * usi `contoCantiere` e guardi `letto`.
 */
export function contaDifetti(difetti: unknown): ContoCantiere {
  const c = contoCantiere(difetti);
  if (!c.letto) return { totale: 0, chiusi: 0, da_fare: 0, per_stato: {} };
  return { totale: c.totale ?? 0, chiusi: c.chiusi ?? 0, da_fare: c.da_fare ?? 0, per_stato: c.per_stato ?? {} };
}

/**
 * Il `meta` da servire al Pannello: i totali sono DERIVATI dalla lista, mai quelli scritti nel file.
 *
 * Il totale scritto non si butta in silenzio — resta come `scritto`, e `divergenza` dice di quanto
 * sbagliava. Serve a due cose: si vede a occhio quando il file ha smesso di aggiornarsi, e se un
 * giorno qualcuno rimettesse il numero scritto al posto di questo, la differenza è già misurata.
 *
 * `aperti` qui significa **non chiuso**, la stessa definizione con cui la scheda filtra la lista che
 * disegna. Prima ne giravano tre nella stessa risposta (223 dal meta scritto, 225 contando solo
 * `aperto`, 281 contando i non chiusi): erano tre risposte alla stessa domanda, nella stessa pagina.
 */
export function metaDerivata(cantiere: { difetti?: unknown; meta?: unknown } | null | undefined): Record<string, unknown> {
  const conto = contoCantiere(cantiere?.difetti);
  const scritto = typeof cantiere?.meta === "object" && cantiere?.meta ? (cantiere.meta as Record<string, unknown>) : {};
  // Il confronto va fatto con la stessa domanda: «quanto lavoro resta». Da quando il registro scrive
  // anche `da_fare`, è quello il numero omologo; `aperti` resta il ripiego per i file più vecchi, che
  // di quel campo non ne avevano uno.
  const apertiScritti = Number(scritto.da_fare ?? scritto.aperti);
  const daFare = conto.da_fare ?? 0;
  return {
    ...scritto,
    aperti: daFare,
    chiusi: conto.chiusi,
    // AR-684 — i tre stati vivi hanno ognuno il suo numero, e il totale non lascia fuori nessuno.
    // Prima il terzo (`da-riverificare`) non compariva da nessuna parte in questa risposta.
    in_corso: conto.in_corso,
    da_riverificare: conto.da_riverificare,
    altri: conto.altri,
    totale: conto.totale,
    da_fare: daFare,
    per_stato: conto.per_stato,
    stati_ignoti: conto.stati_ignoti,
    somma_torna: sommaTorna(conto),
    derivato_dalla_lista: true,
    scritto: { aperti: Number.isFinite(apertiScritti) ? apertiScritti : null },
    divergenza: Number.isFinite(apertiScritti) ? daFare - apertiScritti : null,
  };
}

/**
 * Compone la risposta del cantiere invece di inoltrare il file.
 *
 * Dichiara sempre i totali VERI (`aperti`, `chiusi`) anche quando manda una finestra: un elenco
 * troncato senza il totale è il difetto che stiamo curando visto da un'altra angolazione — la
 * schermata mostrerebbe 40 chiusi e Nicola crederebbe che siano tutti.
 */
export function cantiereSnello(
  cantiere: { difetti?: unknown; meta?: unknown } | null | undefined,
  { maxChiusi = MAX_CHIUSI }: { maxChiusi?: number } = {},
): { difetti: Difetto[]; meta: Record<string, unknown>; troncato: { chiusi_mostrati: number; chiusi_totali: number } } | null {
  if (!cantiere) return null;
  const tutti = Array.isArray(cantiere.difetti) ? (cantiere.difetti as Difetto[]).filter(Boolean) : [];
  const aperti = tutti.filter((d) => !eChiuso(d));
  const chiusi = tutti.filter(eChiuso);

  // I più recenti per data di chiusura. Chi non ha la data va in fondo: non si inventa un ordine.
  const perData = [...chiusi].sort((a, b) => String(b.chiuso_il ?? "").localeCompare(String(a.chiuso_il ?? "")));
  const mostrati = maxChiusi >= 0 ? perData.slice(0, maxChiusi) : perData;

  return {
    difetti: [
      ...aperti.map((d) => soloCampi(d, CAMPI_APERTO)),
      ...mostrati.map((d) => ({ ...soloCampi(d, CAMPI_CHIUSO), stato: "chiuso" })),
    ],
    // AR-456 — i totali li deriva `metaDerivata`, la stessa funzione che usa la rotta della salute
    // onesta. Prima il conto era scritto a mano qui: due posti che contano la stessa cosa sono due
    // posti che prima o poi rispondono in modo diverso.
    meta: metaDerivata(cantiere),
    troncato: { chiusi_mostrati: mostrati.length, chiusi_totali: chiusi.length },
  };
}
