// Scaricare un pezzo del Pannello, riprovando se la rete ha un intoppo (perf home, 25/11/2026).
//
// Da quando le aree che non sono la home arrivano in pezzi separati (`next/dynamic` in page.tsx),
// un pezzo può non arrivare: rete del telefono che cade un attimo al primo clic, oppure una
// versione nuova pubblicata mentre la scheda era aperta. `next/dynamic` si ricorda il fallimento,
// quindi qui si riprova PRIMA di arrendersi: due tentativi in più, a 0,6 e 1,2 secondi.
// Se fallisce ancora, l'errore sale a `ReteArea`, che col pulsante «Riprova» ricarica la pagina.
export async function importConRiprova<T>(carica: () => Promise<T>, tentativi = 2, attesaMs = 600): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await carica();
    } catch (e) {
      if (i >= tentativi) throw e;
      await new Promise((r) => setTimeout(r, attesaMs * (i + 1)));
    }
  }
}

/** Vero se l'errore è «un pezzo del Pannello non si è scaricato» (non un errore del codice dell'area). */
export function ePezzoMancante(e: unknown): boolean {
  const nome = (e as { name?: unknown })?.name;
  const msg = String((e as { message?: unknown })?.message ?? "");
  return nome === "ChunkLoadError" || /Loading (CSS )?chunk|dynamically imported module|Importing a module script failed/i.test(msg);
}
