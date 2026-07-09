import { NextRequest, NextResponse } from "next/server";
import {
  getLavoroById,
  annullaLavoroSeStato,
  getImpostazioni,
  setImpostazione,
  type Lavoro,
} from "@/lib/store";
import { tutteLeAzioni } from "@/lib/azioni-pronte";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Annulla un lavoro della coda (giro accodato per sbaglio, messaggio di chat, azione approvata).
// Regola d'oro anti-problemi: si annulla SOLO ciò che NON è ancora partito (stato in_attesa/errore),
// con un compare-and-set atomico (annullaLavoroSeStato). Un lavoro già "in_corso" è nelle mani del
// worker → non lo tocchiamo (eviterebbe race e doppie esecuzioni reali). Un "esegui-azione" mai
// partito torna in "Da approvare" con scritto sopra il perché.

function oraRoma(): string {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      timeZone: "Europe/Rome",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  } catch {
    return "";
  }
}

// Un'azione approvata che aveva generato questo lavoro torna "da decidere" con il motivo, MA solo se
// non era ancora realmente partita (stato salvato "" | "rifiutata" | "coda"). "coda" = era solo
// accodata al worker, e siccome il lavoro era in_attesa (garantito dal chiamante) nulla è stato
// eseguito → ripristino sicuro. "fatta"/"simulata" = già toccato il mondo reale → NON si ripristina.
async function rimettiAzioneInApprovazione(lv: Lavoro, ora: string): Promise<boolean> {
  const m = lv.richiesta.match(/l'azione\s+"([^"]+)"/i);
  const titolo = m?.[1]?.trim();
  if (!titolo) return false;
  const az = (await tutteLeAzioni()).find((a) => a.titolo === titolo);
  if (!az) return false;
  const { valori } = await getImpostazioni();
  const cur = valori[`azione:${az.id}`] || "";
  if (cur === "fatta" || cur === "simulata") return false;
  const okStato = await setImpostazione(`azione:${az.id}`, "");
  const nota = `↩️ Tornata in Da approvare perché annullata da Nicola dal Pannello (Lavori) il ${ora}. Non era ancora partita: nulla è stato inviato. Riapprovala se la vuoi eseguire.`;
  const okNota = await setImpostazione(`azione:${az.id}:nota`, nota);
  return okStato && okNota;
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const lavoroId = String(id || "").trim();
    if (!lavoroId) return NextResponse.json({ ok: false, error: "Manca l'id del lavoro." }, { status: 400 });

    const lv = await getLavoroById(lavoroId);
    if (!lv) return NextResponse.json({ ok: false, error: "Lavoro non trovato." }, { status: 404 });

    // Idempotenza e casi terminali: niente da fare / non annullabile.
    if (lv.stato === "annullato") return NextResponse.json({ ok: true, giaAnnullato: true, stato: "annullato" });
    if (lv.stato === "fatto")
      return NextResponse.json(
        { ok: false, giaFinito: true, error: "Il lavoro è già stato completato: non c'è più nulla da annullare." },
        { status: 409 }
      );
    if (lv.stato === "in_corso")
      return NextResponse.json(
        { ok: false, giaInCorso: true, error: "Il worker lo sta già eseguendo: non è più annullabile in sicurezza." },
        { status: 409 }
      );

    // Solo in_attesa | errore: annullo con CAS atomico (niente race col claim del worker).
    const ora = oraRoma();
    const nota = `\n\n🚫 Annullato da Nicola dal Pannello${ora ? ` il ${ora}` : ""}. Non è stato eseguito.`;
    const agg = await annullaLavoroSeStato(lavoroId, ["in_attesa", "errore"], (lv.risultato || "") + nota);

    if (!agg) {
      // Lo stato è cambiato tra la lettura e la scrittura: quasi sempre il worker l'ha appena preso.
      const ora2 = await getLavoroById(lavoroId);
      if (ora2?.stato === "annullato") return NextResponse.json({ ok: true, giaAnnullato: true, stato: "annullato" });
      return NextResponse.json(
        { ok: false, giaInCorso: true, error: "Il worker l'ha appena preso in carico: non più annullabile in sicurezza." },
        { status: 409 }
      );
    }

    // Se il lavoro era un'azione APPROVATA (e mai partita, perché era in_attesa): rimettila in Da approvare.
    let tornataInApprovazione = false;
    if (lv.tipo === "esegui-azione" && lv.stato === "in_attesa") {
      tornataInApprovazione = await rimettiAzioneInApprovazione(lv, ora);
    }

    return NextResponse.json({ ok: true, stato: "annullato", tipo: lv.tipo, tornataInApprovazione });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
