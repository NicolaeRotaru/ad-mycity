import { NextRequest, NextResponse } from "next/server";
import { creaLavoro } from "@/lib/store";
import { registraFirma, revocaFirma } from "@/lib/firma-azione";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Approva o rifiuta un'azione della coda: crea un lavoro che il worker dell'AD
// (cervello/worker.ps1) prende ed esegue (con le "mani" se approvata).
//
// AR-110 — QUI IL PERCORSO firma→esecuzione SI CHIUDEVA NEL VUOTO.
// Questa route diceva al worker «è stata APPROVATA, eseguila ORA con esegui-azione.mjs», ma non
// gli passava l'AZIONE_ID che quel comando pretende, e non lasciava da nessuna parte una firma
// verificabile. Il cancello AR-103 (cervello/consenso-azione.mjs) chiedeva entrambe le cose:
// senza, l'azione appena approvata da Nicola degradava a DRY-RUN — oppure il worker si scriveva
// da solo il marcatore nel file che il cancello poi verificava, cioè firmava se stesso.
// Ora la route fa le due cose che mancavano: registra la firma («nicola <data ora>», l'unica che
// apre il cancello) e mette l'AZIONE_ID esplicito nel comando che il worker deve eseguire.
export async function POST(req: NextRequest) {
  try {
    const { numero, azione, decisione } = await req.json();
    const n = String(numero ?? "").trim();
    if (!n) return NextResponse.json({ ok: false, error: "Manca il numero dell'azione." }, { status: 400 });
    const rifiuto = String(decisione || "approva") === "rifiuta";

    // Le azioni-SEZIONE hanno un id sintetico (es. "S1a2b"): NON corrisponde a un "#numero" nel file.
    // Vanno individuate per TITOLO, non per riga, altrimenti il worker cerca una riga inesistente.
    const titolo = String(azione || "").slice(0, 300);
    const isSezione = /^S/i.test(n);
    const ctx = isSezione
      ? `la sezione "${titolo}" nella coda MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md ` +
        `(individuala per TITOLO, NON per numero di riga)`
      : `l'azione #${n} della coda MyCity-Vault/90-Memoria-AI/AZIONI-IN-ATTESA.md` +
        (titolo ? ` ("${titolo}")` : "");

    // La firma è un dato scritto prima che il lavoro parta: il worker la troverà già lì.
    // Un rifiuto la revoca, così un'azione respinta non resta "firmata" e riapribile.
    if (rifiuto) await revocaFirma(n);
    else await registraFirma(n, "nicola");

    const richiesta = rifiuto
      ? `È stata RIFIUTATA ${ctx}. NON eseguirla. Segna quell'azione come ❌ RIFIUTATA nel file ` +
        `e appendi la traccia in DECISIONI.md (motivo: scelta di Nicola dal Pannello).`
      : `È stata APPROVATA ${ctx}. Eseguila ORA usando le "mani" (cervello/esegui-azione.mjs) ` +
        `sul canale indicato, passando l'id della casella firmata: ` +
        `\`AZIONE_ID=${n} node cervello/esegui-azione.mjs <canale> …\` ` +
        `(in alternativa \`--azione-id=${n}\`). Senza AZIONE_ID il cancello di consenso blocca ` +
        `l'invio e resta tutto in DRY-RUN. ` +
        `Poi segna quell'azione come ✅ FATTO nel file e appendi la traccia in ` +
        `DECISIONI.md. Rispetta il colore 🟡/🔴 e riferisci a Nicola cosa è partito.`;

    const lavoro = await creaLavoro(richiesta, rifiuto ? "rifiuta-azione" : "esegui-azione");
    if (!lavoro) {
      return NextResponse.json(
        { ok: false, error: "Memoria non collegata (manca la tabella 'lavori' o le chiavi Supabase)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ ok: true, lavoro });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
