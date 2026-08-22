// 🏪 I CONTI DELLA RADIOGRAFIA DEL SITO — il gemello di cervello/radiografia-marketplace-conti.mjs.
//
// PERCHÉ ESISTE UNA COPIA, E PERCHÉ NON È LIBERA. Next.js non importa da `cervello/`: il Pannello
// gira in un altro processo, con un altro bundler, e il modulo del cervello non gli arriva. La
// scelta non è «una casa o due», è «due case pinzate o due case libere» — e due case libere sono
// esattamente la malattia. `cervello/test/il-conto-del-sito-che-dice-zero.test.mjs` le confronta
// campo per campo, sul referto vero e sui casi limite: il giorno che una cambia senza l'altra,
// quel test diventa rosso. È lo stesso patto già in piedi fra `cervello/stati-cantiere.mjs` e
// `pannello/src/lib/cantiere-snello.ts`.
//
// L'altra strada era servire al Pannello il numero GIÀ SCRITTO nel file (`meta.findings`, oppure il
// riassunto del lotto). Scartata, e il motivo è misurato: il 20/8 `meta.findings` diceva 245 e
// `meta.bloccanti` 12 — la fotografia del 18/8, prima di 216 riparazioni — mentre il riassunto del
// lotto dentro lo stesso file diceva 32 aperti e 4 bloccanti, fermo a tre chiusure prima.
// **Un numero derivato dalla lista non può invecchiare; un numero letto sì.**
//
// 🟢 Modulo PURO: nessun import, nessun fetch, nessun window, nessun orologio.

type Problema = Record<string, unknown>;
type Digest = Record<string, unknown> | null | undefined;

// ═══════════════════════════════════════════════════════════════════════════
// ① IL VOCABOLARIO — quali stati vogliono dire «non è più lavoro»
// ═══════════════════════════════════════════════════════════════════════════

/** Gli stati che chiudono un problema del sito: `chiuso` (forma vecchia), `riparato`, `gia_riparato_prima`. */
export const STATI_CHIUSI = ["chiuso", "riparato", "gia_riparato_prima"] as const;

/** L'etichetta che il vuoto porta nel conto per stato. Anche il niente ha un nome, così si vede. */
export const STATO_ASSENTE = "(senza stato)";

/** Le severità che so nominare. Quelle che non conosco NON spariscono: finiscono in `altre`. */
export const SEVERITA_NOTE = ["bloccante", "grave", "minore"] as const;

/** L'etichetta della severità mancante. Un problema senza gravità resta un problema. */
export const SEVERITA_ASSENTE = "(senza gravita)";

/** Lo stato di un problema, normalizzato: senza spazi attorno, e con un nome anche quando manca. */
export function statoDi(p: Problema): string {
  return String(p?.stato ?? "").trim().toLowerCase() || STATO_ASSENTE;
}

/** Questo problema è chiuso? La porta unica: chi conta e chi disegna passano da qui. */
export function eChiuso(p: Problema): boolean {
  return (STATI_CHIUSI as readonly string[]).includes(statoDi(p));
}

/** Questo problema è ancora lavoro? Tutto ciò che non è chiuso — compreso ciò che non so nominare. */
export function eAperto(p: Problema): boolean {
  return !eChiuso(p);
}

/** La gravità di un problema, normalizzata. */
export function severitaDi(p: Problema): string {
  return String(p?.severita ?? "").trim().toLowerCase() || SEVERITA_ASSENTE;
}

/**
 * Dove sta il problema, qualunque nome porti il campo: `dove` nella forma vecchia, `file` nella
 * nuova. Senza questa riga la colonna «Dove» resta vuota su tutti i referti dal 18/8 in poi.
 */
export function doveDi(p: Problema): unknown {
  return p?.dove ?? p?.file ?? null;
}

// ═══════════════════════════════════════════════════════════════════════════
// ② DOVE SONO I PROBLEMI — le due forme storiche, e il caso «non lo so vedere»
// ═══════════════════════════════════════════════════════════════════════════

export type Estrazione = {
  forma: string;
  problemi: Problema[] | null;
  dichiarati: number | null;
  motivo: string | null;
};

