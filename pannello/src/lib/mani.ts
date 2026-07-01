// Le "mani" dell'AD: i canali con cui un'azione approvata tocca il mondo reale.
// Per ora: EMAIL via Resend. Sicuro per costruzione — invia DAVVERO solo se:
//   1) c'è la chiave (RESEND_API_KEY),
//   2) c'è un destinatario,
//   3) l'interruttore esplicito AZIONI_LIVE ("on" o "1").
// Altrimenti: "simulata" (prova a vuoto, NON invia) o resta "in coda" col motivo.
// Così non parte mai niente per sbaglio.

export type EsitoStato = "fatta" | "simulata" | "coda";
export type Esito = { stato: EsitoStato; dettaglio: string };

type AzioneEseguibile = { titolo: string; canale: string; destinatario?: string; testo: string };

function resendConfigurato(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}
function isEmail(canale: string): boolean {
  return /e-?mail|mail/i.test(canale || "");
}
function oraRoma(): string {
  try {
    return new Intl.DateTimeFormat("it-IT", { timeZone: "Europe/Rome", hour: "2-digit", minute: "2-digit" }).format(new Date());
  } catch {
    return "";
  }
}
// L'oggetto dell'email: la riga "Oggetto: ..." del testo, altrimenti il titolo.
function oggettoDa(testo: string, titolo: string): string {
  const m = (testo || "").match(/^\s*Oggetto:\s*(.+)$/im);
  return m ? m[1].trim() : titolo;
}
// Il corpo: il testo senza la riga "Oggetto:".
function corpoDa(testo: string): string {
  return (testo || "").replace(/^\s*Oggetto:\s*.+$/im, "").trim();
}

async function inviaEmail(a: string, oggetto: string, testo: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "MyCity <onboarding@resend.dev>",
        to: [a],
        subject: oggetto,
        text: testo,
      }),
    });
    if (!res.ok) {
      const d: any = await res.json().catch(() => ({}));
      return { ok: false, error: d?.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "errore di rete" };
  }
}

// Esegue (o mette in coda) un'azione. Non lancia mai eccezioni: torna sempre un Esito.
export async function eseguiAzione(a: AzioneEseguibile): Promise<Esito> {
  const ora = oraRoma();
  if (!isEmail(a.canale)) {
    return { stato: "coda", dettaglio: `Canale "${a.canale || "non indicato"}" non ancora collegato: resta in coda.` };
  }
  if (!a.destinatario) {
    return { stato: "coda", dettaglio: "Manca l'indirizzo email del destinatario: resta in coda." };
  }
  if (!resendConfigurato()) {
    return { stato: "coda", dettaglio: "Manca la chiave email (RESEND_API_KEY): resta in coda." };
  }
  // Accetta sia "on" sia "1": il resto del sistema (cervello/*, .env.example, docs) usa "1"/"0".
  const live = process.env.AZIONI_LIVE === "on" || process.env.AZIONI_LIVE === "1";
  if (!live) {
    return { stato: "simulata", dettaglio: `Simulata (modalità test) → ${a.destinatario} · ${ora}. Per inviare davvero imposta AZIONI_LIVE=1.` };
  }
  const r = await inviaEmail(a.destinatario, oggettoDa(a.testo, a.titolo), corpoDa(a.testo));
  return r.ok
    ? { stato: "fatta", dettaglio: `Inviata a ${a.destinatario} · ${ora}` }
    : { stato: "coda", dettaglio: `Invio non riuscito (${r.error}): resta in coda.` };
}
