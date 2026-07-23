import { getImpostazione, getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa } from "@/lib/azioni-pronte";

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

export async function eseguiAutopilota(): Promise<{ attivo: boolean; eseguite: number; in_pausa?: boolean }> {
  const attivo = (await getImpostazione("autopilota")) === "on";
  if (!attivo) return { attivo: false, eseguite: 0 };
  if (await pausaAttiva()) return { attivo: true, eseguite: 0, in_pausa: true };

  const blocchi = await tutteLeAzioni();
  const { valori } = await getImpostazioni();
  const sicure = blocchi.filter((b) => b.livello === "verde" && statoDa(valori[`azione:${b.id}`] || "") === "");

  let eseguite = 0;
  for (const a of sicure) {
    if (await pausaAttiva()) break; // pausa premuta durante il giro → fermati subito, non a fine ciclo
    const esito = await eseguiAzione({ titolo: a.titolo, canale: a.canale, destinatario: a.destinatario, testo: a.testo });
    await setImpostazione(`azione:${a.id}`, esito.stato);
    await setImpostazione(`azione:${a.id}:nota`, `🤖 (automatico) ${esito.dettaglio}`);
    await logAzione({ id: a.id, titolo: a.titolo, reparto: a.reparto, livello: a.livello, stato: esito.stato, esito: esito.dettaglio, auto: true });
    eseguite++;
  }
  return { attivo: true, eseguite };
}
