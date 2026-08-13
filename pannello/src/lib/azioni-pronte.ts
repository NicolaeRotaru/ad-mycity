import { readVaultFile, readVaultFileEsito } from "@/lib/vault";
import { getMetriche } from "@/lib/marketplace-db";
import { azioniDaSentinelle, PRICING_PITCH_DEFAULT, type PricingPitch } from "@/lib/sentinelle";
import { ordinaCoda, parseAzioniAttesa } from "@/lib/azioni-attesa";
import { livelloEffettivo } from "@/lib/livello-effettivo";

// Logica condivisa della corsia "Azioni pronte": parsing del vault, unione con
// le sentinelle, stato delle decisioni. Usata dall'endpoint /api/azioni-pronte
// e dall'autopilota.

export type StatoAzione = "" | "rifiutata" | "fatta" | "simulata" | "coda";
export type Livello = "verde" | "giallo" | "rosso" | "?";
export type Blocco = {
  id: string;
  // 🔢 Numero fisso della card («41»), quello che Nicola legge e pronuncia. Vuoto per le
  // azioni delle sentinelle e le card vecchie non numerate: lì la UI ripiega sul codice #A42.
  cartellino: string;
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
  // 🔗 Casella d'origine dell'azione (es. "difetto:AR-001"), per il link "vai all'origine".
  origine: string;
};
export type AzionePronta = Blocco & { stato: StatoAzione; esito: string };

// Mappa una riga della coda AZIONI-IN-ATTESA.md nel formato Blocco della corsia.
function bloccoDaAttesa(a: ReturnType<typeof parseAzioniAttesa>[number]): Blocco {
  return {
    // BUG #6 (radiografia 2026-07-03): `a.numero` è ora un id STABILE derivato dal contenuto
    // (idSezione, sia per le righe-tabella sia per le sezioni), non il numero di riga posizionale:
    // così la chiave decisione `azione:<id>` resta agganciata all'azione giusta dopo un rinumero.
    id: a.numero,
    cartellino: a.cartellino,
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
    origine: a.origine,
  };
}

async function leggiPricingDaRegistro(): Promise<PricingPitch> {
  const raw = await readVaultFile("90-Memoria-AI/registro-fatti.json");
  if (!raw) return PRICING_PITCH_DEFAULT;
  try {
    const reg = JSON.parse(raw) as { fatti?: { id?: string; valore?: string }[] };
    const byId = (id: string) => reg.fatti?.find((f) => f.id === id)?.valore;
    return {
      commissione: byId("pricing.commissione") || PRICING_PITCH_DEFAULT.commissione,
      abbonamento: byId("pricing.abbonamento") || PRICING_PITCH_DEFAULT.abbonamento,
    };
  } catch {
    return PRICING_PITCH_DEFAULT;
  }
}

export function statoDa(raw: string): StatoAzione {
  if (raw === "approvata") return "coda"; // compatibilità con la Tappa 1
  if (raw === "rifiutata" || raw === "fatta" || raw === "simulata" || raw === "coda") return raw;
  return "";
}

// Tutte le azioni: quelle scritte dall'AD nel vault + quelle generate dalle
// sentinelle sui dati reali (in cima, sono "calde").
export async function tutteLeAzioni(): Promise<Blocco[]> {
  return (await tutteLeAzioniConEsito()).azioni;
}

/**
 * AR-233 — come sopra, ma dice anche SE la coda è stata letta davvero.
 *
 * Prima `readVaultFile` restituiva `string | null`, e quel `null` valeva sia «il file non esiste» sia
 * «GitHub è giù / il token è morto». Diventava `[]`, e la home stampava «Niente da firmare. 👍» —
 * un pollice in su su una lista che nessuno aveva letto. Nella coda ci sono card 🔴 con scadenza:
 * è la bugia più cara che questo Pannello possa raccontare.
 *
 * Gli stati esistevano già in `readVaultFileEsito` (ok · assente · github-giu · auth): nessuno li
 * stava propagando.
 */
export async function tutteLeAzioniConEsito(): Promise<{ azioni: Blocco[]; codaLeggibile: boolean; motivoCoda: string }> {
  // Fonte unica con la scheda "Da firmare": la coda VERA che il giro aggiorna.
  const esito = await readVaultFileEsito("90-Memoria-AI/AZIONI-IN-ATTESA.md");
  const md = esito.stato === "ok" ? esito.testo : null;
  const codaLeggibile = esito.stato === "ok" || esito.stato === "assente";
  const motivoCoda = codaLeggibile
    ? ""
    : esito.stato === "auth"
      ? "il Pannello non è autorizzato a leggere la memoria (token scaduto o revocato)"
      : "non riesco a raggiungere la memoria su GitHub";
  // Le card in ordine: numero più alto (= nata per ultima) in alto, come chiesto da Nicola (13/8).
  const vault = md
    ? ordinaCoda(parseAzioniAttesa(md).filter((a) => a.inAttesa)).map(bloccoDaAttesa)
    : [];
  let sentinelle: Blocco[] = [];
  try {
    const [m, pricing] = await Promise.all([getMetriche(), leggiPricingDaRegistro()]);
    sentinelle = azioniDaSentinelle(m, pricing).map((s) => ({
      ...s,
      cartellino: "",
      fonte: "sentinella" as const,
      cambia: "",
      seguito: "",
      origine: `sentinella:${s.id}`,
    }));
  } catch {
    sentinelle = [];
  }
  // AR-140 — un solo punto in cui il colore diventa quello VERO, così il Pannello mostra a Nicola la
  // stessa cosa che l'autopilota userà per decidere. L'emoji nel markdown la scrive un senior; il
  // canale è un fatto. Se l'azione raggiunge qualcuno fuori, il livello sale a giallo — e solo sale.
  const conCanale = [...sentinelle, ...vault].map((b) => ({
    ...b,
    livello: livelloEffettivo(b.livello, b.canale),
  }));
  return { azioni: conCanale, codaLeggibile, motivoCoda };
}
