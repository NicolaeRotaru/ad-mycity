import { NextResponse } from "next/server";
import { creaLavoro, getImpostazioni, setImpostazione } from "@/lib/store";
import { slugDaTitolo } from "@/lib/scelta-ab";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Decisioni sulle «Proposte dal giro» — PERSISTENTI e con esecuzione vera.
// Prima: Approva → n8n (binario morto se non configurato) e nessun salvataggio → la card
// tornava identica a ogni refresh/giro. Ora: Approva → lavoro per il worker AD (che la
// trasforma in azione concreta) + decisione salvata in impostazioni (proposta:{id}).

const PREFIX = "proposta:";

export type DecisioneProposta = { decisione: "approva" | "ignora"; at: string; titolo?: string };

export async function GET() {
  const { tabella, valori } = await getImpostazioni();
  const decisioni: Record<string, DecisioneProposta> = {};
  for (const [chiave, raw] of Object.entries(valori)) {
    if (!chiave.startsWith(PREFIX)) continue;
    try {
      const o = JSON.parse(raw) as DecisioneProposta;
      if (o?.decisione === "approva" || o?.decisione === "ignora") {
        decisioni[chiave.slice(PREFIX.length)] = o;
      }
    } catch {
      /* valore non-JSON: ignora */
    }
  }
  return NextResponse.json({ salvataggio: tabella, decisioni });
}

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body non valido." }, { status: 400 });
  }
  const decisione = String(body?.decisione || "").trim();
  const titolo = String(body?.titolo || "").trim();
  const motivo = String(body?.motivo || "").trim();
  const livello = String(body?.livello || "?").trim();
  if (decisione !== "approva" && decisione !== "ignora") {
    return NextResponse.json({ ok: false, error: "Decisione non valida (approva|ignora)." }, { status: 400 });
  }
  if (!titolo) {
    return NextResponse.json({ ok: false, error: "Manca il titolo della proposta." }, { status: 400 });
  }

  const id = String(body?.id || "").trim() || slugDaTitolo(titolo);
  const record: DecisioneProposta = { decisione, at: new Date().toISOString(), titolo };
  const salvato = await setImpostazione(`${PREFIX}${id}`, JSON.stringify(record));

  let lavoro = null;
  if (decisione === "approva") {
    lavoro = await creaLavoro(
      `Nicola ha APPROVATO dal Pannello questa PROPOSTA DAL GIRO:\n` +
        `«${titolo}»\n` +
        (motivo ? `Motivo/contesto: ${motivo}\n` : "") +
        `Livello: ${livello}\n\n` +
        `Trasformala SUBITO in azione concreta (doer mode, CLAUDE.md): esegui tu i passi 🟢 producendo ` +
        `gli artefatti veri; i passi 🟡/🔴 preparali COMPLETI e accodali in ` +
        `MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md (riga-tabella, stato «in attesa»). ` +
        `Appendi la decisione in DECISIONI.md e la mossa in SALA-OPERATIVA.md. ` +
        `Nei prossimi giri NON riproporre questa proposta (decisione registrata: proposta:${id}). ` +
        `Riferisci a Nicola in chiaro cosa hai fatto e cosa è in coda.`,
      "proposta"
    );
    if (!lavoro) {
      return NextResponse.json(
        { ok: false, id, salvato, error: "Memoria non collegata (tabella 'lavori'): decisione salvata ma il cervello non parte." },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({ ok: true, id, decisione: record, salvato, lavoro });
}
