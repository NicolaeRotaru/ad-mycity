import { NextRequest, NextResponse } from "next/server";
import { creaLavoro, setImpostazione, getImpostazioni, memoryConnected } from "@/lib/store";
import { STATUS_SCRITTURA_FALLITA } from "@/lib/esito-scrittura";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// 💬 RISPOSTE DI NICOLA alle domande dell'auto-analisi.
// È la linea a DUE sensi col cervello: l'AD fa una domanda nell'auto-coscienza,
// Nicola risponde qui dal Pannello, e la risposta:
//   1) entra nella coda `lavori` (la "posta in arrivo" del cervello-Max) → al primo
//      giro la legge, registra la decisione e SMETTE di richiederla;
//   2) viene salvata in `impostazioni` (chiave `risposta:<qid>`) così il Pannello
//      mostra "già risposto" anche dopo un refresh, su ogni dispositivo.
// €0: nessuna API Claude. Funziona anche col cervello spento (la risposta aspetta in coda).

// GET → mappa { qid: { risposta, at } } delle risposte già date (per la UI).
export async function GET() {
  if (!memoryConnected()) return NextResponse.json({ collegato: false, risposte: {} });
  const { valori } = await getImpostazioni();
  const risposte: Record<string, { risposta: string; at: string }> = {};
  for (const [k, v] of Object.entries(valori)) {
    if (!k.startsWith("risposta:")) continue;
    const qid = k.slice("risposta:".length);
    try {
      const o = JSON.parse(v);
      if (o && typeof o.risposta === "string") risposte[qid] = { risposta: o.risposta, at: o.at || "" };
    } catch {
      risposte[qid] = { risposta: v, at: "" };
    }
  }
  return NextResponse.json({ collegato: true, risposte });
}

// POST { qid, domanda, risposta } → accoda al cervello + salva per la UI.
export async function POST(req: NextRequest) {
  try {
    const { qid, domanda, risposta } = await req.json();
    const testo = String(risposta ?? "").trim();
    if (!qid || !testo) {
      return NextResponse.json({ ok: false, error: "Servono qid e una risposta non vuota." }, { status: 400 });
    }
    if (!memoryConnected()) {
      return NextResponse.json({ ok: false, error: "Memoria non collegata: la risposta non si può salvare." }, { status: 503 });
    }
    const at = new Date().toISOString();
    // 1) Salva la risposta (per il Pannello: "già risposto").
    //
    // AR-238: prima si faceva `await setImpostazione(...)` senza guardare il booleano che torna, e
    // si rispondeva `ok:true` comunque. Con la memoria staccata il riquadro diventava verde, e
    // trenta secondi dopo il ripasso rileggeva dal server — che non aveva niente — e la stessa
    // domanda ricompariva. Se la risposta non è salvata NON si accoda nemmeno il lavoro: un lavoro
    // accodato su una risposta che il Pannello continuerà a richiedere è il doppione garantito.
    const salvata = await setImpostazione(`risposta:${qid}`, JSON.stringify({ risposta: testo, at, domanda: String(domanda ?? "") }));
    if (!salvata) {
      return NextResponse.json(
        { ok: false, error: "Risposta non salvata — riprova." },
        { status: STATUS_SCRITTURA_FALLITA },
      );
    }
    // 2) Accoda al cervello come lavoro, così al prossimo giro la applica e chiude la domanda.
    const lavoro = await creaLavoro(
      "Nicola ha RISPOSTO a una domanda della tua auto-analisi.\n" +
        `Domanda: «${String(domanda ?? "(non riportata)")}»\n` +
        `Risposta di Nicola: «${testo}»\n` +
        "Agisci di conseguenza: registra la decisione in DECISIONI.md / registro-realta.json, " +
        "applica ciò che Nicola ha indicato e NON riproporre questa domanda nelle prossime auto-analisi.",
      "risposta"
    );
    // La risposta è salvata (il Pannello può dire «già risposto» in verità); se però il cervello
    // non l'ha presa in carico va detto, altrimenti Nicola resta ad aspettare un'azione che nessuno
    // eseguirà. Non è un errore della risposta: è un avviso sul seguito.
    return NextResponse.json({ ok: true, at, accodata: Boolean(lavoro), avviso: lavoro ? "" : "Risposta salvata, ma il cervello non l'ha presa in carico — la applicherà al prossimo giro." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Errore" }, { status: 500 });
  }
}
