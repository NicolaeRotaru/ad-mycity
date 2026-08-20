// 🧯 MEMORIA FERMA — il verdetto che mancava dal 30/7 al 4/8 (AR-544).
//
// Per quattro giorni la macchina ha lavorato a ogni giro senza riuscire a pubblicare (uno spazio di
// indentazione bloccava il commit → albero sporco → niente rebase → niente push: AR-530). La Cabina
// aveva ENTRAMBI i segnali per accorgersene — `worker:ultimo` (battito Supabase, sempre fresco) e
// `memoria-ad:ultimo_push` (scritto SOLO a push riuscito, fermo al 30/7) — ma nessun punto del
// codice li incrociava: la home diceva «🟢 Viva» col battito e mostrava numeri di quattro giorni
// prima. Questo modulo è quell'incrocio. Puro apposta e senza import: un test lo esegue con i
// numeri veri dell'incidente, qualunque anello si rompa la prossima volta (spazio, quota, token,
// rete) l'allarme è lo stesso, perché guarda l'EFFETTO — il push che non arriva — non la causa.
//
// La soglia: in esercizio normale la memoria arriva su GitHub più volte al giorno (giro + sync del
// worker dopo i lavori chat). Dodici ore senza un push riuscito non sono mai «tutto bene»: o la
// macchina è ferma, o lavora e non pubblica — in entrambi i casi il Pannello sta mostrando il
// passato, e deve dirlo lui, forte, invece di aspettare che Nicola se ne accorga a occhio.

export const MEMORIA_FERMA_TETTO_ORE = 12;

export type VerdettoMemoriaFerma = {
  /** true = l'ultimo push riuscito è oltre il tetto: ciò che il Pannello mostra è di allora. */
  ferma: boolean;
  /** Ore dall'ultimo push riuscito (null = mai registrato un push). */
  oreFerma: number | null;
  /** true = `memoria-ad:ultimo_push` non esiste: non so di quando sono i dati. Non è un verde. */
  maiVisto: boolean;
  /** true = il worker dà battito: se `ferma`, la frase giusta è «lavora ma non pubblica». */
  macchinaLavora: boolean;
};

export function verdettoMemoriaFerma({
  oreWorker,
  orePush,
  tettoOre = MEMORIA_FERMA_TETTO_ORE,
}: {
  oreWorker: number | null;
  orePush: number | null;
  tettoOre?: number;
}): VerdettoMemoriaFerma {
  // 0.5h e non 0.1h (il `workerVivo` della diagnosi): qui il battito sceglie solo la FRASE, e un
  // worker impegnato in un lavoro lungo non deve far scrivere «macchina spenta» mentre lavora.
  const macchinaLavora = oreWorker != null && oreWorker <= 0.5;
  if (orePush == null) return { ferma: false, oreFerma: null, maiVisto: true, macchinaLavora };
  return { ferma: orePush > tettoOre, oreFerma: orePush, maiVisto: false, macchinaLavora };
}

// ─────────────────────────────────────────────────────────────────────────────
// AR-367 — COM'È ANDATO L'ULTIMO GIRO, e perché il Pannello non lo sapeva
// ─────────────────────────────────────────────────────────────────────────────
//
// Il giro scrive `auto-coscienza/esito-giro.json` a ogni uscita, e quel file si autodescrive così:
// «questo file dice la verita, e il Pannello la puo leggere». Il Pannello non lo apriva. Zero
// occorrenze di `esito-giro` in tutto `pannello/src`: l'unico lettore reale era una persona che
// apriva il JSON a mano. Per due giorni il file ha detto `pulito: false, gate_rossi: 2` e la home ha
// continuato a mostrare 🟢 Viva.
//
// La causa è più larga del file: il difetto era stato chiuso quando l'esito veniva SCRITTO, non
// quando veniva CONSUMATO — la macchina considera un fatto «reso disponibile» equivalente a
// «usato». Scrivere una misura costa poco; non usarla non costa niente.
//
// `macchinaViva` guardava SE un giro era avvenuto, mai se fosse andato a buon fine. Da qui in poi
// sono due domande separate: il giro è recente? e il giro è finito pulito? Un giro recente ma con
// dei cancelli rossi NON è una macchina viva — è una macchina che gira a vuoto, ed è la cosa che
// Nicola deve leggere sulla home invece di un pallino verde.
//
// Questo modulo è il gemello lato Pannello di `cervello/eta-referto.mjs` (tre esiti: fresco ·
// stantio · non l'ho potuto vedere). Sono due perché vivono in due runtime diversi — una pagina
// Next non può importare un `.mjs` del cervello — ed è una duplicazione DICHIARATA, con la sua
// prova, non una svista. Stessa scelta già fatta per `badge-coerenza.ts` e `freschezza-intelligence.ts`.

