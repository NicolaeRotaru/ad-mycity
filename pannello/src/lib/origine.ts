import type { VistaNav } from "@/lib/nav";

// 🔗 ORIGINE — il ponte preciso "azione da firmare" ⇄ "casella da cui è nata".
// Il giro scrive su ogni azione un tag {origine:TIPO:ID} (es. {origine:difetto:AR-001}).
// Qui lo risolviamo nella posizione ESATTA dentro il Pannello: area + scheda + ancora DOM,
// così il link porta alla casella giusta, ovunque sia (non solo nel Cervello).

export type Origine = { vista: VistaNav; sub?: string; anchor: string; etichetta: string };

// TIPO → dove vive nel Pannello. ID = la chiave stabile della casella (id difetto, qid domanda, ecc.).
export function risolviOrigine(origine?: string): Origine | null {
  const raw = (origine || "").trim();
  if (!raw) return null;

  // Forma generica esplicita "vista#anchor" (fallback di fuga).
  if (raw.includes("#") && !raw.includes(":")) {
    const [vista, anchor] = raw.split("#");
    if (vista && anchor) return { vista: vista as VistaNav, anchor, etichetta: "l'origine" };
  }

  const i = raw.indexOf(":");
  const tipo = (i >= 0 ? raw.slice(0, i) : raw).toLowerCase().trim();
  const id = (i >= 0 ? raw.slice(i + 1) : "").trim();
  if (!id) return null;

  switch (tipo) {
    case "domanda":
      return { vista: "cervello", anchor: `domanda-${id}`, etichetta: "la domanda nell'Auto-coscienza" };
    case "entita":
    case "entità":
      return { vista: "cervello", anchor: `domanda-${id}`, etichetta: "l'entità nell'Auto-coscienza" };
    case "difetto":
      return { vista: "cervello", sub: "cantiere", anchor: `difetto-${id}`, etichetta: "il difetto nel Cantiere" };
    case "sentinella":
      return { vista: "azioni", sub: "sentinelle", anchor: `alert-${id}`, etichetta: "la sentinella" };
    case "mossa":
      return { vista: "azioni", sub: "mosse", anchor: `mossa-${id}`, etichetta: "la mossa di Nicola" };
    case "kpi":
    case "numero":
      return { vista: "numeri", anchor: `kpi-${id}`, etichetta: "il numero" };
    default:
      return null;
  }
}
