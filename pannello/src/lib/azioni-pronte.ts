import { readVaultFile } from "@/lib/vault";
import { getMetriche } from "@/lib/marketplace-db";
import { azioniDaSentinelle } from "@/lib/sentinelle";

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
};
export type AzionePronta = Blocco & { stato: StatoAzione; esito: string };

function livelloDi(s: string): Livello {
  if (s.includes("🟢")) return "verde";
  if (s.includes("🟡")) return "giallo";
  if (s.includes("🔴")) return "rosso";
  return "?";
}

function parse(md: string): Blocco[] {
  const out: Blocco[] = [];
  let cur: Blocco | null = null;
  let inTesto = false;
  for (const raw of md.split("\n")) {
    const h = raw.match(/^##\s+(\S+)\s+·\s+(.+)$/);
    if (h) {
      if (cur) out.push({ ...cur, testo: cur.testo.trim() });
      cur = { id: h[1], titolo: h[2].trim(), reparto: "", livello: "?", canale: "", destinatario: "", perche: "", preparato: "", testo: "", fonte: "vault" };
      inTesto = false;
      continue;
    }
    if (!cur) continue;
    if (!inTesto) {
      if (raw.trim() === "testo:") {
        inTesto = true;
        continue;
      }
      const f = raw.match(/^(\w+):\s*(.*)$/);
      if (f) {
        const k = f[1].toLowerCase();
        const v = f[2].trim();
        if (k === "reparto") cur.reparto = v;
        else if (k === "livello") cur.livello = livelloDi(v);
        else if (k === "canale") cur.canale = v;
        else if (k === "destinatario") cur.destinatario = v;
        else if (k === "perche") cur.perche = v;
        else if (k === "preparato") cur.preparato = v;
      }
    } else {
      cur.testo += (cur.testo ? "\n" : "") + raw;
    }
  }
  if (cur) out.push({ ...cur, testo: cur.testo.trim() });
  return out;
}

export function statoDa(raw: string): StatoAzione {
  if (raw === "approvata") return "coda"; // compatibilità con la Tappa 1
  if (raw === "rifiutata" || raw === "fatta" || raw === "simulata" || raw === "coda") return raw;
  return "";
}

// Tutte le azioni: quelle scritte dall'AD nel vault + quelle generate dalle
// sentinelle sui dati reali (in cima, sono "calde").
export async function tutteLeAzioni(): Promise<Blocco[]> {
  const md = await readVaultFile("90-Memoria-AI/AZIONI-PRONTE.md");
  const vault = md ? parse(md) : [];
  let sentinelle: Blocco[] = [];
  try {
    const m: any = await getMetriche();
    sentinelle = azioniDaSentinelle(m).map((s) => ({ ...s, fonte: "sentinella" as const }));
  } catch {
    sentinelle = [];
  }
  return [...sentinelle, ...vault];
}
