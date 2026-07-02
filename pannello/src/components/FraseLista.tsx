"use client";

import { testoPulito } from "@/lib/format";

/** Spezza una frase in testa in grassetto + coda leggibile (liste Plancia, Azioni, ecc.). */
function parti(testo: string): { lead: string; rest: string | null } {
  const pulito = testoPulito(testo);
  if (!pulito) return { lead: "", rest: null };

  const suDelim = pulito.split(/\s*(?:·|—|:)\s+/);
  if (suDelim.length >= 2 && suDelim[0].length <= 52) {
    return { lead: suDelim[0], rest: suDelim.slice(1).join(" · ") };
  }

  const suVirgola = pulito.split(/,\s+/);
  if (suVirgola.length >= 2 && suVirgola[0].length <= 56) {
    return { lead: suVirgola[0], rest: suVirgola.slice(1).join(", ") };
  }

  const parole = pulito.split(/\s+/);
  const taglio = Math.min(6, Math.max(3, Math.ceil(parole.length * 0.38)));
  if (parole.length > taglio) {
    return { lead: parole.slice(0, taglio).join(" "), rest: parole.slice(taglio).join(" ") };
  }

  return { lead: pulito, rest: null };
}

/** Riga lista: verbo/oggetto in grassetto, dettaglio più leggero — più scannable. */
export default function FraseLista({ testo, className = "" }: { testo: string; className?: string }) {
  const { lead, rest } = parti(testo);
  if (!lead) return null;

  return (
    <span className={`frase-lista line-clamp-2 ${className}`}>
      <strong className="frase-lista-lead">{lead}</strong>
      {rest ? <span className="frase-lista-rest"> {rest}</span> : null}
    </span>
  );
}
