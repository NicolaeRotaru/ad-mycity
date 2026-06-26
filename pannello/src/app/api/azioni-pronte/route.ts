import { NextResponse } from "next/server";
import { getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa, type AzionePronta } from "@/lib/azioni-pronte";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// "Azioni pronte" = la corsia operativa. Mosse del vault + sentinelle (lib/azioni-pronte).
// Approvare → esegue tramite le "mani" (lib/mani) e salva esito in Supabase.

export async function GET() {
  const blocchi = await tutteLeAzioni();
  const { tabella, valori } = await getImpostazioni();
  const azioni: AzionePronta[] = blocchi.map((b) => ({
    ...b,
    stato: statoDa(valori[`azione:${b.id}`] || ""),
    esito: valori[`azione:${b.id}:nota`] || "",
  }));
  return NextResponse.json({
    collegato: blocchi.length > 0,
    salvataggio: tabella,
    autopilota: valori["autopilota"] === "on",
    azioni,
  });
}

// Decidi. Body: { id, decisione: "approva" | "rifiuta" | "annulla" }.
export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body non valido." }, { status: 400 });
  }
  const id = String(body?.id || "").trim();
  const dec = String(body?.decisione || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "Manca l'id." }, { status: 400 });

  const azione = (await tutteLeAzioni()).find((a) => a.id === id);

  if (dec === "rifiuta" || dec === "annulla") {
    const stato = dec === "rifiuta" ? "rifiutata" : "";
    const salv = (await setImpostazione(`azione:${id}`, stato)) && (await setImpostazione(`azione:${id}:nota`, ""));
    if (dec === "rifiuta" && azione) {
      await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: "rifiutata", esito: "", auto: false });
    }
    return NextResponse.json({ ok: true, stato, esito: "", salvataggio: salv });
  }

  if (dec !== "approva") return NextResponse.json({ ok: false, error: "Decisione non valida." }, { status: 400 });
  if (!azione) return NextResponse.json({ ok: false, error: "Azione non trovata." }, { status: 404 });

  const esito = await eseguiAzione({ titolo: azione.titolo, canale: azione.canale, destinatario: azione.destinatario, testo: azione.testo });
  const salv = (await setImpostazione(`azione:${id}`, esito.stato)) && (await setImpostazione(`azione:${id}:nota`, esito.dettaglio));
  await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: esito.stato, esito: esito.dettaglio, auto: false });
  return NextResponse.json({ ok: true, stato: esito.stato, esito: esito.dettaglio, salvataggio: salv });
}
