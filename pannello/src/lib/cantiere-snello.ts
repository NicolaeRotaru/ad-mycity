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

/** Un difetto è chiuso se lo dice il suo stato. Tutto il resto (aperto, in-corso, da-riverificare) è «da fare». */
export function eChiuso(d: Difetto): boolean {
  return String(d?.stato ?? "") === "chiuso";
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

export function contaDifetti(difetti: unknown): ContoCantiere {
  const lista = Array.isArray(difetti) ? (difetti as Difetto[]).filter(Boolean) : [];
  const per_stato: Record<string, number> = {};
  let chiusi = 0;
  for (const d of lista) {
    const stato = String(d?.stato ?? "").trim() || "(senza stato)";
    per_stato[stato] = (per_stato[stato] ?? 0) + 1;
    if (eChiuso(d)) chiusi++;
  }
  return { totale: lista.length, chiusi, da_fare: lista.length - chiusi, per_stato };
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
  const conto = contaDifetti(cantiere?.difetti);
  const scritto = typeof cantiere?.meta === "object" && cantiere?.meta ? (cantiere.meta as Record<string, unknown>) : {};
  const apertiScritti = Number(scritto.aperti);
  return {
    ...scritto,
    aperti: conto.da_fare,
    chiusi: conto.chiusi,
    per_stato: conto.per_stato,
    derivato_dalla_lista: true,
    scritto: { aperti: Number.isFinite(apertiScritti) ? apertiScritti : null },
    divergenza: Number.isFinite(apertiScritti) ? conto.da_fare - apertiScritti : null,
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
