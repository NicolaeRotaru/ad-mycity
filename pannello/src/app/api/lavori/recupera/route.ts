import { NextResponse } from "next/server";
import { memoryConnected } from "@/lib/store";
import { decidiRecupero, type LavoroDaRecuperare } from "@/lib/recupero-lavoro";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;

function headers() {
  return {
    apikey: KEY as string,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

/**
 * Rimette in coda i lavori bloccati «in_corso» (stesso effetto di recupera-lavori-orfani.sh sul VPS).
 *
 * AR-624 — fino al 13/8 questa porta prendeva OGNI lavoro in_corso, senza guardare tipo, proprietario
 * né età: un'azione reale interrotta a metà (email magari già partita) tornava prendibile e il primo
 * claim la rieseguiva, senza che Nicola l'avesse rifirmata. Adesso la decisione è una sola, in
 * `@/lib/recupero-lavoro`, condivisa con lo script del VPS.
 */
export async function POST() {
  if (!memoryConnected() || !URL || !KEY) {
    return NextResponse.json({ ok: false, error: "Memoria non collegata." }, { status: 503 });
  }

  // `worker_owner` può non esistere se la migrazione non è passata: in quel caso PostgREST risponde
  // errore sulla colonna, e si riprova senza. Un select che fallisce non deve spegnere il bottone.
  let rows: LavoroDaRecuperare[] | null = null;
  for (const select of ["id,tipo,updated_at,worker_owner", "id,tipo,updated_at"]) {
    const res = await fetch(`${URL}/rest/v1/lavori?stato=eq.in_corso&select=${select}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (res.ok) { rows = (await res.json()) as LavoroDaRecuperare[]; break; }
  }
  if (!rows) {
    return NextResponse.json({ ok: false, error: "Impossibile leggere la coda." }, { status: 502 });
  }

  const adesso = Date.now();
  let n = 0;
  const daRiapprovare: string[] = [];
  const vivi: string[] = [];
  for (const row of rows) {
    const { azione } = decidiRecupero(row, { adesso });
    if (azione === "riapprova") { daRiapprovare.push(String(row.tipo || "azione")); continue; }
    if (azione === "lascia") { vivi.push(String(row.tipo || "lavoro")); continue; }
    const patch = await fetch(`${URL}/rest/v1/lavori?id=eq.${row.id}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({ stato: "in_attesa" }),
    });
    if (patch.ok) n++;
  }

  // Ciò che NON è stato toccato si DICE. Un bottone che salta due azioni in silenzio insegna che
  // «non ha funzionato», e la volta dopo qualcuno le sblocca a mano — cioè aggira il freno.
  const pezzi = [n ? `${n} lavoro/i rimessi in coda.` : "Nessun lavoro da rimettere in coda."];
  if (daRiapprovare.length) {
    pezzi.push(
      `${daRiapprovare.length} azione/i reale/i (${daRiapprovare.join(", ")}) NON rimesse in coda: potrebbero essere già partite. Riapprovale tu dalla coda se servono ancora.`,
    );
  }
  if (vivi.length) pezzi.push(`${vivi.length} lavoro/i lasciati stare: li sta eseguendo un worker adesso.`);

  return NextResponse.json({
    ok: true,
    recuperati: n,
    da_riapprovare: daRiapprovare.length,
    lasciati_vivi: vivi.length,
    messaggio: pezzi.join(" "),
  });
}
