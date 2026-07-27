/**
 * AR-235 — le REGOLE della rete di sync, senza React e senza alias.
 *
 * Stanno qui e non in panel-sync.ts per un motivo pratico e ricorrente: quel file importa React e
 * `@/lib/format`, quindi fuori da Next non è importabile — una regola scritta là dentro si potrebbe
 * solo rileggere, mai eseguire in un test. È la stessa forma di prova debole che il 27/7 ha lasciato
 * passare 91 chiusure false, ed è il terzo file di questa sessione che nasce per lo stesso motivo
 * (dopo cervello/giro-esito.sh e pannello/src/lib/serratura.ts).
 *
 * Nessun import: solo ragionamento sui dati.
 */

export type SyncScope = "azioni" | "radiografia" | "memoria" | "lavori" | "all";
export type LavoroSync = { id: string; stato: string; tipo?: string };

/** Quali scope aggiornare quando un lavoro del worker passa a «fatto». */
export function scopesDaLavoro(tipo: string): SyncScope[] {
  const t = (tipo || "").toLowerCase();
  if (/esegui-azione|rifiuta-azione/.test(t)) return ["azioni", "radiografia", "memoria"];
  if (/giro|briefing|radiografia|auto-coscienza/.test(t)) return ["memoria", "azioni", "radiografia"];
  if (/supervisione|marketplace|negozi/.test(t)) return ["memoria", "azioni"];
  return ["memoria"];
}

/**
 * Confronta due fotografie successive dei lavori e dice cosa va rinfrescato.
 *
 * Il difetto: la condizione era `if (!prima || prima === "fatto" || l.stato !== "fatto") continue`.
 * Quel `!prima` scartava i lavori MAI VISTI nella fotografia precedente — cioè esattamente quelli
 * nati e finiti mentre la scheda era in secondo piano, o mentre il computer dormiva. Il rinfresco
 * partiva solo se il browser aveva *visto con i propri occhi* il passaggio di stato: un requisito
 * che il browser, quando è in secondo piano, non può soddisfare. Risultato: al ritorno le liste
 * restavano indietro e le cose già fatte continuavano a comparire come da fare.
 *
 * Il fix non è togliere `!prima` e basta: al PRIMO caricamento tutti i lavori sono nuovi e molti già
 * «fatto», quindi partirebbe un rinfresco a raffica a ogni apertura della pagina — peggio del male.
 * La distinzione giusta è fra «non ho un termine di paragone» (prima fotografia: non emetto, i dati
 * li sto già caricando) e «avevo un termine di paragone e questo lavoro non c'era» (è nato e finito
 * mentre non guardavo: emetto).
 */
export function scopesDaRinfrescare(prev: LavoroSync[], next: LavoroSync[]): SyncScope[] {
  if (!prev.length) return [];
  const was = new Map(prev.map((l) => [l.id, l.stato]));
  const scopes = new Set<SyncScope>();
  for (const l of next) {
    if (l.stato !== "fatto") continue;
    const prima = was.get(l.id);
    if (prima === "fatto") continue; // era già finito prima: niente di nuovo
    // `prima === undefined` NON si salta più: è il lavoro nato e finito mentre non guardavamo.
    for (const s of scopesDaLavoro(l.tipo || "")) scopes.add(s);
  }
  return [...scopes];
}

/**
 * Quanto dev'essere «vecchio» un dato perché valga la pena rileggerlo al ritorno sulla scheda.
 *
 * Senza una soglia, ogni passaggio da un'altra app e ogni cambio di scheda farebbe ripartire tutte
 * le fetch di tutte le caselle: su telefono sarebbe un rinfresco continuo. Con la soglia, il ripasso
 * scatta solo se sei stato via abbastanza da poterti perdere qualcosa.
 */
export const RITORNO_MIN_MS = 20_000;

export function deveRinfrescareAlRitorno(
  ultimoCaricamento: number | null,
  adesso: number,
  minMs: number = RITORNO_MIN_MS,
): boolean {
  if (ultimoCaricamento == null) return true; // non abbiamo mai caricato: rileggi
  if (ultimoCaricamento > adesso) return true; // orologio spostato: nel dubbio si rilegge
  return adesso - ultimoCaricamento >= minMs;
}
