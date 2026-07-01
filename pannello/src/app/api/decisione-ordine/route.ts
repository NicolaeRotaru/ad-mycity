import { NextRequest, NextResponse } from "next/server";
import {
  ORDINE_ZOMBIE_ID,
  IMPOSTAZIONE_CHIAVE,
  etichettaSceltaOrdine,
  type DecisioneOrdineSalvata,
  type SceltaOrdineAB,
} from "@/lib/decisione-ordine";
import { creaLavoro, getImpostazione, memoryConnected, setImpostazione } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseSalvata(raw: string | null): DecisioneOrdineSalvata | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as DecisioneOrdineSalvata;
    if (o?.scelta === "A" || o?.scelta === "B") return o;
  } catch {
    if (raw === "A" || raw === "B") return { scelta: raw, at: "", ordineId: ORDINE_ZOMBIE_ID };
  }
  return null;
}

// GET → decisione già registrata (per nascondere la card dopo refresh).
export async function GET() {
  if (!memoryConnected()) return NextResponse.json({ collegato: false, decisione: null });
  const raw = await getImpostazione(IMPOSTAZIONE_CHIAVE);
  return NextResponse.json({ collegato: true, decisione: parseSalvata(raw) });
}

// POST { scelta: "A" | "B" } → salva + accoda al cervello (DECISIONI + esecuzione 🔴).
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const scelta = String(body?.scelta || "").trim().toUpperCase();
    if (scelta !== "A" && scelta !== "B") {
      return NextResponse.json({ ok: false, error: 'Serve scelta "A" o "B".' }, { status: 400 });
    }
    if (!memoryConnected()) {
      return NextResponse.json({ ok: false, error: "Memoria non collegata: la decisione non si può salvare." }, { status: 503 });
    }

    const esistente = parseSalvata(await getImpostazione(IMPOSTAZIONE_CHIAVE));
    if (esistente) {
      return NextResponse.json({ ok: true, giaRegistrata: true, decisione: esistente });
    }

    const at = new Date().toISOString();
    const decisione: DecisioneOrdineSalvata = {
      scelta: scelta as SceltaOrdineAB,
      at,
      ordineId: ORDINE_ZOMBIE_ID,
      titolo: String(body?.titolo || "").trim() || undefined,
    };
    const ok = await setImpostazione(IMPOSTAZIONE_CHIAVE, JSON.stringify(decisione));
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Salvataggio fallito." }, { status: 500 });
    }

    const etichetta = etichettaSceltaOrdine(decisione.scelta);
    await creaLavoro(
      `Nicola ha DECISO sull'ordine zombie €19,05 (Pane Quotidiano) dal Pannello.\n` +
        `Scelta: **${decisione.scelta}** — ${etichetta}\n` +
        `Ordine ID: \`${ORDINE_ZOMBIE_ID}\`\n` +
        `Buyer tel. 348 642 1766 · COD €19,05 · pacchetto: consegne/operations/pacchetto-sblocco-ordine-zombie-19-05.md\n\n` +
        `Agisci ORA:\n` +
        `1) Append in MyCity-Vault/90-Memoria-AI/DECISIONI.md (🔴, reparto operations, fonte Nicola Pannello A/B).\n` +
        `2) Accoda in AZIONI-IN-ATTESA.md l'esecuzione 🔴 corrispondente (A=accetta+WhatsApp+consegna · B=annulla+messaggio buyer).\n` +
        `3) Aggiorna STATO + SALA-OPERATIVA.\n` +
        `4) Al prossimo giro NON rigenerare la proposta A/B (decisione già presa).`,
      "decisione"
    );

    return NextResponse.json({ ok: true, decisione });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Errore" }, { status: 500 });
  }
}
