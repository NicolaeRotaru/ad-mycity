import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🌉 Ponte tra l'ADMIN del marketplace e il cervello dell'AD (Claude Code, Max, sul VPS).
//
// NON usa l'API a pagamento. Scrive una riga nella coda "lavori" della MEMORIA — il
// progetto Supabase dell'AD, SEPARATO dal DB del marketplace (ordini/clienti). Lo
// stesso worker del VPS che serve il Pannello la prende, la esegue col tuo Max e
// riscrive il risultato. Un solo cervello, due facce (Pannello + Admin).
//
// Drop-in: copia in mycity-live come  src/app/api/admin/ad-chat/route.ts
// Variabili d'ambiente (server, MAI esposte al client) — nomi distinti per non
// collidere con il Supabase del marketplace:
//   MEMORIA_SUPABASE_URL          = https://LA-MEMORIA.supabase.co
//   MEMORIA_SUPABASE_SERVICE_KEY  = eyJ... (service_role del progetto MEMORIA)

const URL = process.env.MEMORIA_SUPABASE_URL || "";
const KEY = process.env.MEMORIA_SUPABASE_SERVICE_KEY || "";
const AUTH = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

function configurato(): boolean {
  return Boolean(URL && KEY);
}

// ⚠️ ADATTA QUESTO al tuo admin. Deve ritornare true SOLO per un amministratore.
// Esempio con Supabase Auth del marketplace: leggi la sessione e verifica il ruolo
// 'admin' (claim/tabella profili). Lasciato come gancio per non inventare la tua auth.
async function isAdmin(_req: NextRequest): Promise<boolean> {
  // TODO: sostituisci con il vero controllo. Finche' ritorna true, proteggi la
  // route a monte (middleware admin) o NON deployare in produzione.
  return true;
}

// POST { richiesta, tipo? } -> crea il lavoro nella coda. Ritorna { ok, id, lavoro }.
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ ok: false, error: "Non autorizzato." }, { status: 403 });
  if (!configurato()) return NextResponse.json({ ok: false, error: "Memoria AD non collegata (MEMORIA_SUPABASE_*)." }, { status: 503 });
  try {
    const { richiesta, tipo } = await req.json();
    const t = String(richiesta || "").trim();
    if (!t) return NextResponse.json({ ok: false, error: "Messaggio vuoto." }, { status: 400 });

    const res = await fetch(`${URL}/rest/v1/lavori`, {
      method: "POST",
      headers: { ...AUTH, Prefer: "return=representation" },
      body: JSON.stringify({
        richiesta: t,
        tipo: tipo ? String(tipo) : "chat",
        esperto: "admin-marketplace",
      }),
    });
    if (!res.ok) return NextResponse.json({ ok: false, error: `Memoria: HTTP ${res.status}` }, { status: 502 });
    const righe = await res.json();
    const lavoro = Array.isArray(righe) ? righe[0] : righe;
    return NextResponse.json({ ok: true, id: lavoro?.id, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// GET ?id=... -> stato + risultato di quel lavoro (la chat fa polling qui).
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ ok: false, error: "Non autorizzato." }, { status: 403 });
  if (!configurato()) return NextResponse.json({ ok: false, error: "Memoria AD non collegata." }, { status: 503 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Manca id." }, { status: 400 });
  try {
    const res = await fetch(
      `${URL}/rest/v1/lavori?select=id,stato,risultato,updated_at&id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: AUTH, cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ ok: false, error: `Memoria: HTTP ${res.status}` }, { status: 502 });
    const righe = await res.json();
    const lavoro = Array.isArray(righe) ? righe[0] : null;
    return NextResponse.json({ ok: true, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
