// ═══════════════════════════════════════════════════════════════════════════
// IL RIPESCAGGIO CHE NON RIPESCAVA — AR-603 · AR-604
//
// Il Pannello promette due volte, per iscritto, la stessa cosa: «una risposta persa riappare sempre
// dai lavori» (commento di `continuaConversazione`) e «la risposta vera verrà ripescata dai lavori
// alla prossima apertura» (testo mostrato a Nicola quando l'attesa scade). Nessuna delle due era
// mantenuta, e per due motivi diversi che si sommavano:
//
//  ① AR-603 — L'ELENCO NON PORTA IL TESTO. Il poll della lista gira leggero apposta (senza
//     `richiesta` né `risultato`: sulle chat sono 9,8 KB a riga, ogni 8 secondi). Dentro la stessa
//     sessione il buco è nascosto, perché i lavori «in corso» vengono riletti a parte. Ma un lavoro
//     già FINITO non lo rilegge nessuno: dopo un ricaricamento della pagina le sue righe arrivano
//     mute, e ricostruire la conversazione da righe mute produce ZERO messaggi. Il paracadute si
//     apriva solo finché non serviva.
//  ② AR-604 — LA CASELLA NON RIPROVAVA. Chiudere il box non smonta il componente, quindi il segno
//     «ho già caricato» restava acceso e alla riapertura il caricamento usciva subito; e anche al
//     rimontaggio vero, se la chat unificata ricordava proprio quella casella, si usciva PRIMA del
//     passo di recupero. I due percorsi insieme spegnevano il ripescaggio esattamente nei casi per
//     cui era stato scritto.
//
// LA RADICE COMUNE: la decisione «devo andare a rileggere?» viveva dentro un `useEffect`, dove
// nessun test la può eseguire — quindi la promessa restava vera nel commento e falsa nel prodotto.
// Qui sotto è una funzione pura, senza React e senza rete, e le prove la fanno girare
// (`cervello/test/c4-recupero-thread.test.mjs`).
// ═══════════════════════════════════════════════════════════════════════════

// ── ① AR-603 · quali lavori vanno riletti prima di ricostruire la conversazione ──────────────

export type LavoroThread = {
  id?: string;
  tipo?: string;
  stato?: string;
  richiesta?: string;
  risultato?: string;
};

/** Un lavoro in questi stati non si muove più: se il suo testo manca, manca per sempre. */
const CONCLUSI = new Set(["fatto", "errore", "annullato"]);

/** Quanti se ne possono chiedere in un colpo solo: la rotta dei dettagli è un batch, non un fiume. */
export const MAX_RILETTURE = 40;

function vuoto(s: unknown): boolean {
  return !String(s ?? "").trim();
}

/**
 * Gli id dei lavori di una conversazione che, così come sono arrivati, NON possono ricostruire
 * niente — quindi vanno riletti per intero prima di rifare il thread.
 *
 * Due casi, e valgono entrambi:
 *  · manca la richiesta → non c'è nemmeno la domanda di Nicola («giro» è l'unico che ce l'ha
 *    scritta a mano dentro il codice, e infatti non si rilegge per quello);
 *  · il lavoro è concluso e manca la risposta → è precisamente il caso del ripescaggio: la risposta
 *    è arrivata a pagina chiusa e vive solo nel database. `annullato` è l'eccezione dichiarata:
 *    lì una risposta non deve esserci, e chiederla sarebbe una lettura sprecata a ogni apertura.
 *
 * Torna una lista senza doppioni: lo stesso lavoro non si chiede due volte.
 */
export function idsDaRileggerePerThread(lavori: LavoroThread[] | null | undefined): string[] {
  const out: string[] = [];
  for (const lv of Array.isArray(lavori) ? lavori : []) {
    const id = String(lv?.id ?? "").trim();
    if (!id) continue;
    const stato = String(lv?.stato ?? "");
    const haRichiesta = !vuoto(lv?.richiesta) || lv?.tipo === "giro";
    if (!haRichiesta) {
      out.push(id);
      continue;
    }
    if (CONCLUSI.has(stato) && stato !== "annullato" && vuoto(lv?.risultato)) out.push(id);
  }
  return [...new Set(out)].slice(0, MAX_RILETTURE);
}

/**
 * Rimette il testo riletto dentro le righe leggere, senza perdere niente di quello che c'era.
 *
 * Il fresco vince solo dove ha qualcosa da dire: un dettaglio che torna senza `risultato` (il lavoro
 * è ancora a metà) non deve cancellare il parziale già a schermo. L'ordine delle righe non si tocca:
 * la conversazione è cronologica e riordinarla qui vorrebbe dire capovolgerla.
 */
