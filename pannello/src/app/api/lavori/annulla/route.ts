import { NextRequest, NextResponse } from "next/server";
import {
  getLavoroById,
  annullaLavoroSeStato,
  getImpostazioni,
  setImpostazione,
  type Lavoro,
} from "@/lib/store";
import { tutteLeAzioni } from "@/lib/azioni-pronte";
import { revocaFirmaObbligatoria, FirmaNonScritta } from "@/lib/firma-azione";
import { scrivereInOrdine } from "@/lib/cancello-atto";
import { liberaAzione } from "@/lib/prenotazione-atto";

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
type EsitoRipristino = {
  /** L'azione è davvero tornata in «Da approvare»? */
  tornata: boolean;
  /** La firma di Nicola è ancora addosso all'azione? (allora il worker potrebbe ancora eseguirla) */
  firmaAncoraViva: boolean;
  /** Cosa dire a Nicola se qualcosa non è passato (vuoto se è filato tutto). */
  avviso: string;
};

async function rimettiAzioneInApprovazione(lv: Lavoro, ora: string): Promise<EsitoRipristino> {
  const nulla: EsitoRipristino = { tornata: false, firmaAncoraViva: false, avviso: "" };
  const m = (lv.richiesta || "").match(/l'azione\s+"([^"]+)"/i);
  const titolo = m?.[1]?.trim();
  if (!titolo) return nulla;
  const az = (await tutteLeAzioni()).find((a) => a.titolo === titolo);
  if (!az) return nulla;
  const { valori } = await getImpostazioni();
  const cur = valori[`azione:${az.id}`] || "";
  if (cur === "fatta" || cur === "simulata") return nulla;

  // AR-110: l'azione torna "da approvare", quindi la firma di Nicola va revocata. Se restasse,
  // il worker che riprende in mano il lavoro la troverebbe ancora firmata e potrebbe inviare
  // davvero un'azione che Nicola ha appena annullato.
  //
  // AR-384: la revoca è la scrittura che PROTEGGE, e prima il suo esito veniva buttato via — mentre
  // le due scritture successive, meno critiche, l'esito lo controllavano. Ora l'ordine è vincolato
  // dal modulo condiviso: se la firma non se ne va, lo stato NON si azzera. Meglio una card che
  // resta ferma di una card che torna «da approvare» con la firma ancora viva sotto.
  const nota = `↩️ Tornata in Da approvare perché annullata da Nicola dal Pannello (Lavori) il ${ora}. Non era ancora partita: nulla è stato inviato. Riapprovala se la vuoi eseguire.`;
  const esito = await scrivereInOrdine({
    sicurezza: {
      nome: "revoca della firma",
      esegui: async () => {
        try {
          await revocaFirmaObbligatoria(az.id);
          return true;
        } catch (e) {
          // Il tipo che lancia costringe a decidere QUI, e la decisione è: fermarsi.
          // Tutto ciò che non è una firma non scritta è un errore vero e deve restare visibile.
          if (!(e instanceof FirmaNonScritta)) throw e;
          return false;
        }
      },
    },
    poi: async () => {
      // Il posto preso al momento dell'approvazione va liberato: senza, l'azione resterebbe
      // «già in corso» per sempre e Nicola non potrebbe più riapprovarla.
      await liberaAzione(az.id);
      return [
        { nome: "stato", ok: await setImpostazione(`azione:${az.id}`, "") },
        { nome: "nota", ok: await setImpostazione(`azione:${az.id}:nota`, nota) },
      ];
    },
  });

  if (esito.bloccataSullaSicurezza) {
    return {
      tornata: false,
      firmaAncoraViva: true,
      avviso: `Il lavoro è annullato, ma NON sono riuscito a togliere la firma dall'azione «${az.titolo}»: resta firmata e il cervello potrebbe ancora eseguirla. Non l'ho rimessa in «Da approvare». Metti la pausa dal Pannello e riprova fra poco.`,
    };
  }
  return { tornata: esito.ok, firmaAncoraViva: false, avviso: esito.ok ? "" : esito.messaggio };
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
    let ripristino: EsitoRipristino = { tornata: false, firmaAncoraViva: false, avviso: "" };
    if (lv.tipo === "esegui-azione" && lv.stato === "in_attesa") {
      ripristino = await rimettiAzioneInApprovazione(lv, ora);
    }

    // AR-384: `tornataInApprovazione` dice la verità anche quando la revoca non è passata, e
    // l'avviso arriva a Nicola invece di restare nel nulla. Il lavoro È annullato (la scrittura sui
    // lavori ha confermato), quindi `ok` resta true: quello che può essere rimasto indietro è la
    // firma, e per quella c'è un campo suo.
    return NextResponse.json({
      ok: true,
      stato: "annullato",
      tipo: lv.tipo,
      tornataInApprovazione: ripristino.tornata,
      firmaAncoraViva: ripristino.firmaAncoraViva,
      ...(ripristino.avviso ? { avviso: ripristino.avviso, error: ripristino.avviso } : {}),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
