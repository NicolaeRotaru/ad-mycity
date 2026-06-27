// Esecuzione delle azioni approvate dal proprietario, tramite n8n: l'app invia
// l'azione a un webhook n8n, e n8n esegue il lavoro reale (post social, WhatsApp,
// email, ecc.). Cosi' l'assistente "agisce" senza integrare ogni app a mano.
// Niente parte senza la conferma dell'utente (la pressione di "Approva").

const N8N = process.env.N8N_WEBHOOK_URL;

// Interruttore esplicito (stesso di lib/mani.ts): senza questo l'azione NON parte davvero, si "simula".
// Evita che una richiesta a /api/esegui spari al webhook n8n reale senza un via consapevole.
function azioniLive(): boolean {
  return process.env.AZIONI_LIVE === "on" || process.env.AZIONI_LIVE === "1";
}

export function azioniCollegato(): boolean {
  return Boolean(N8N);
}

export async function eseguiAzione(azione: {
  titolo?: string;
  motivo?: string;
  livello?: string;
}): Promise<{ collegato: boolean; ok?: boolean; simulata?: boolean; risultato?: string }> {
  if (!N8N) return { collegato: false };
  // Gate di sicurezza: col webhook collegato ma AZIONI_LIVE spento, NON inviamo (modalità test).
  if (!azioniLive()) {
    return { collegato: true, ok: false, simulata: true, risultato: "Simulata (AZIONI_LIVE off): non inviata a n8n. Imposta AZIONI_LIVE=1 per inviare davvero." };
  }
  try {
    const r = await fetch(N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...azione,
        fonte: "mycity-assistant",
        at: new Date().toISOString(),
      }),
    });
    const txt = (await r.text()).slice(0, 500);
    return { collegato: true, ok: r.ok, risultato: r.ok ? txt || "Azione inviata all'automazione." : `Errore n8n: ${r.status} ${txt}` };
  } catch (e: any) {
    return { collegato: true, ok: false, risultato: `Errore: ${e.message}` };
  }
}