/** Quanti problemi dichiara di avere il referto, se lo dichiara. È il testimone contro lo zero. */
export function dichiaratiDalReferto(digest: Digest): number | null {
  const meta = digest?.meta as Record<string, unknown> | undefined;
  const n = meta?.findings;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** I problemi del referto, da qualunque forma arrivino. `null` quando la forma non la riconosco. */
export function problemiDelReferto(digest: Digest): Estrazione {
  const dichiarati = dichiaratiDalReferto(digest);

  // ⚠️ PRIMA DI TUTTO: esiste un audit del sito che nessuno ha saputo leggere? Il 22/8/2026 la
  // Cabina diceva «0 problemi aperti» mentre in consegne/design/ c'erano 208 problemi verificati,
  // due dei quali impedivano a ogni negoziante di caricare la copertina della vetrina: il digest
  // guardava una cartella sola, e non guardare non è un errore, è uno zero. Finché
  // `fonti_non_lette` non è vuoto, qui non esce nessun numero.
  const nonLetteRaw = digest?.fonti_non_lette;
  const nonLette = Array.isArray(nonLetteRaw) ? (nonLetteRaw as Problema[]).filter(Boolean) : [];
  if (nonLette.length) {
    const files = nonLette.map((r) => String((r as Record<string, unknown>)?.file ?? "?")).join(", ");
    return {
      forma: "incompleto",
      problemi: null,
      dichiarati,
      motivo:
        `${nonLette.length} referto/i di audit del sito non sono entrati in questo conto (${files}): ` +
        `il numero sarebbe parziale, e un parziale presentato come totale è peggio di un non-letto. ` +
        `Dichiara la fonte in cervello/referti-sito.mjs e rilancia node cervello/radiografia-marketplace-digest.mjs.`,
    };
  }

  const elenco = digest?.problemi;
  if (Array.isArray(elenco)) {
    const vivi = (elenco as Problema[]).filter(Boolean);
    if (vivi.length) return { forma: "elenco", problemi: vivi, dichiarati, motivo: null };
  }

  const daDimensioni: Problema[] = [];
  const dims = digest?.dimensioni;
  if (Array.isArray(dims)) {
    for (const d of dims as Problema[]) {
      if (!Array.isArray(d?.findings)) continue;
      for (const f of d.findings as Problema[]) {
        if (f) daDimensioni.push({ ...f, dimensione: f.dimensione ?? d.chiave ?? d.key ?? null });
      }
    }
  }
  if (daDimensioni.length) return { forma: "dimensioni", problemi: daDimensioni, dichiarati, motivo: null };

  // Qui si decide fra «zero davvero» e «non lo so vedere», e lo decide il referto stesso: se
  // dichiara di aver trovato dei problemi, la lista c'è e sono io che non l'ho trovata.
  if (dichiarati === 0) return { forma: "vuoto", problemi: [], dichiarati, motivo: null };
  return {
    forma: "illeggibile",
    problemi: null,
    dichiarati,
    motivo:
      dichiarati == null
        ? "il referto non ha né un elenco di problemi né un totale dichiarato: non ho potuto contare (e un non-contato non è uno zero)"
        : `il referto dichiara ${dichiarati} problemi ma non ne trovo nessuno né in «problemi» né in «dimensioni[].findings»: la forma del file è cambiata e questo contatore non la sa leggere (e un non-letto non è uno zero)`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ③ IL CONTO — con tutti i rami, e `null` quando non ho potuto leggere
// ═══════════════════════════════════════════════════════════════════════════

export type PerSeverita = { bloccante: number; grave: number; minore: number; altre: number };

export type ContoMarketplace = {
  letto: boolean;
  motivo: string | null;
  forma: string;
  dichiarati: number | null;
  divergenza_dal_dichiarato: number | null;
  totale: number | null;
  chiusi: number | null;
  aperti: number | null;
  aperti_per_severita: PerSeverita | null;
  totale_per_severita: PerSeverita | null;
  per_stato: Record<string, number> | null;
};

function contoVuotoPerSeverita(): PerSeverita {
  return { bloccante: 0, grave: 0, minore: 0, altre: 0 };
}

/**
 * IL CONTO DEI DIFETTI DEL SITO — quello che la Cabina mostra.
 *
 * ① `aperti` è tutto ciò che non è chiuso ② la somma dei rami fa il totale, anche su una severità
 * mai vista ③ non letto non è zero: i conti restano `null` col motivo ④ `divergenza_dal_dichiarato`
 * misura quanto il file diverge da sé stesso, invece di assorbirlo in silenzio.
 */
export function contoMarketplace(digest: Digest): ContoMarketplace {
  const { forma, problemi, dichiarati, motivo } = problemiDelReferto(digest);
  if (problemi == null) {
    return {
      letto: false,
      motivo,
      forma,
      dichiarati,
      divergenza_dal_dichiarato: null,
      totale: null,
      chiusi: null,
      aperti: null,
      aperti_per_severita: null,
      totale_per_severita: null,
      per_stato: null,
    };
  }

  const per_stato: Record<string, number> = {};
  const aperti_per_severita = contoVuotoPerSeverita();
  const totale_per_severita = contoVuotoPerSeverita();
  let chiusi = 0;
  let aperti = 0;

  for (const p of problemi) {
    const stato = statoDi(p);
    per_stato[stato] = (per_stato[stato] ?? 0) + 1;
    const sev = severitaDi(p);
    const ramo = ((SEVERITA_NOTE as readonly string[]).includes(sev) ? sev : "altre") as keyof PerSeverita;
    totale_per_severita[ramo] += 1;
    if (eChiuso(p)) chiusi += 1;
    else {
      aperti += 1;
      aperti_per_severita[ramo] += 1;
    }
  }

  return {
    letto: true,
    motivo: null,
    forma,
    dichiarati,
    divergenza_dal_dichiarato: dichiarati == null ? null : problemi.length - dichiarati,
    totale: problemi.length,
    chiusi,
    aperti,
    aperti_per_severita,
    totale_per_severita,
    per_stato,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ④ LE DIMENSIONI DA DISEGNARE — una forma sola per la Cabina
// ═══════════════════════════════════════════════════════════════════════════

/** I campi che la scheda LEGGE di un problema. Il resto è peso morto sulla rete. */
export const CAMPI_PROBLEMA = [
  "titolo",
  "severita",
  "descrizione",
  "impatto",
  "fix",
  "dove",
  "stato",
  "nota_riparazione",
] as const;

export type DimensioneDisegnata = {
  key: string;
  nome: string | null;
  findings: Problema[];
  problemi_chiusi: number;
};

/**
 * Le dimensioni coi loro problemi, nella forma che la scheda sa disegnare.
 *
 * Di base solo gli APERTI: sul referto del 18/8 i chiusi sono 216 su 245, cioè 216 schede che
 * attraversano la rete per essere buttate all'arrivo. Di loro resta il numero, perché «0 aperti» e
 * «0 aperti, 12 riparati» non raccontano la stessa storia.
 *
 * `null` quando il referto non è leggibile: una lista vuota direbbe «nessun problema», che è la
 * bugia che questo file esiste per impedire.
 */
export function dimensioniDaDisegnare(
  digest: Digest,
  { soloAperti = true }: { soloAperti?: boolean } = {},
): DimensioneDisegnata[] | null {
  const { problemi } = problemiDelReferto(digest);
  if (problemi == null) return null;

  const ordine: string[] = [];
  const perChiave = new Map<string, DimensioneDisegnata>();
  const aggiungi = (chiave: unknown, nome: string | null): DimensioneDisegnata => {
    const k = String(chiave ?? "").trim() || "(senza area)";
    if (!perChiave.has(k)) {
      perChiave.set(k, { key: k, nome: nome ?? null, findings: [], problemi_chiusi: 0 });
      ordine.push(k);
    }
    return perChiave.get(k) as DimensioneDisegnata;
  };

  const dims = digest?.dimensioni;
  if (Array.isArray(dims)) {
    for (const d of dims as Problema[]) {
      if (!d) continue;
      aggiungi(d.chiave ?? d.key, (d.nome as string | undefined) ?? null);
    }
  }

  for (const p of problemi) {
    const voce = aggiungi(p?.dimensione, null);
    if (eChiuso(p)) {
      voce.problemi_chiusi += 1;
      if (soloAperti) continue;
    }
    const snello: Problema = {};
    for (const k of CAMPI_PROBLEMA) if (p?.[k] != null) snello[k] = p[k];
    const dove = doveDi(p);
    if (dove != null) snello.dove = dove;
    voce.findings.push(snello);
  }

  return ordine
    .map((k) => perChiave.get(k) as DimensioneDisegnata)
    .filter((d) => d.findings.length || d.problemi_chiusi);
}
