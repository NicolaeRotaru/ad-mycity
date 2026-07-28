import { NextRequest, NextResponse } from "next/server";
import {
  ORDINE_ZOMBIE_ID,
  IMPOSTAZIONE_CHIAVE,
  etichettaSceltaOrdine,
  type DecisioneOrdineSalvata,
  type SceltaOrdineAB,
} from "@/lib/decisione-ordine";
import { creaLavoro, getImpostazione, memoryConnected, setImpostazione } from "@/lib/store";
import { STATUS_SCRITTURA_FALLITA } from "@/lib/esito-scrittura";

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
    // AR-231: l'uscita anticipata «già registrata» vale SOLO se anche il lavoro è partito. Prima
    // usciva qui a ogni tentativo successivo, quindi il caso «decisione salvata ma cervello mai
    // partito» era irreparabile: la card spariva, il lavoro non c'era, e riprovare non serviva a
    // niente. Se il marcatore dice che il lavoro non è mai nato, si prosegue e lo si riaccoda.
    if (esistente && esistente.lavoro !== null) {
      return NextResponse.json({ ok: true, giaRegistrata: true, decisione: esistente });
    }

    const at = new Date().toISOString();
    const decisione: DecisioneOrdineSalvata = {
      scelta: scelta as SceltaOrdineAB,
      at,
      ordineId: ORDINE_ZOMBIE_ID,
      titolo: String(body?.titolo || "").trim() || undefined,
    };
    const etichetta = etichettaSceltaOrdine(decisione.scelta);
    // AR-231 — L'ORDINE DELLE DUE SCRITTURE, E PERCHÉ CONTA.
    // Prima si salvava la decisione e POI si accodava il lavoro senza guardarne l'esito: se il
    // secondo passo falliva, restava registrato «Nicola ha deciso» con il cervello mai avviato — e
    // il dedup all'ingresso bloccava proprio il tentativo che avrebbe rimediato. Ora il lavoro si
    // crea PRIMA e il suo id entra nella decisione: quello che si salva è un fatto intero, non
    // metà. Se il lavoro non nasce, si salva comunque la scelta con `lavoro: null` (così non si
    // perde quello che Nicola ha scelto) ma si risponde 503 — e il ramo «già registrata» qui sopra
    // sa che quella decisione è da completare, quindi riprovare funziona.
    const lavoro = await creaLavoro(
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
    decisione.lavoro = lavoro?.id ?? null;

    const ok = await setImpostazione(IMPOSTAZIONE_CHIAVE, JSON.stringify(decisione));
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Salvataggio fallito." }, { status: 500 });
    }
    if (!lavoro) {
      return NextResponse.json(
        { ok: false, decisione, error: "Scelta registrata, ma il cervello non è partito — ripremi il pulsante per riaccodarla." },
        { status: STATUS_SCRITTURA_FALLITA },
      );
    }

    return NextResponse.json({ ok: true, decisione });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Errore" }, { status: 500 });
  }
}
