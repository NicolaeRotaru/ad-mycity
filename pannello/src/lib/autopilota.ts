import { getImpostazione, getImpostazioni, setImpostazione, logAzione } from "@/lib/store";
import { eseguiAzione } from "@/lib/mani";
import { tutteLeAzioni, statoDa } from "@/lib/azioni-pronte";
import { verificaEsecuzione, azioniLive } from "@/lib/guardrail-semaforo";

// Autopilota — il "battito" GRATIS della macchina (nessuna API AI, €0).
// Esegue DA SOLO le azioni SICURE (🟢 verde) non ancora decise.
// Stesse cinture delle mani: senza chiave/live → simula o resta in coda. Mai invii a sorpresa.
// Marca l'esito con "🤖 (automatico)" così si vede che l'ha fatto da solo.
// Usata dall'endpoint /api/azioni-pronte/autopilota (pannello) e dal cron (cuore su Vercel).
export async function eseguiAutopilota(): Promise<{ attivo: boolean; eseguite: number }> {
  const attivo = (await getImpostazione("autopilota")) === "on";
  if (!attivo) return { attivo: false, eseguite: 0 };

  const blocchi = await tutteLeAzioni();
  const { valori } = await getImpostazioni();
  const sicure = blocchi.filter((b) => b.livello === "verde" && statoDa(valori[`azione:${b.id}`] || "") === "");

  let eseguite = 0;
  for (const a of sicure) {
    const gate = verificaEsecuzione({
      live: azioniLive(),
      livello: a.livello,
      automatico: true,
      canale: a.canale,
      destinatario: a.destinatario,
      testo: a.testo,
      titolo: a.titolo,
    });
    if (!gate.ok) continue;
    const esito = await eseguiAzione({
      titolo: a.titolo,
      canale: a.canale,
      destinatario: a.destinatario,
      testo: a.testo,
      livello: a.livello,
      automatico: true,
    });
    await setImpostazione(`azione:${a.id}`, esito.stato);
    await setImpostazione(`azione:${a.id}:nota`, `🤖 (automatico) ${esito.dettaglio}`);
    await logAzione({ id: a.id, titolo: a.titolo, reparto: a.reparto, livello: a.livello, stato: esito.stato, esito: esito.dettaglio, auto: true });
    eseguite++;
  }
  return { attivo: true, eseguite };
}