export function fondiDettagli<T extends LavoroThread>(lavori: T[] | null | undefined, dettagli: LavoroThread[] | null | undefined): T[] {
  const base = Array.isArray(lavori) ? lavori : [];
  const mappa = new Map<string, LavoroThread>();
  for (const d of Array.isArray(dettagli) ? dettagli : []) {
    const id = String(d?.id ?? "").trim();
    if (id) mappa.set(id, d);
  }
  if (mappa.size === 0) return [...base];
  return base.map((lv) => {
    const d = mappa.get(String(lv?.id ?? "").trim());
    if (!d) return lv;
    return {
      ...lv,
      richiesta: vuoto(d.richiesta) ? lv.richiesta : d.richiesta,
      risultato: vuoto(d.risultato) ? lv.risultato : d.risultato,
      stato: d.stato ?? lv.stato,
    };
  });
}

/**
 * La mano che applica ①: rilegge ciò che serve e torna le righe complete.
 *
 * Il lettore arriva da fuori (è una POST a `/api/lavori/dettagli`) proprio perché così la catena
 * intera — decidi, leggi, fondi — si può far girare in un test senza rete. Se la lettura fallisce si
 * torna quello che si aveva: mezzo thread è meglio di nessun thread, e il difetto era «niente».
 */
export async function arricchisciPerThread<T extends LavoroThread>(
  lavori: T[] | null | undefined,
  leggi: (ids: string[]) => Promise<LavoroThread[]>,
): Promise<T[]> {
  const base = Array.isArray(lavori) ? lavori : [];
  const ids = idsDaRileggerePerThread(base);
  if (ids.length === 0) return [...base];
  try {
    const dettagli = await leggi(ids);
    return fondiDettagli(base, dettagli);
  } catch {
    return [...base];
  }
}

// ── ② AR-604 · cosa fare quando la casella si riapre ─────────────────────────────────────────

export type MsgApertura = { pending?: boolean };

export type StatoApertura = {
  /** Il segno «ho già caricato» del componente: resta acceso perché chiudere il box non lo smonta. */
  giaCaricato: boolean;
  /** Il ripescaggio dai lavori è già andato a buon fine almeno una volta per questa casella. */
  recuperoFatto: boolean;
  /** La chat unificata ricorda proprio QUESTA casella. */
  unificataMia: boolean;
  /** Quanti messaggi porta la chat unificata (zero = non c'è niente da riusare). */
  unificataMessaggi: number;
  /** Il thread che la casella ha adesso a schermo. */
  threadCorrente: MsgApertura[];
};

export type PianoApertura = {
  /** Andare a rileggere le conversazioni salvate (server, poi locale). */
  leggiSalvati: boolean;
  /** Ripartire dal thread che la chat unificata ha già in mano. */
  usaUnificata: boolean;
  /** Andare a ripescare la risposta dai lavori. */
  recupera: boolean;
  /** Perché si ripesca (o perché no): serve a chi legge il codice fra sei mesi. */
  perche: string;
};

/**
 * Una bolla `pending` è una promessa non mantenuta: è l'avviso «tempo scaduto, la risposta vera
 * verrà ripescata». Finché è lì, quel ripescaggio DEVE essere ritentato a ogni apertura.
 */
export function threadHaSospeso(thread: MsgApertura[] | null | undefined): boolean {
  return (Array.isArray(thread) ? thread : []).some((m) => Boolean(m?.pending));
}

/**
 * Cosa fa la casella quando la si apre.
 *
 * La regola che cura il difetto sta in una riga sola: **il recupero non dipende da `giaCaricato` né
 * dalla chat unificata**. Prima era il contrario — ed è per questo che le due uscite anticipate lo
 * spegnevano. Adesso la chat unificata dice solo da dove PARTIRE, e il ripescaggio si fa comunque
 * finché non è mai riuscito o finché a schermo resta una promessa sospesa.
 */
export function pianoApertura(s: StatoApertura): PianoApertura {
  const unificataMessaggi = Number(s?.unificataMessaggi ?? 0);
  const usaUnificata = Boolean(s?.unificataMia) && unificataMessaggi > 0;
  const leggiSalvati = !s?.giaCaricato && !usaUnificata;
  const sospeso = threadHaSospeso(s?.threadCorrente);
  const recupera = !s?.recuperoFatto || sospeso;
  const perche = sospeso
    ? "a schermo c'è una risposta promessa e mai arrivata: si ripesca finché non arriva"
    : !s?.recuperoFatto
      ? "questa casella non ha mai ripescato dai lavori"
      : "già ripescato e niente in sospeso: non serve rileggere";
  return { leggiSalvati, usaUnificata, recupera, perche };
}
