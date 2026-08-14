import { getImpostazione, getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa } from "@/lib/azioni-pronte";
import { registraFirma } from "@/lib/firma-azione";
import { selezionaAzioni } from "@/lib/selezione-autopilota";
import { attoUnaVoltaSola, chiusuraAtto } from "@/lib/cancello-atto";
import {
  prenotaAzione,
  sigillaAzione,
  prenotaChiave,
  liberaChiave,
  CHIAVE_POSTO_AUTOPILOTA,
} from "@/lib/prenotazione-atto";

// Autopilota — il "battito" GRATIS della macchina (nessuna API AI, €0).
// Esegue DA SOLO le azioni SICURE (🟢 verde) non ancora decise.
// Stesse cinture delle mani: senza chiave/live → simula o resta in coda. Mai invii a sorpresa.
// Marca l'esito con "🤖 (automatico)" così si vede che l'ha fatto da solo.
// Usata dall'endpoint /api/azioni-pronte/autopilota (pannello) e dal cron (cuore su Vercel).
//
// AR-138: la PAUSA (kill-switch dal Pannello) DEVE fermare anche questa via, non solo la CLI
// (cervello/consenso-azione.mjs::pausaAttiva). Stessa chiave "pausa" nella stessa tabella
// impostazioni — letta qui prima di eseguire qualunque cosa, e ricontrollata a ogni azione
// (un giro può durare secondi/minuti: se Nicola preme pausa a metà, si ferma da lì).
async function pausaAttiva(): Promise<boolean> {
  return (await getImpostazione("pausa")) === "on";
}

export type EsitoAutopilota = {
  attivo: boolean;
  eseguite: number;
  degradate?: number;
  in_pausa?: boolean;
  /** Un altro giro di autopilota è già in corso: questo si è fermato senza fare niente (AR-412). */
  gia_in_corso?: boolean;
  /** Non ho potuto leggere lo stato delle azioni: mi sono fermato invece di trattarlo come «vuoto». */
  cieco?: boolean;
  /** Il giro si è interrotto perché una registrazione non è passata (AR-385). */
  fermato?: string;
};

export async function eseguiAutopilota(): Promise<EsitoAutopilota> {
  const attivo = (await getImpostazione("autopilota")) === "on";
  if (!attivo) return { attivo: false, eseguite: 0 };
  if (await pausaAttiva()) return { attivo: true, eseguite: 0, in_pausa: true };

  // AR-412(b) — UN GIRO ALLA VOLTA. L'autopilota parte da TRE strade indipendenti (il cron del
  // battito, il componente Autopilota e l'area Azioni, e le ultime due partono insieme al
  // caricamento della stessa pagina). Su Vercel sono processi diversi: un lucchetto tenuto in
  // memoria non le vede. Questo posto sta nel dato, con scadenza, e vale per tutte e tre.
  if ((await prenotaChiave(CHIAVE_POSTO_AUTOPILOTA, "giro")) !== "mia") {
    return { attivo: true, eseguite: 0, gia_in_corso: true };
  }
  try {
    return await giroAutopilota();
  } finally {
    await liberaChiave(CHIAVE_POSTO_AUTOPILOTA);
  }
}

