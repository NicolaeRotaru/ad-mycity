import { NextRequest, NextResponse } from "next/server";
import { vede, aiConfigurato } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 👀 Vetrina live — Organo #1: la foto di un prodotto → una BOZZA di scheda proposta.
// SOLA LETTURA sul mondo reale: qui NON si scrive nulla nel database del marketplace.
// Il cervello guarda la foto (lib/ai.vede, con guardia-budget) ed estrae i campi; la
// scrittura in catalogo è un passo separato 🔴 che parte solo con la firma di Nicola.

const MAX_BASE64 = 8 * 1024 * 1024; // ~6 MB di immagine reale, tetto prudente

const SISTEMA =
  "Sei l'AD digitale di MyCity, esperto di catalogo e-commerce. Guardi la foto di UN prodotto da vendere " +
  "e prepari una bozza di scheda. Regola d'oro: NON inventare. Se un campo non si capisce dalla foto, " +
  "lascialo vuoto o metti null. Il prezzo è un SUGGERIMENTO da confermare, mai un dato certo.";

function prompt(nomeNegozio?: string): string {
  return (
    `Prepara la bozza di scheda prodotto per questa foto` +
    (nomeNegozio ? ` (negozio: ${nomeNegozio})` : "") +
    `. Rispondi SOLO con un oggetto JSON valido, senza testo attorno, con questi campi:\n` +
    `{\n` +
    `  "nome": string,            // nome del prodotto come lo scriveresti a catalogo\n` +
    `  "descrizione": string,     // 1-2 frasi, oneste, senza claim inventati\n` +
    `  "categoria": string|null,  // categoria merceologica se deducibile, altrimenti null\n` +
    `  "prezzo_suggerito": number|null, // in euro, SOLO se hai un appiglio ragionevole, altrimenti null\n` +
    `  "prezzo_motivo": string|null,    // perché quel prezzo (o null)\n` +
    `  "unita": string|null,      // pezzo|kg|g|l|ml|confezione|paio|m se deducibile, altrimenti null\n` +
    `  "note": string|null        // cosa NON si capisce dalla foto e serve chiedere a Nicola\n` +
    `}\n` +
    `Se nella foto non c'è un prodotto riconoscibile, metti "nome" vuoto e spiega in "note".`
  );
}

// Estrae il JSON anche se il modello lo avvolge in ```json ... ``` o testo.
function estraiJson(testo: string): any | null {
  if (!testo) return null;
  const pulito = testo.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const i = pulito.indexOf("{");
  const j = pulito.lastIndexOf("}");
  if (i < 0 || j <= i) return null;
  try {
    return JSON.parse(pulito.slice(i, j + 1));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  if (!aiConfigurato()) {
    return NextResponse.json(
      { ok: false, error: "Il cervello che vede non è collegato (manca ANTHROPIC_API_KEY). La foto è stata scattata, ma l'AI non può compilarla finché non colleghi la chiave." },
      { status: 503 }
    );
  }
  try {
    const body = await req.json().catch(() => null);
    const dataUrl: string = String(body?.immagine || "");
    const nomeNegozio: string | undefined = body?.negozio_nome ? String(body.negozio_nome).slice(0, 120) : undefined;

    // La foto arriva come data URL (data:image/jpeg;base64,....). Separiamo tipo e byte.
    const m = dataUrl.match(/^data:(image\/[a-zA-Z.+-]+);base64,(.+)$/);
    if (!m) {
      return NextResponse.json({ ok: false, error: "Foto mancante o formato non valido." }, { status: 400 });
    }
    const mediaType = m[1];
    const base64 = m[2];
    if (base64.length > MAX_BASE64) {
      return NextResponse.json({ ok: false, error: "Foto troppo grande (max ~6 MB)." }, { status: 413 });
    }

    const risposta = await vede({ immagineBase64: base64, mediaType, prompt: prompt(nomeNegozio), sistema: SISTEMA });
    if (!risposta) {
      return NextResponse.json(
        { ok: false, error: "L'AI non ha risposto (budget finito o errore momentaneo). Riprova o controlla il tetto di spesa." },
        { status: 502 }
      );
    }
    const bozza = estraiJson(risposta);
    if (!bozza) {
      return NextResponse.json({ ok: false, error: "Non sono riuscito a leggere la scheda dalla risposta.", grezzo: risposta }, { status: 502 });
    }

    // Normalizzazione difensiva: non ci fidiamo ciecamente dei tipi del modello.
    const out = {
      nome: typeof bozza.nome === "string" ? bozza.nome.trim() : "",
      descrizione: typeof bozza.descrizione === "string" ? bozza.descrizione.trim() : "",
      categoria: bozza.categoria ? String(bozza.categoria).trim() : null,
      prezzo_suggerito: Number.isFinite(Number(bozza.prezzo_suggerito)) && Number(bozza.prezzo_suggerito) > 0 ? Number(bozza.prezzo_suggerito) : null,
      prezzo_motivo: bozza.prezzo_motivo ? String(bozza.prezzo_motivo).trim() : null,
      unita: bozza.unita ? String(bozza.unita).trim() : null,
      note: bozza.note ? String(bozza.note).trim() : null,
    };
    return NextResponse.json({ ok: true, bozza: out });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Errore analisi foto." }, { status: 500 });
  }
}
