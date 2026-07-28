import { getImpostazione, getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa } from "@/lib/azioni-pronte";
import { registraFirma } from "@/lib/firma-azione";
import { selezionaAzioni } from "@/lib/selezione-autopilota";

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

export async function eseguiAutopilota(): Promise<{ attivo: boolean; eseguite: number; degradate?: number; in_pausa?: boolean }> {
  const attivo = (await getImpostazione("autopilota")) === "on";
  if (!attivo) return { attivo: false, eseguite: 0 };
  if (await pausaAttiva()) return { attivo: true, eseguite: 0, in_pausa: true };

  const blocchi = await tutteLeAzioni();
  const { valori } = await getImpostazioni();
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
  for (const d of selezione.degradate) {
    await setImpostazione(`azione:${d.azione.id}`, "coda");
    await setImpostazione(`azione:${d.azione.id}:nota`, `🤖 non eseguita da sola — ${d.motivo}`);
    await logAzione({
      id: d.azione.id, titolo: d.azione.titolo, reparto: d.azione.reparto, livello: d.azione.livello,
      stato: "coda", esito: `degradata (AR-232): ${d.indicatori.join(", ")}`, auto: true,
    });
  }

  let eseguite = 0;
  for (const a of selezione.esegui) {
    if (await pausaAttiva()) break; // pausa premuta durante il giro → fermati subito, non a fine ciclo
    const esito = await eseguiAzione({ titolo: a.titolo, canale: a.canale, destinatario: a.destinatario, testo: a.testo });
    // AR-110: qui ha deciso la MACCHINA, non Nicola. La firma si scrive lo stesso — serve la
    // traccia di chi ha deciso — ma col nome "auto", che il cancello lato cervello
    // (consenso-azione.mjs::firmaPannello) rifiuta. Senza questa distinzione bastava accendere
    // l'autopilota per far passare per "firmato da Nicola" un invio reale lanciato dalla CLI.
    await registraFirma(a.id, "auto");
    await setImpostazione(`azione:${a.id}`, esito.stato);
    await setImpostazione(`azione:${a.id}:nota`, `🤖 (automatico) ${esito.dettaglio}`);
    await logAzione({ id: a.id, titolo: a.titolo, reparto: a.reparto, livello: a.livello, stato: esito.stato, esito: esito.dettaglio, auto: true });
    eseguite++;
  }
  const degradate = selezione.degradate.length;
  return { attivo: true, eseguite, degradate };
}
