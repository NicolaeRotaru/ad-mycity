// Scelta binaria A/B sulle Proposte dal giro — bottoni espliciti (mai Approva/Ignora generico).

export type SceltaAB = "A" | "B";

export type PropostaSceltaAB = {
  titolo?: string;
  motivo?: string;
  livello?: string;
  tipo?: string;
  /** Id stabile — la card non torna dopo la scelta */
  scelta_id?: string;
  opzione_a?: string;
  opzione_b?: string;
  /** Riga di contesto sotto il motivo (negozio, importo, scadenza…) */
  contesto?: string;
  /** Istruzioni per il cervello dopo il click (DECISIONI + AZIONI-IN-ATTESA) */
  istruzioni?: string;
};

export type DecisioneSceltaSalvata = {
  scelta: SceltaAB;
  at: string;
  id: string;
  titolo?: string;
  opzione_a?: string;
  opzione_b?: string;
};

export const PREFIX_CHIAVE = "decisione:scelta-ab:";

/** Legacy — ordine zombie prima del tipo generico */
export const LEGACY_ORDINE_ID = "ordine-zombie-58094956";
export const LEGACY_ORDINE_CHIAVE = "decisione:ordine-zombie-58094956";

export function chiaveScelta(id: string): string {
  return `${PREFIX_CHIAVE}${id}`;
}

export function isPropostaSceltaAB(p: PropostaSceltaAB): boolean {
  if (p.tipo === "scelta_ab" || p.tipo === "decisione_ordine_ab") return true;
  if (p.scelta_id && p.opzione_a && p.opzione_b) return true;
  const t = (p.titolo || "").toLowerCase();
  return (
    (/decisione/.test(t) || /scegli/.test(t)) &&
    (/\ba\s+accetta\b/.test(t) || /\ba\/b\b/.test(t) || /zombie/.test(t))
  );
}

function slugDaTitolo(titolo: string): string {
  const s = (titolo || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return s || "scelta";
}

const ISTRUZIONI_ORDINE_ZOMBIE =
  "Ordine ID: `58094956-4b9b-49b4-9299-7a5c645d7cb3` · Buyer tel. 348 642 1766 · COD €19,05 · pacchetto: consegne/operations/pacchetto-sblocco-ordine-zombie-19-05.md\n" +
  "1) Append in DECISIONI.md (🔴, operations, fonte Nicola Pannello A/B).\n" +
  "2) Accoda in AZIONI-IN-ATTESA.md l'esecuzione 🔴 (A=accetta+WhatsApp+consegna · B=annulla+messaggio buyer).\n" +
  "3) Aggiorna STATO + SALA-OPERATIVA.\n" +
  "4) Al prossimo giro NON rigenerare questa proposta (decisione già presa).";

export function normalizzaPropostaSceltaAB(p: PropostaSceltaAB): {
  id: string;
  opzione_a: string;
  opzione_b: string;
  contesto?: string;
  istruzioni?: string;
} {
  const legacy =
    p.tipo === "decisione_ordine_ab" ||
    (/zombie/.test((p.titolo || "").toLowerCase()) && /decisione ordine/.test((p.titolo || "").toLowerCase()));

  if (legacy) {
    return {
      id: LEGACY_ORDINE_ID,
      opzione_a: p.opzione_a || "Accetta e consegna",
      opzione_b: p.opzione_b || "Annulla (messaggio buyer)",
      contesto: p.contesto || "Pane Quotidiano · buyer 348 642 1766 · COD €19,05 · ordine dal 24/6",
      istruzioni: p.istruzioni || ISTRUZIONI_ORDINE_ZOMBIE,
    };
  }

  return {
    id: p.scelta_id || slugDaTitolo(p.titolo || ""),
    opzione_a: p.opzione_a || "Opzione A",
    opzione_b: p.opzione_b || "Opzione B",
    contesto: p.contesto,
    istruzioni: p.istruzioni,
  };
}

export function etichettaScelta(config: { opzione_a: string; opzione_b: string }, scelta: SceltaAB): string {
  return scelta === "A" ? `A — ${config.opzione_a}` : `B — ${config.opzione_b}`;
}

export function parseDecisioneSalvata(raw: string | null, id: string): DecisioneSceltaSalvata | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as DecisioneSceltaSalvata;
    if ((o?.scelta === "A" || o?.scelta === "B") && o.id === id) return o;
    if ((o?.scelta === "A" || o?.scelta === "B") && !o.id) return { ...o, id };
  } catch {
    if (raw === "A" || raw === "B") return { scelta: raw, at: "", id };
  }
  return null;
}

/** Legge decisioni salvate da mappa impostazioni (prefisso + legacy ordine zombie). */
export function decisioniDaImpostazioni(valori: Record<string, string>): Record<string, DecisioneSceltaSalvata> {
  const out: Record<string, DecisioneSceltaSalvata> = {};
  for (const [chiave, raw] of Object.entries(valori)) {
    if (chiave.startsWith(PREFIX_CHIAVE)) {
      const id = chiave.slice(PREFIX_CHIAVE.length);
      const d = parseDecisioneSalvata(raw, id);
      if (d) out[id] = d;
    }
  }
  const legacy = parseDecisioneSalvata(valori[LEGACY_ORDINE_CHIAVE] ?? null, LEGACY_ORDINE_ID);
  if (legacy) out[LEGACY_ORDINE_ID] = legacy;
  return out;
}
