// 💬 "Parla con la casella" — il motore condiviso dietro il pulsante che ogni casella
// del Pannello può avere. Manda il messaggio (col contesto della casella) al cervello
// (Claude Max, via /api/lavori), aspetta la risposta, e SALVA la conversazione in
// Assistenza → Conversazioni (server se c'è la tabella, altrimenti localStorage, lo
// stesso formato della Cabina). Notifica la Cabina di ricaricare l'elenco.
// €0: nessuna API a pagamento, il lavoro pesante lo fa il tuo Max.

export type ParlaMsg = { role: "user" | "assistant"; content: string };

const HEADERS = { "Content-Type": "application/json" };

// Manda un messaggio "su QUESTA casella" al cervello e aspetta la risposta.
// `storia` = lo scambio finora (per il multi-turno); `contesto` = il contenuto della casella.
export async function chiediACasella(
  titolo: string,
  contesto: string,
  storia: ParlaMsg[],
  messaggio: string
): Promise<string> {
  const storiaTxt = storia.map((m) => `${m.role === "user" ? "Nicola" : "AD"}: ${m.content}`).join("\n");
  const richiesta =
    `## Casella del Pannello: ${titolo}\n` +
    (contesto ? `\n## Contenuto della casella\n${contesto}\n` : "") +
    (storiaTxt ? `\n## Conversazione finora\n${storiaTxt}\n` : "") +
    `\n## Nuovo messaggio di Nicola\n${messaggio}\n\n` +
    `## Istruzioni\nRispondi in italiano, conciso e concreto, riferito a QUESTA casella. Rispetta 🟢🟡🔴. ` +
    `Se Nicola dà un'informazione o una decisione utile, aggiorna la memoria nel vault e dichiara cosa hai aggiornato.`;

  const post = await fetch("/api/lavori", { method: "POST", headers: HEADERS, body: JSON.stringify({ richiesta, tipo: "chat" }) })
    .then((r) => r.json())
    .catch(() => null);
  if (!post?.ok || !post.lavoro) {
    throw new Error(post?.error || "Serve il database di memoria collegato (tabella 'lavori').");
  }
  return attendiLavoro(post.lavoro.id);
}

// Polling ravvicinato (2s) finché il cervello marca il lavoro "fatto"/"errore" (o timeout 5 min).
async function attendiLavoro(id: string): Promise<string> {
  const scadenza = Date.now() + 5 * 60 * 1000;
  while (Date.now() < scadenza) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const d = await fetch("/api/lavori", { cache: "no-store" }).then((r) => r.json());
      const l = Array.isArray(d.lavori) ? d.lavori.find((x: any) => x.id === id) : null;
      if (l && (l.stato === "fatto" || l.stato === "errore")) {
        return l.risultato || (l.stato === "errore" ? "⚠️ Errore nell'esecuzione." : "(risposta vuota)");
      }
    } catch {
      /* rete instabile: riprovo */
    }
  }
  return "⌛ Ci sto ancora lavorando: la risposta arriva a breve (la trovi anche in «Lavori del cervello»).";
}

// Salva/aggiorna la conversazione-con-la-casella in Conversazioni (Assistenza).
// Server se la tabella esiste, altrimenti localStorage (stesso formato della Cabina).
// Notifica la Cabina (`mycity:conversazioni`) di ricaricare l'elenco. Ritorna l'id.
export async function salvaConversazioneCasella(id: string | null, titolo: string, messaggi: ParlaMsg[]): Promise<string | null> {
  let nuovoId: string | null = id;
  try {
    const r = await fetch("/api/conversazioni", { method: "POST", headers: HEADERS, body: JSON.stringify({ id, titolo, messaggi }) }).then((x) => x.json());
    nuovoId = r?.ok && r.id ? String(r.id) : salvaLocale(id, titolo, messaggi);
  } catch {
    nuovoId = salvaLocale(id, titolo, messaggi);
  }
  try {
    window.dispatchEvent(new CustomEvent("mycity:conversazioni"));
  } catch {
    /* SSR / nessun window */
  }
  return nuovoId;
}

// Fallback locale: scrive nell'array `mycity_conversazioni` come fa la Cabina.
function salvaLocale(id: string | null, titolo: string, messaggi: ParlaMsg[]): string {
  const newId = id || "loc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  try {
    const list = JSON.parse(localStorage.getItem("mycity_conversazioni") || "[]");
    const esiste = list.find((c: any) => c.id === newId);
    const created_at = esiste?.created_at || new Date().toISOString();
    const altri = list.filter((c: any) => c.id !== newId);
    const nuova = [{ id: newId, titolo, messaggi, created_at, updated_at: new Date().toISOString() }, ...altri].slice(0, 100);
    localStorage.setItem("mycity_conversazioni", JSON.stringify(nuova));
  } catch {
    /* localStorage non disponibile */
  }
  return newId;
}
