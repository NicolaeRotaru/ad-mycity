"use client";

import { Fragment } from "react";
import Modulo from "@/components/Modulo";
import Aggiornato from "@/components/Aggiornato";
import { MODULI, type AreaModulo } from "@/lib/moduli";

// Renderizza la griglia di moduli di un'area (Persone / Operazioni / Mondo),
// raggruppati per sotto-area. Config-driven: pesca da lib/moduli.ts.
export default function AreaModuli({
  area,
  titolo,
  sottotitolo,
  metriche,
  aggAt,
}: {
  area: AreaModulo;
  titolo?: string;
  sottotitolo?: string;
  metriche: Record<string, any> | null;
  aggAt?: number | null;
}) {
  const lista = MODULI.filter((m) => m.area === area);
  return (
    <div className="space-y-3">
      {titolo && (
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="t-area">{titolo}</h2>
            {sottotitolo && <p className="t-eti mt-0.5">{sottotitolo}</p>}
          </div>
          <Aggiornato at={aggAt} className="mt-1 shrink-0" />
        </div>
      )}
      <div className="space-y-1.5">
        {lista.map((m, i) => {
          const nuovoGruppo = i === 0 || lista[i - 1].gruppo !== m.gruppo;
          return (
            <Fragment key={m.titolo}>
              {nuovoGruppo && m.gruppo && <div className="t-micro px-0.5 pt-2 pb-0.5">{m.gruppo}</div>}
              <Modulo def={m} metriche={metriche} />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
