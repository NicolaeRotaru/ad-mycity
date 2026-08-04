// 🧯 MEMORIA FERMA — il verdetto che mancava dal 30/7 al 4/8 (AR-534).
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

/** «114» → «4 giorni e 18 ore»: l'età si legge a voce, non si calcola a mente. */
export function etaTesto(ore: number): string {
  if (ore < 1) return `${Math.round(ore * 60)} minuti`;
  if (ore < 48) return `${Math.round(ore)} ore`;
  const giorni = Math.floor(ore / 24);
  const resto = Math.round(ore - giorni * 24);
  return resto > 0 ? `${giorni} giorni e ${resto} ore` : `${giorni} giorni`;
}
