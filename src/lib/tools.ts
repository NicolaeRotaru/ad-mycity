import type Anthropic from "@anthropic-ai/sdk";
import { listMarketplaceFiles, readMarketplaceFile } from "@/lib/github";
import { listTables, queryTable } from "@/lib/marketplace-db";

// Strumenti "custom": eseguiti dal nostro server (a differenza di web_search,
// che e' un tool lato Anthropic). In v1 sono in SOLA LETTURA.
export const CUSTOM_TOOLS: Anthropic.Tool[] = [
  {
    name: "marketplace_elenco_file",
    description:
      "Restituisce l'elenco dei file del CODICE del marketplace MyCity (repo mycity). Per capire com'e' fatto il sito.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "marketplace_leggi_file",
    description:
      "Legge il contenuto di un file del CODICE del marketplace MyCity. Indica il percorso (es. 'src/app/page.tsx').",
    input_schema: {
      type: "object",
      properties: {
        percorso: { type: "string", description: "Percorso del file dalla root del repo." },
      },
      required: ["percorso"],
    },
  },
  {
    name: "dati_tabelle",
    description:
      "Elenca le tabelle del DATABASE del marketplace MyCity (ordini, clienti, ecc.). Usalo per scoprire dove sono i dati prima di interrogarli.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "dati_query",
    description:
      "Legge righe dal DATABASE del marketplace MyCity (sola lettura), con conteggio totale. Per rispondere a domande sui dati reali (es. ordini di oggi, clienti, incassi).",
    input_schema: {
      type: "object",
      properties: {
        tabella: { type: "string", description: "Nome della tabella (vedi dati_tabelle)." },
        select: { type: "string", description: "Colonne, es. 'id,totale,created_at' (default tutte)." },
        filtro: {
          type: "string",
          description:
            "Filtro in stile PostgREST, es. 'created_at=gte.2026-06-20' oppure 'stato=eq.consegnato'. Piu' condizioni separate da &.",
        },
        ordina: { type: "string", description: "Ordinamento, es. 'created_at.desc'." },
        limite: { type: "number", description: "Quante righe (1-100, default 20)." },
      },
      required: ["tabella"],
    },
  },
];

// Etichette leggibili per mostrare in chat cosa ha usato l'assistente.
export const TOOL_LABELS: Record<string, string> = {
  web_search: "Ricerca web",
  marketplace_elenco_file: "Elenco file del sito",
  marketplace_leggi_file: "Lettura file del sito",
  dati_tabelle: "Tabelle del marketplace",
  dati_query: "Dati del marketplace",
};

export async function executeCustomTool(name: string, input: any): Promise<string> {
  switch (name) {
    case "marketplace_elenco_file":
      return listMarketplaceFiles();
    case "marketplace_leggi_file":
      return readMarketplaceFile(String(input?.percorso || ""));
    case "dati_tabelle":
      return listTables();
    case "dati_query":
      return queryTable({
        tabella: String(input?.tabella || ""),
        select: input?.select,
        filtro: input?.filtro,
        ordina: input?.ordina,
        limite: input?.limite,
      });
    default:
      return `Strumento sconosciuto: ${name}`;
  }
}