/** Quanto può essere vecchio l'esito dell'ultimo giro prima che smetta di dire qualcosa su adesso. */
export const GIRO_SCADUTO_ORE = 26;

export type SegnaleGiro = {
  /** Il timbro scritto dentro il file, non la data del file: un checkout riscrive la seconda. */
  quando: string | null;
  /** L'ultimo giro è uscito senza cancelli rossi? `null` = il file non lo dice. */
  pulito: boolean | null;
  /** Quanti cancelli erano rossi all'uscita. */
  gateRossi: number | null;
  /** L'etichetta del giro («non-pubblicato», «vincoli-attivi», «ok»…). */
  esito: string | null;
};

/**
 * Legge `esito-giro.json` da testo. Torna `null` quando il file non c'è o non si parsa: null è
 * «non l'ho potuto vedere», che non è «è andato bene».
 */
export function segnaleGiroDaJson(testo: string | null | undefined): SegnaleGiro | null {
  if (!testo?.trim()) return null;
  try {
    const d = JSON.parse(testo) as Record<string, unknown>;
    if (!d || typeof d !== "object") return null;
    return {
      quando: typeof d.data === "string" ? d.data : null,
      pulito: typeof d.pulito === "boolean" ? d.pulito : null,
      gateRossi: typeof d.gate_rossi === "number" ? d.gate_rossi : null,
      esito: typeof d.esito === "string" ? d.esito : null,
    };
  } catch {
    return null;
  }
}

export type VerdettoGiro = {
  /** "fresco" = recente e pulito · "stantio" = vecchio o finito male · "non_visto" = non lo so. */
  stato: "fresco" | "stantio" | "non_visto";
  /** L'unico verde possibile. ⚪ non è mai un verde: con due soli esiti finirebbe nel primo. */
  verde: boolean;
  /** La frase da mostrare, scritta come la direbbe una persona. */
  frase: string;
};

/**
 * Il verdetto sull'ultimo giro: recente E pulito.
 *
 * @param oreGiro   ore dall'ultimo giro (null = non lo so).
 * @param segnale   quello che dice `esito-giro.json` (null = non l'ho potuto leggere).
 */
export function verdettoUltimoGiro(
  oreGiro: number | null,
  segnale: SegnaleGiro | null,
  tettoOre = GIRO_SCADUTO_ORE,
): VerdettoGiro {
  if (oreGiro == null) return { stato: "non_visto", verde: false, frase: "non risulta nessun giro: da qui non so se la macchina abbia girato" };
  if (oreGiro > tettoOre)
    return { stato: "stantio", verde: false, frase: `l'ultimo giro è di ${etaTesto(oreGiro)} fa: quello che vedi qui è di allora` };
  if (!segnale) return { stato: "non_visto", verde: false, frase: "c'è stato un giro ma non trovo com'è andato: non posso dire che sia andato bene" };
  if (segnale.pulito === null) return { stato: "non_visto", verde: false, frase: "l'ultimo giro non dice se è uscito pulito: non lo do per buono" };
  if (!segnale.pulito) {
    const quanti = segnale.gateRossi ?? 0;
    return {
      stato: "stantio",
      verde: false,
      frase:
        quanti > 0
          ? `l'ultimo giro è finito con ${quanti} ${quanti === 1 ? "cancello rosso" : "cancelli rossi"}: ha girato ma non ha consegnato`
          : "l'ultimo giro non è uscito pulito: ha girato ma non ha consegnato",
    };
  }
  return { stato: "fresco", verde: true, frase: `ultimo giro ${etaTesto(oreGiro)} fa, uscito pulito` };
}

