// Carica le conversazioni recenti dal server e restituisce un blocco testo compresso
// da includere nella richiesta al cervello — così l'AD sa cosa è già stato fatto
// nelle sessioni precedenti senza dover chiedere a Nicola.

const MAX_CONV = 6;    // ultime N conversazioni (esclusa quella corrente)
const MAX_SCAMBI = 4;  // scambi per conversazione (ogni scambio = 1 msg Nicola + 1 AD)
const MAX_CHAR = 360;  // caratteri max per messaggio (troncato con …)

function tronca(s: string, n: number): string {
  const pulito = s.replace(/\s+/g, " ").trim();
  return pulito.length > n ? pulito.slice(0, n) + "…" : pulito;
}

type ConvMemoria = { id?: string | number; titolo?: string; messaggi?: unknown };

/** Formatta le ultime conversazioni in blocco testo per il cervello (client + server). */
export function formattaBloccoMemoriaChat(
  lista: ConvMemoria[],
  convIdCorrente?: string | null,
): string {
  const recenti = lista
    .filter((c) => !convIdCorrente || String(c.id) !== String(convIdCorrente))
    .slice(0, MAX_CONV);

  if (recenti.length === 0) return "";

  const righe: string[] = [
    "## Memoria chat precedenti (ultime sessioni)",
    "[Controlla qui prima di chiedere a Nicola se qualcosa è già stato fatto]",
  ];

  for (const conv of recenti) {
    const msgs: Array<{ role: string; content: string }> = Array.isArray(conv.messaggi)
      ? (conv.messaggi as Array<{ role: string; content: string }>)
      : [];
    const reali = msgs.filter((m) => m.content?.trim());
    if (reali.length === 0) continue;

    const titolo = (conv.titolo || "conversazione").replace(/^💬\s*/, "");
    righe.push(`\n### "${titolo}"`);

    const ultimi = reali.slice(-MAX_SCAMBI * 2);
    for (const m of ultimi) {
      const chi = m.role === "user" ? "Nicola" : "AD";
      righe.push(`${chi}: ${tronca(m.content, MAX_CHAR)}`);
    }
  }

  return righe.join("\n") + "\n";
}

export async function bloccoMemoriaChat(convIdCorrente?: string | null): Promise<string> {
  try {
    const d = await fetch("/api/conversazioni", { cache: "no-store" }).then((r) => r.json());
    const lista: ConvMemoria[] = Array.isArray(d?.conversazioni) ? d.conversazioni : [];
    return formattaBloccoMemoriaChat(lista, convIdCorrente);
  } catch {
    return ""; // rete instabile o tabella assente: si procede senza memoria
  }
}
