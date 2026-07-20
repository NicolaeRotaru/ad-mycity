// Funzioni pure condivise da Parla casella — sicure per import server (API route) senza React.

export type ParlaMsg = { role: "user" | "assistant"; content: string; pending?: boolean; created_at?: string };

export const MSG_RISPOSTA_VUOTA =
  "La risposta non è arrivata. Invia di nuovo il messaggio, oppure vai in Lavori e premi «riparti» sul compito.";

/** Estrae il contesto scheda da una richiesta lavoro casella già eseguita. */
export function estraiContestoCasellaDaRichiesta(richiesta: string): string {
  const m = richiesta.match(/## Contenuto della casella\n([\s\S]*?)(?:\n## |$)/);
  return m?.[1]?.trim() || "";
}

/** Testo richiesta per il cervello su una casella (client + server). */
export function assembleRichiestaCasella(
  titolo: string,
  contesto: string,
  storia: ParlaMsg[],
  messaggio: string,
  memoria: string,
  bloccoAllegati = "",
): string {
  const storiaTxt = storia
    .filter((m) => !m.pending)
    .map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`)
    .join("\n");
  return (
    (memoria ? `${memoria}\n` : "") +
    `## Casella del Pannello: ${titolo}\n` +
    (contesto ? `\n## Contenuto della casella\n${contesto}\n` : "") +
    (storiaTxt ? `\n## Conversazione finora\n${storiaTxt}\n` : "") +
    `\n## Nuovo messaggio di Nicola\n${messaggio}` +
    bloccoAllegati +
    `\n\n## Istruzioni\nRispondi in italiano, conciso e concreto, riferito a QUESTA casella. Rispetta 🟢🟡🔴. ` +
    `Se Nicola dà un'informazione o una decisione utile, aggiorna la memoria nel vault e dichiara cosa hai aggiornato.`
  );
}

export function fondiMessaggi(a: ParlaMsg[], b: ParlaMsg[]): ParlaMsg[] {
  const pa = a.filter((m) => !m.pending);
  const pb = b.filter((m) => !m.pending);
  const base = pa.length >= pb.length ? pa : pb;
  const altro = pa.length >= pb.length ? pb : pa;
  const visti = new Set(base.map((m) => `${m.role}|${m.content}`));
  const extra = altro.filter((m) => !visti.has(`${m.role}|${m.content}`));
  return extra.length ? [...base, ...extra] : base;
}
