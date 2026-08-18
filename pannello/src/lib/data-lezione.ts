// 📅 LA DATA DI UNA LEZIONE — un solo posto che sa leggerla, per tutte le forme che ha in archivio.
//
// IL DIFETTO, misurato il 18/8 sul file vero dopo che Nicola ha detto «non è cambiato niente».
// La scheda Apprendimento dichiarava «0 lezioni negli ultimi 7 giorni» mentre in archivio ce n'erano
// NOVE scritte in quella finestra — cinque delle quali il giorno prima. Il conto giusto è 9, e la
// schermata mostrava 0.
//
// La causa: in `apprendimento.json` convivono DUE forme di lezione. Quella storica porta
// `nato` + `ultima_conferma` + `stato`; quella scritta da `cervello/lezione-nuova.mjs` porta il solo
// campo `data`. Il lettore cercava `ultima_conferma || nato`, non trovava niente, e una lezione
// senza data non è mai «recente» — quindi le lezioni scritte dalla macchina stessa erano invisibili
// proprio nella scheda che serve a vedere se la macchina impara. Sedici lezioni su 526 stanno in
// quella forma, e sono tutte quelle recenti: il contatore non era impreciso, era muto.
//
// La beffa che vale la pena tenere scritta: il commento di `risposta-snella.ts` racconta che l'autore
// aveva cercato «il campo `data`/`creata` — nomi plausibili che nel file non esistono». Esistevano.
// Non li aveva trovati perché ha guardato una lezione sola. È lo stesso errore di misura che il
// guardiano `misura-cieca` ha imparato a fermare il giorno prima: un «non c'è» dedotto da una ricerca
// che non copriva tutto.
//
// Il ripiego NON è generoso: prende solo campi che nel file esistono davvero, in ordine di precisione
// (conferma più recente → nascita → data di scrittura). Una lezione senza nessuno dei tre resta senza
// data, come prima: qui si legge quello che c'è, non si inventa un giorno.

export type ConData = { ultima_conferma?: string; nato?: string; data?: string };

export function dataLezione(l: ConData | null | undefined): Date | null {
  const raw = String(l?.ultima_conferma || l?.nato || l?.data || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const dt = new Date(`${raw}T12:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function lezioneRecente(l: ConData | null | undefined, giorni = 7, adesso = new Date()): boolean {
  const dt = dataLezione(l);
  if (!dt) return false;
  const lim = new Date(adesso);
  lim.setDate(lim.getDate() - giorni);
  lim.setHours(0, 0, 0, 0);
  return dt >= lim;
}
