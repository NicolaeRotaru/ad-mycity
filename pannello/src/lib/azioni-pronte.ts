import { readVaultFile } from "@/lib/vault";
import { getMetriche } from "@/lib/marketplace-db";
import { azioniDaSentinelle } from "@/lib/sentinelle";
import { parseAzioniAttesa } from "@/lib/azioni-attesa";

// Logica condivisa della corsia "Azioni pronte": parsing del vault, unione con
// le sentinelle, stato delle decisioni. Usata dall'endpoint /api/azioni-pronte
// e dall'autopilota.

export type StatoAzione = "" | "rifiutata" | "fatta" | "simulata" | "coda";
export type Livello = "verde" | "giallo" | "rosso" | "?";
export type Blocco = {
  id: string;
  titolo: string;
  reparto: string;
  livello: Livello;
  canale: string;
  destinatario: string;
  perche: string;
  preparato: string;
  testo: string;
  fonte: "vault" | "sentinella";
  // Spiegazione specifica scritta dal senior (per la scheda nel Pannello).
  cambia: string;
  seguito: string;
};
export type AzionePronta = Blocco & { stato: StatoAzione; esito: string };

// Mappa una riga della coda AZIONI-IN-ATTESA.md nel formato Blocco della corsia.
function bloccoDaAttesa(a: ReturnType<typeof parseAzioniAttesa>[number]): Blocco {
  return {
    id: a.numero,
    titolo: a.azione,
    reparto: a.reparto,
    livello: a.livello,
    canale: a.canale,
    destinatario: "",
    perche: a.contenuto,
    preparato: a.data,
    testo: a.contenuto,
    fonte: "vault",
    cambia: a.cambia,
    seguito: a.seguito,
  };
}

export function statoDa(raw: string): StatoAzione {
  if (raw === "approvata") return "coda"; // compatibilità con la Tappa 1
  if (raw === "rifiutata" || raw === "fatta" || raw === "simulata" || raw === "coda") return raw;
  return "";
}

// Tutte le azioni: quelle scritte dall'AD nel vault + quelle generate dalle
// sentinelle sui dati reali (in cima, sono "calde").
export async function tutteLeAzioni(): Promise<Blocco[]> {
  // Fonte unica con la scheda "Da firmare": la coda VERA che il giro aggiorna.
  const md = await readVaultFile("90-Memoria-AI/AZIONI-IN-ATTESA.md");
  const vault = md
    ? parseAzioniAttesa(md)
        .filter((a) => a.inAttesa)
        .map(bloccoDaAttesa)
    : [];
  let sentinelle: Blocco[] = [];
  try {
    const m: any = await getMetriche();
    sentinelle = azioniDaSentinelle(m).map((s) => ({ ...s, fonte: "sentinella" as const, cambia: "", seguito: "" }));
  } catch {
    sentinelle = [];
  }
  return [...sentinelle, ...vault];
}