/** «114» → «4 giorni e 18 ore»: l'età si legge a voce, non si calcola a mente. */
export function etaTesto(ore: number): string {
  if (ore < 1) return `${Math.round(ore * 60)} minuti`;
  if (ore < 48) return `${Math.round(ore)} ore`;
  const giorni = Math.floor(ore / 24);
  const resto = Math.round(ore - giorni * 24);
  return resto > 0 ? `${giorni} giorni e ${resto} ore` : `${giorni} giorni`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LE DUE CORSIE DEL WORKER — chi batte non è chi lavora (18–20/8/2026)
// ─────────────────────────────────────────────────────────────────────────────
//
// Sul VPS girano due worker: `all` (mycity-worker: giro, ritmo, analisi, azioni, pubblicazione
// della memoria) e `chat` (mycity-worker-chat: solo le risposte nel Pannello). Ognuno scrive il
// suo battito in `worker:ultimo:<corsia>`, ed entrambi scrivono anche `worker:ultimo` — «il più
// recente di chiunque», tenuto per retrocompatibilità.
//
// Il 18/8 alle 04:46 la corsia `all` è morta e non è più ripartita (un lucchetto condiviso la
// escludeva a ogni riavvio: vedi cervello/worker.sh). La corsia `chat` è rimasta viva e ha
// continuato a scrivere `worker:ultimo` ogni minuto. La home leggeva SOLO quella chiave, prendeva
// la scorciatoia «il worker sta lavorando adesso» e mostrava il pallino verde — mentre la coda
// accumulava sedici lavori mai presi in carico e la memoria non si pubblicava da due giorni.
//
// Chi batte non è chi lavora. La scorciatoia deve chiedere alla corsia CHE FA I LAVORI, e quando
// quella tace bisogna dirlo con la frase giusta: «risponde in chat ma non lavora» è un'informazione
// che il 18/8 avrebbe fatto guadagnare due giorni. Un battito che non viene dalla corsia giusta non
// è un verde: è un battito di qualcun altro.

/** La corsia che fa i lavori veri: giro, ritmo, azioni, pubblicazione della memoria. */
export const CORSIA_LAVORI = "all";

/** Entro quanto un battito vale come «adesso» (6 minuti). */
export const BATTITO_ADESSO_ORE = 0.1;

export type VerdettoCorsie = {
  /** true = la corsia dei lavori sta battendo ADESSO: l'unico caso in cui la scorciatoia è lecita. */
  lavoraAdesso: boolean;
  /** true = qualcuno batte, ma non la corsia dei lavori. È il guasto del 18/8, visto da fuori. */
  soloChat: boolean;
  /** La frase da mostrare quando `soloChat`; `null` quando non c'è niente da aggiungere. */
  frase: string | null;
};

/**
 * Chi sta battendo, e se è quello che serve.
 *
 * @param oreCorsiaLavori ore dall'ultimo battito di `worker:ultimo:all` (null = non lo so).
 * @param oreQualsiasiCorsia ore dall'ultimo battito di chiunque (`worker:ultimo`).
 */
export function verdettoCorsie({
  oreCorsiaLavori,
  oreQualsiasiCorsia,
  adessoOre = BATTITO_ADESSO_ORE,
}: {
  oreCorsiaLavori: number | null;
  oreQualsiasiCorsia: number | null;
  adessoOre?: number;
}): VerdettoCorsie {
  const lavoraAdesso = oreCorsiaLavori != null && oreCorsiaLavori <= adessoOre;
  if (lavoraAdesso) return { lavoraAdesso: true, soloChat: false, frase: null };

  const qualcunoBatte = oreQualsiasiCorsia != null && oreQualsiasiCorsia <= adessoOre;
  if (!qualcunoBatte) return { lavoraAdesso: false, soloChat: false, frase: null };

  // Qualcuno batte ma non la corsia dei lavori. Se il battito per-corsia manca del tutto è un worker
  // con codice vecchio: non lo do per vivo (⚪ non è ✅), ma non invento nemmeno da quanto è fermo.
  const frase =
    oreCorsiaLavori == null
      ? "risponde in chat, ma da qui non vedo il worker dei lavori: giro, ritmo e azioni potrebbero essere fermi"
      : `risponde in chat, ma il worker dei lavori è fermo da ${etaTesto(oreCorsiaLavori)}: giro, ritmo e azioni non partono`;
  return { lavoraAdesso: false, soloChat: true, frase };
}
