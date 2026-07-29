import { NextResponse } from "next/server";
import { getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, tutteLeAzioniConEsito, statoDa } from "@/lib/azioni-pronte";
import { verificaQualita } from "@/lib/qualita";
import { chiudiAzioniMergeCompletate, estraiMergePr, isCanaleGithub, prGiaMergiata } from "@/lib/github-pr-merge";
import { registraFirma, revocaFirma } from "@/lib/firma-azione";
import { attoGiaAvviato } from "@/lib/atto-unico";
import { esitoScritture, STATUS_SCRITTURA_FALLITA } from "@/lib/esito-scrittura";
import { piuRecente } from "@/lib/verdetto-dato";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// "Azioni pronte" = la corsia operativa. Mosse del vault + sentinelle (lib/azioni-pronte).
// Approvare → esegue tramite le "mani" (lib/mani) e salva esito in Supabase.
//
// AR-110 — LA FIRMA DI NICOLA È UN DATO, NON UN SOTTINTESO.
// Il click «Approva» scrive `azione:<id>:firma` = "nicola AAAA-MM-GG HH:MM". È l'unico posto che
// la scrive con quel nome: l'autopilota (lib/autopilota.ts) marca "auto …", e il cancello lato
// cervello (cervello/consenso-azione.mjs::firmaPannello) accetta solo "nicola".
// Prima esisteva solo `azione:<id>` = stato, che vale sia per il clic umano sia per l'autopilota:
// l'esecutore CLI non poteva distinguerli, quindi non poteva fidarsi di nessuno dei due e ogni
// invio firmato degradava a DRY-RUN.

export async function GET() {
  // AR-233: serve sapere se la coda è stata LETTA, non solo quante card contiene.
  const { azioni: blocchi, codaLeggibile, motivoCoda } = await tutteLeAzioniConEsito();
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
    // AR-233: «collegato» si deduceva dal CONTEGGIO — quindi una coda vuota e una coda mai letta
    // erano indistinguibili, e la home stampava «Niente da firmare. 👍» in entrambi i casi.
    collegato: codaLeggibile,
    // AR-237 — DI QUANDO SONO QUESTI DATI. Senza, la home stampava l'ora del browser («aggiornato
    // adesso») anche su una coda che non si muove da tre giorni. `preparato` è la data che il senior
    // ha scritto sulla card in AZIONI-IN-ATTESA.md: è la data del DATO, non quella della lettura.
    dato_al: codaLeggibile ? piuRecente(azioni.map((a) => a.preparato)) : null,
    coda_leggibile: codaLeggibile,
    motivo_coda: motivoCoda,
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
    // 🔴 BLOCCANTE (radiografia 3/7): una decisione NON deve azzerare lo stato di un'azione GIÀ ESEGUITA.
    // Prima lo faceva incondizionatamente: annulla → ri-approva ri-eseguiva le "mani" (doppio merge/email/payout).
    //
    // AR-229: il controllo esisteva già ma solo dentro `if (dec === "annulla")`, cioè era appeso al
    // NOME della decisione invece che allo stato dell'azione — l'unico fatto che conta. Quindi la
    // strada approva → RIFIUTA → approva restava aperta: il rifiuto riscriveva lo stato in
    // "rifiutata", che il ramo approva considera riapprovabile, e le mani partivano una seconda
    // volta davvero. Ora la guardia sta su TUTTE le decisioni che riscrivono lo stato.
    const { valori: valoriPre } = await getImpostazioni();
    const statoPre = valoriPre[`azione:${id}`] || "";
    if (attoGiaAvviato(statoPre)) {
      return NextResponse.json(
        { ok: false, giaEseguita: true, stato: statoDa(statoPre), error: "Azione già eseguita: non è più annullabile né rifiutabile (eviterebbe un doppio invio reale)." },
        { status: 409 },
      );
    }
    const stato = dec === "rifiuta" ? "rifiutata" : "";
    // AR-110: rifiutare/annullare TOGLIE anche la firma. Senza, un'azione approvata e poi
    // rifiutata resterebbe "firmata da Nicola" e potrebbe ancora autorizzare un invio dalla CLI.
    //
    // AR-230: le tre scritture si raccolgono TUTTE (niente `&&`, che cortocircuita e salterebbe la
    // seconda) e l'esito si guarda. Prima si rispondeva `ok:true` comunque: con Supabase giù la card
    // diceva «rifiutata», al refresh tornava da decidere e la firma restava addosso — cioè il
    // Pannello dichiarava una decisione che non esisteva da nessuna parte.
    const revocata = await revocaFirma(id);
    const salvStato = await setImpostazione(`azione:${id}`, stato);
    const salvNota = await setImpostazione(`azione:${id}:nota`, "");
    const scritture = esitoScritture([
      { nome: "stato", ok: salvStato },
      { nome: "nota", ok: salvNota },
      { nome: "revoca firma", ok: revocata },
    ]);
    if (!scritture.ok) {
      return NextResponse.json(
        { ok: false, stato, esito: "", salvataggio: false, error: scritture.errore },
        { status: STATUS_SCRITTURA_FALLITA },
      );
    }
    if (dec === "rifiuta" && azione) {
      await logAzione({ id, titolo: azione.titolo, reparto: azione.reparto, livello: azione.livello, stato: "rifiutata", esito: "", auto: false });
    }
    return NextResponse.json({ ok: true, stato, esito: "", salvataggio: true });
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

  // AR-110: la firma si registra PRIMA di far partire qualsiasi cosa. Le azioni che il Pannello
  // non esegue da sé (merge PR, canali non collegati) finiscono al worker sul VPS, che ripassa dal
  // cancello di cervello/consenso-azione.mjs: quel cancello deve trovare la firma già scritta,
  // altrimenti l'azione che Nicola ha appena approvato gli arriva come "non firmata" e muore in
  // DRY-RUN. È esattamente il punto in cui il percorso firma→esecuzione si spezzava.
  await registraFirma(id, "nicola");

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
