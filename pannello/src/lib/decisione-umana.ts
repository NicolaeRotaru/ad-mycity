// Testo umano per le decisioni nel Pannello (cervello/scrittura-umana.md).
import { testoPulito } from "@/lib/format";
import { pulisciTitolo } from "@/lib/azioni-attesa";

const REPARTO: Record<string, string> = {
  "frontend-dev": "Squadra sito",
  "frontend-dev/Pannello": "Squadra sito",
  "Frontend/Pannello": "Squadra sito",
  "Product/Pannello": "Prodotto Pannello",
  "Product/Pannello/frontend-dev": "Prodotto Pannello",
  "Product/Pannello/UX": "Prodotto Pannello",
  "Product/Pannello/Home": "Home del Pannello",
  AD: "Direzione",
  "AD/Tech": "Direzione · tech",
  "AD/Content": "Direzione · contenuti",
  tech: "Tech",
  "devops-sre": "Infrastruttura",
};

export function repartoLeggibile(r: string): string {
  const raw = (r || "").trim();
  if (!raw) return "";
  if (REPARTO[raw]) return REPARTO[raw];
  return raw
    .replace(/^\[|\]$/g, "")
    .replace(/\//g, " · ")
    .replace(/-/g, " ");
}

export function livelloLeggibile(l: "verde" | "giallo" | "rosso" | "?"): string {
  if (l === "verde") return "Fatto da solo";
  if (l === "giallo") return "Fatto, ti avviso";
  if (l === "rosso") return "Serve la tua firma";
  return "Decisione";
}

export function titoloDecisione(cosa: string): string {
  const t = pulisciTitolo(testoPulito(cosa));
  // Togli prefissi tipo "Nicola —" o "PR #123 —" se restano troppo tecnici in testa
  return t.replace(/^(?:Nicola\s*[—–-]\s*)/i, "").replace(/^\*\*PR\s*#\d+\s*[—–-]\s*/i, "").trim() || t;
}

export function percheLeggibile(perche: string): string {
  const t = testoPulito(perche);
  if (!t) return "";
  // Accorcia ripetizioni lunghe di markdown bold
  return pulisciTitolo(t);
}

export function statoLeggibile(stato: string): string {
  const s = testoPulito(stato).trim();
  if (!s) return "";
  if (/IN ATTESA|pendente|attende/i.test(s)) return "In attesa";
  if (/NON eseguito|attende Approva/i.test(s)) return "Non ancora live";
  if (/mergiata|su main|LIVE/i.test(s)) return "Già applicato";
  if (/annullat/i.test(s)) return "Annullato";
  return s.length > 60 ? s.slice(0, 57) + "…" : s;
}
