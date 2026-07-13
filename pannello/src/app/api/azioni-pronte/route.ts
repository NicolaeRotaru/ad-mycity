import { NextResponse } from "next/server";
import { getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa } from "@/lib/azioni-pronte";
import { verificaQualita } from "@/lib/qualita";
import { chiudiAzioniMergeCompletate, estraiMergePr, isCanaleGithub, prGiaMergiata } from "@/lib/github-pr-merge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// "Azioni pronte" = la corsia operativa. Mosse del vault + sentinelle (lib/azioni-pronte).
// Approvare → esegue tramite le "mani" (lib/mani) e salva esito in Supabase.

export async function GET() {
  const blocchi = await tutteLeAzioni();
  const { tabella, valori } = await getImpostazioni();
  const conStato = await chiudiAzioniMergeCompletate(
    blocchi,
    valori,
    async (id, nota) => {
      const az = blocchi.find((b) => b.id === id);
      await setImpostazione(`azione:${id}`, "fatta");
      await setImpostazione(`azione:${id}:nota`, nota);
      if (az) {
        await logAzione({
          id,
          titolo: az.titolo,
          reparto: az.reparto,
          livello: az.livello,
          stato: "fatta",
          esito: nota,
          auto: true,
        });
      }
    }
  );
  const azioni = conStato.map((b) => ({
    ...b,
    stato: statoDa(b.stato),
    qualita: verificaQualita(b),
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
    // 🔴 BLOCCANTE (radiografia 3/7): "annulla" NON deve azzerare lo stato di un'azione GIÀ ESEGUITA.
    // Prima lo faceva incondizionatamente: annulla → ri-approva ri-eseguiva le "mani" (doppio merge/email/payout).
    // Ora: annulla consentito SOLO se l'azione non è ancora partita ('' o 'rifiutata'); altrimenti 409.
    if (dec === "annulla") {
      const { valori: valoriPre } = await getImpostazioni();
      const statoPre = valoriPre[`azione:${id}`] || "";
      const giaEseguita = statoPre && statoPre !== "rifiutata"; // fatta / simulata / coda = già avviata
      if (giaEseguita) {
        return NextResponse.json(
          { ok: false, giaEseguita: true, stato: statoDa(statoPre), error: "Azione già eseguita: non è annullabile (eviterebbe un doppio invio reale)." },
          { status: 409 },
        );
      }
    }
    const stato = dec === "rifiuta" ? "rifiutata" : "";
    const salv = (await setImpostazione(`azione:${id}`, stato)) && (await setImpostazione(`azione:${id}:nota`, ""));
    if (dec === "rifiuta" && azione) {
      await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: "rifiutata", esito: "", auto: false });
    }
    return NextResponse.json({ ok: true, stato, esito: "", salvataggio: salv });
  }

  if (dec !== "approva") return NextResponse.json({ ok: false, error: "Decisione non valida." }, { status: 400 });
  if (!azione) return NextResponse.json({ ok: false, error: "Azione non trovata." }, { status: 404 });

  // 🔴 Idempotenza: se l'azione è GIÀ stata approvata/eseguita (stato salvato ≠ "" e ≠ "rifiutata"),
  // NON rieseguire le "mani" — un doppio clic o una ri-approvazione dopo refresh manderebbe l'azione
  // reale (email/payout/notifica) una seconda volta.
  const { valori: valoriPre } = await getImpostazioni();
  const statoPre = valoriPre[`azione:${id}`] || "";
  if (statoPre && statoPre !== "rifiutata") {
    return NextResponse.json({
      ok: true,
      stato: statoDa(statoPre),
      esito: valoriPre[`azione:${id}:nota`] || "",
      giaFatta: true,
    });
  }

  // Merge PR già chiusa su GitHub → chiudi subito senza ri-accodare il worker.
  if (isCanaleGithub(azione.canale)) {
    const ref = estraiMergePr(azione.titolo, azione.testo || azione.perche || "");
    if (ref && (await prGiaMergiata(ref))) {
      const nota = `✓ PR #${ref.pr} già mergiata — tolta dalla coda`;
      const salv =
        (await setImpostazione(`azione:${id}`, "fatta")) &&
        (await setImpostazione(`azione:${id}:nota`, nota));
      await logAzione({
        id,
        titolo: azione.titolo,
        reparto: azione.reparto,
        livello: azione.livello,
        stato: "fatta",
        esito: nota,
        auto: true,
      });
      if (!salv) {
        return NextResponse.json(
          { ok: false, stato: "fatta", esito: nota, salvataggio: false, error: "Salvataggio stato fallito — riprova." },
          { status: 503 }
        );
      }
      return NextResponse.json({ ok: true, stato: "fatta", esito: nota, salvataggio: salv });
    }
  }

  const esito = await eseguiAzione({ titolo: azione.titolo, canale: azione.canale, destinatario: azione.destinatario, testo: azione.testo });
  const salv = (await setImpostazione(`azione:${id}`, esito.stato)) && (await setImpostazione(`azione:${id}:nota`, esito.dettaglio));
  await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: esito.stato, esito: esito.dettaglio, auto: false });
  // AR-034: se il salvataggio Supabase fallisce, ok:false → il client fa rollback invece di mostrare
  // "ok" su una card che al refresh torna vergine (rischio doppio invio con AZIONI_LIVE=1).
  if (!salv) {
    return NextResponse.json(
      { ok: false, stato: esito.stato, esito: esito.dettaglio, salvataggio: false, error: "Salvataggio stato fallito — riprova." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, stato: esito.stato, esito: esito.dettaglio, salvataggio: salv });
}
