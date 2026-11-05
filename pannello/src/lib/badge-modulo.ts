// Il numero accanto al titolo di una casella (Modulo.tsx), in una funzione pura che il test esegue.
//
// Perché esiste (collaudo del 2026-11-05): una casella la cui fonte NON si era letta mostrava «0»
// accanto al titolo. Chi la richiude vede «Sicurezza & accessi 0»: proprio lo zero falso che le
// note dentro la casella evitano. Regola: non letto = «—»; letto e vuoto = «0», perché è vero.

export type DatiBadge = {
  righe: unknown[] | null; // null = elenco non ancora caricato (o la casella non ha elenco)
  collegato: boolean; // la fonte dell'elenco è stata letta?
  conta: number | null; // quante COSE ci sono, se la fonte lo dice (58 difetti in 8 righe)
  kpiAccesi: number;
  kpiTotali: number;
  statoLabel: string; // «live» / «parziale» / «da collegare», prima di aprire la casella
};

export function etichettaBadge(d: DatiBadge): string {
  if (d.righe) {
    if (!d.collegato && d.righe.length === 0) return "—";
    return String(d.conta ?? d.righe.length);
  }
  return d.kpiTotali ? `${d.kpiAccesi}/${d.kpiTotali}` : d.statoLabel;
}
