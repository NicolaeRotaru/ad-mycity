import { NextResponse } from "next/server";
import { creaLavoro, getLavori, memoryConnected, setImpostazione } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🎛️ Comandi macchina (VPS) — dal Pannello mando alla macchina un comando SICURO e ne vedo il
// risultato. NIENTE shell arbitraria (sarebbe un buco di sicurezza / RCE): solo una LISTA CHIUSA
// di operazioni note. Ognuna o accende un flag che il worker legge (riavvio), o mette in coda un
// lavoro di un TIPO che il worker già sa eseguire (giro / ritmo-mattino / ritmo-sera). A eseguirli
// è il worker sul VPS; i risultati tornano nel campo `risultato` del lavoro e li rileggiamo qui.

type Kind =
  | { kind: "flag"; chiave: string; valore: string }
  | { kind: "lavoro"; tipo: string; richiesta: string };

const COMANDI: Record<string, { label: string; descr: string } & Kind> = {
  riavvia: {
    label: "Riavvia worker",
    descr: "Chiede al worker di ricaricarsi (flag letto a ogni ciclo). La coda non si perde.",
    kind: "flag",
    chiave: "worker:riavvia",
    valore: "on",
  },
  giro: {
    label: "Fai un giro adesso",
    descr: "Mette in coda un giro di perlustrazione: la macchina rilegge i dati e aggiorna la memoria.",
    kind: "lavoro",
    tipo: "giro",
    richiesta: "Giro di perlustrazione richiesto a mano dal Pannello (Comandi macchina).",
  },
  "ritmo-mattino": {
    label: "Rigenera Piano del mattino",
    descr: "Riscrive subito il «Piano del mattino» in RITMO.md (bypassa il delta-gate).",
    kind: "lavoro",
    tipo: "ritmo-mattino",
    richiesta: "Rigenera il Piano del mattino su richiesta dal Pannello (Comandi macchina).",
  },
  "ritmo-sera": {
    label: "Rigenera Report della sera",
    descr: "Riscrive subito il «Report della sera» in RITMO.md (bypassa il delta-gate).",
    kind: "lavoro",
    tipo: "ritmo-sera",
    richiesta: "Rigenera il Report della sera su richiesta dal Pannello (Comandi macchina).",
  },
};

// I tipi di lavoro che sono "comandi VPS": servono a filtrare i risultati da mostrare.
const TIPI_COMANDO = Object.values(COMANDI)
  .filter((c): c is typeof c & { kind: "lavoro" } => c.kind === "lavoro")
  .map((c) => c.tipo);

/** Elenco comandi disponibili (per popolare i pulsanti) + ultimi risultati. */
export async function GET() {
  const catalogo = Object.entries(COMANDI).map(([id, c]) => ({ id, label: c.label, descr: c.descr }));
  if (!memoryConnected()) {
    return NextResponse.json({ collegato: false, catalogo, risultati: [] });
  }
  const lavori = await getLavori(60);
  const risultati = lavori
    .filter((l) => TIPI_COMANDO.includes(l.tipo))
    .slice(0, 12)
    .map((l) => ({
      id: l.id,
      tipo: l.tipo,
      // "errore" lo mostriamo come "da riapprovare" (coerente col resto del Pannello, fix #6).
      stato: l.stato,
      richiesta: l.richiesta,
      risultato: l.risultato,
      created_at: l.created_at,
      updated_at: l.updated_at,
    }));
  return NextResponse.json({ collegato: true, catalogo, risultati });
}

/** Esegue un comando SICURO dalla lista chiusa. */
export async function POST(req: Request) {
  if (!memoryConnected()) {
    return NextResponse.json({ ok: false, error: "Memoria Supabase non collegata su Vercel." }, { status: 503 });
  }
  let body: any = {};
  try {
    body = await req.json();
  } catch {}
  const id = String(body?.comando || "");
  const c = COMANDI[id];
  if (!c) {
    return NextResponse.json(
      { ok: false, error: `Comando non riconosciuto. Ammessi: ${Object.keys(COMANDI).join(", ")}.` },
      { status: 400 },
    );
  }

  if (c.kind === "flag") {
    const ok = await setImpostazione(c.chiave, c.valore);
    if (!ok) return NextResponse.json({ ok: false, error: "Impossibile scrivere il flag (tabella impostazioni)." }, { status: 502 });
    return NextResponse.json({
      ok: true,
      messaggio: "Richiesta inviata: il worker la esegue al prossimo ciclo (pochi secondi se libero; a fine lavoro se occupato).",
    });
  }

  // kind === "lavoro": mette in coda un lavoro che il worker sa eseguire.
  const lav = await creaLavoro(c.richiesta, c.tipo);
  if (!lav) {
    return NextResponse.json({ ok: false, error: "Impossibile mettere il comando in coda (tabella lavori)." }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    id: lav.id,
    messaggio: "Comando messo in coda. Lo esegue il worker sul VPS: se è acceso parte subito, altrimenti resta in coda e riparte da solo appena torna attivo. Il risultato compare qui sotto.",
  });
}
