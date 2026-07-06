// Riconoscimento comandi rapidi dell'AD dalla chat del Pannello.
// Tienilo allineato a COMANDI.md / CLAUDE.md.

const GIRO_RE = /^fai\s+un\s+giro[.!?\s]*$/i;

/** Nicola ha scritto (solo) "fai un giro"? */
export function isComandoGiro(testo: string): boolean {
  return GIRO_RE.test(String(testo || "").trim());
}

/** Prompt standard del giro (come heartbeat + giro.md). */
export const PROMPT_GIRO =
  "Fai un GIRO DI PERLUSTRAZIONE come AD digitale di MyCity (esegui cervello/giro.md per intero): " +
  "leggi i dati reali, controlla le sentinelle, scrivi il briefing completo, aggiorna STATO e la memoria. " +
  "Pubblica la memoria sul RAMO UNICO main (da cloud agent: PR con base main, poi merge). Il Pannello legge main via GitHub. " +
  "Al termine restituisci a Nicola il TL;DR del briefing (5 righe + mossa n.1).";

export function preparaLavoro(
  testo: string,
  tipoEsplicito?: string
): { richiesta: string; tipo: string; timeoutMs: number } {
  const t = String(testo || "").trim();
  if (tipoEsplicito === "giro" || isComandoGiro(t)) {
    return { richiesta: PROMPT_GIRO, tipo: "giro", timeoutMs: 45 * 60 * 1000 };
  }
  const tipo = tipoEsplicito || "chat";
  return { richiesta: t, tipo, timeoutMs: tipo === "giro" ? 45 * 60 * 1000 : 5 * 60 * 1000 };
}

/** Messaggio quando il polling della chat scade prima che il cervello finisca. */
export function messaggioLavoroInCorso(tipo: string): string {
  if (tipo === "giro") {
    return (
      "🔄 **Giro accodato** — un giro completo richiede 15–45 minuti.\n\n" +
      "La memoria va sul **ramo unico `main`** (il Pannello legge da lì via GitHub). " +
      "Segui l'avanzamento in **«Lavori del cervello»**; quando finisce, la risposta compare anche qui."
    );
  }
  return "⌛ Ci sto ancora lavorando: la risposta arriva a breve (puoi vederla anche in «Lavori del cervello»).";
}
