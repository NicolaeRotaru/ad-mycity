"use client";

import { ChevronDown } from "lucide-react";
import { LISTA_PROSPECT_CENTRO, totaleProspect } from "@/lib/lista-prospect-centro";

export default function ListaProspectHome() {
  const tot = totaleProspect();

  return (
    <div className="space-y-1.5">
      <p className="t-eti mb-1.5 text-[12px]">
        Bottega = spesa casa. Clienti MyCity = botteghe, non ristoranti.
      </p>
      {LISTA_PROSPECT_CENTRO.map((sez) => (
        <details
          key={sez.id}
          className="rounded-xl border border-black/[0.07] bg-paper/30 group"
          open={sez.apertoDefault}
        >
          <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="text-[13px] font-medium flex-1 min-w-0" style={{ color: "var(--text-primary)" }}>
              {sez.titolo}
              <span className="ml-1.5 text-[11px] font-normal t-eti">({sez.voci.length})</span>
            </span>
            <ChevronDown size={14} className="shrink-0 text-black/35 transition group-open:rotate-180" />
          </summary>
          <div className="px-3 pb-2.5 pt-0 border-t border-black/[0.05]">
            {sez.nota && <p className="t-eti mb-2 mt-2">{sez.nota}</p>}
            <ul className="space-y-1">
              {sez.voci.map((v) => (
                <li key={`${sez.id}-${v.nome}`} className="text-[12px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{v.nome}</span>
                  <span className="text-black/40"> · </span>
                  {v.tipo}
                  {v.indirizzo && (
                    <>
                      <span className="text-black/40"> · </span>
                      {v.indirizzo}
                    </>
                  )}
                  {v.nota && <span className="block t-eti mt-0.5">{v.nota}</span>}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
      <p className="t-eti pt-1">{tot} locali mappati · ~17 botteghe food aggiuntive nei 407 lead (non estratte)</p>
    </div>
  );
}