async function giroAutopilota(): Promise<EsitoAutopilota> {
  const blocchi = await tutteLeAzioni();
  const { tabella, valori } = await getImpostazioni();
  // AR-383/AR-413, stessa malattia: senza memoria `valori` è una mappa vuota, quindi OGNI azione
  // risulterebbe «mai decisa» e l'autopilota le rieseguirebbe tutte. Un errore di lettura non è uno
  // zero: qui è la differenza fra «non c'è niente da fare» e «non lo so».
  if (!tabella) return { attivo: true, eseguite: 0, cieco: true };
  // AR-140 — il colore da solo non basta: lo scrive un senior nel markdown, e un 🟢 di troppo su una
  // card che manda una mail farebbe partire una mail vera senza che nessuno l'abbia letta. Il canale
  // è un fatto, l'emoji è una dichiarazione: se l'azione raggiunge qualcuno fuori, il livello sale a
  // giallo e passa dalle mani di Nicola, qualunque cosa dica il testo. Può solo alzare, mai abbassare.
  // AR-140 + AR-232 — la decisione NON vive qui dentro. Sta in `selezionaAzioni`, una funzione pura
  // che una prova può eseguire su azioni finte: colore, canale e contenuto in un posto solo. Tenerla
  // qui aveva un difetto sottile e già visto tre volte in questi lotti — un cancello dentro
  // l'esecutore si spegne cambiando due caratteri, e la prova che lo guardava restava verde.
  const nonDecise = blocchi.filter((b) => statoDa(valori[`azione:${b.id}`] || "") === "");
  const selezione = selezionaAzioni(nonDecise);

  // Le degradate si scrivono PRIMA di eseguire qualunque cosa: se la pausa arriva a metà, resta
  // comunque a video il perché non sono partite, invece di sparire in silenzio.
  // L'esito si guarda: una degradata che non si scrive torna «non decisa» al battito dopo, e
  // l'autopilota ci ripassa sopra ogni volta senza che il motivo compaia mai a video.
  for (const d of selezione.degradate) {
    const c = chiusuraAtto({
      scritture: [
        { nome: "stato", ok: await setImpostazione(`azione:${d.azione.id}`, "coda") },
        { nome: "nota", ok: await setImpostazione(`azione:${d.azione.id}:nota`, `🤖 non eseguita da sola — ${d.motivo}`) },
      ],
      attoEseguito: false,
    });
    await logAzione({
      id: d.azione.id, titolo: d.azione.titolo, reparto: d.azione.reparto, livello: d.azione.livello,
      stato: "coda", esito: `degradata (AR-232): ${d.indicatori.join(", ")}`, auto: true,
    });
    if (!c.ok) return { attivo: true, eseguite: 0, degradate: selezione.degradate.length, fermato: c.messaggio };
  }

  let eseguite = 0;
  for (const a of selezione.esegui) {
    if (await pausaAttiva()) break; // pausa premuta durante il giro → fermati subito, non a fine ciclo

    // AR-385 — L'ORDINE. Prima l'autopilota eseguiva la mano e SOLO DOPO scriveva lo stato, con
    // l'esito della scrittura buttato via. Se quella scrittura falliva, al battito successivo il
    // filtro qui sopra vedeva l'azione ancora «non decisa», la riselezionava e la rieseguiva —
    // davvero. Non mancava un cancello: mancava che il segnaposto fosse scritto PRIMA, e con
    // l'esito confermato. Adesso l'ordine sta in `attoUnaVoltaSola` e non si può invertire qui.
    const svolgimento = await attoUnaVoltaSola({
      prenota: () => prenotaAzione(a.id, "auto"),
      atto: () => eseguiAzione({ titolo: a.titolo, canale: a.canale, destinatario: a.destinatario, testo: a.testo }),
      registra: async (esito) => [
        { nome: "sigillo dell'atto", ok: await sigillaAzione(a.id, esito.stato) },
        // AR-110: qui ha deciso la MACCHINA, non Nicola. La firma si scrive lo stesso — serve la
        // traccia di chi ha deciso — ma col nome "auto", che il cancello lato cervello
        // (consenso-azione.mjs::firmaPannello) rifiuta. Senza questa distinzione bastava accendere
        // l'autopilota per far passare per "firmato da Nicola" un invio reale lanciato dalla CLI.
        { nome: "firma automatica", ok: await registraFirma(a.id, "auto") },
        { nome: "stato", ok: await setImpostazione(`azione:${a.id}`, esito.stato) },
        { nome: "nota", ok: await setImpostazione(`azione:${a.id}:nota`, `🤖 (automatico) ${esito.dettaglio}`) },
      ],
    });

    if (!svolgimento.eseguito) {
      // Posto già preso o prenotazione incerta: questa azione non è partita da qui. Non è un errore
      // del giro — è il caso che il difetto lasciava passare — quindi si va avanti con le altre.
      if (svolgimento.motivo === "gia-in-corso") continue;
      return { attivo: true, eseguite, degradate: selezione.degradate.length, fermato: svolgimento.messaggio };
    }

    await logAzione({ id: a.id, titolo: a.titolo, reparto: a.reparto, livello: a.livello, stato: svolgimento.risultato.stato, esito: svolgimento.risultato.dettaglio, auto: true });
    eseguite++;

    // Registrazione non confermata dopo un atto reale: il giro si FERMA e lascia detto perché.
    // Continuare significherebbe accumulare azioni eseguite che nessuno ha segnato — cioè
    // ricostruire il difetto una riga più in basso.
    if (!svolgimento.registrato) {
      // L'allarme è un di più: se la memoria è talmente giù da non prenderlo, il giro si ferma
      // ugualmente e il motivo torna a chi ha chiamato dentro `fermato`. Non è un esito ingoiato:
      // è un esito che ha già la sua strada principale, e questa è la copia per la Cabina.
      const allarmeScritto = await setImpostazione(
        "autopilota:allarme",
        `${new Date().toISOString()} — ${svolgimento.messaggio}`,
      );
      const coda = allarmeScritto ? "" : " (allarme non salvato in memoria: lo vedi solo qui)";
      return { attivo: true, eseguite, degradate: selezione.degradate.length, fermato: svolgimento.messaggio + coda };
    }
  }
  const degradate = selezione.degradate.length;
  return { attivo: true, eseguite, degradate };
}
