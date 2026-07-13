"use client";

import type { ReactNode } from "react";
import { humanizzaFinding, impattoCrescitaLeggibile, type FindingUmano } from "@/lib/radiografia-umana";
import ParlaCasella from "@/components/ParlaCasella";

type Props = {
  gravitaCls: string;
  gravitaDot: string;
  gravitaLabel: string;
  titolo?: string;
  descrizione?: string;
  impatto?: string;
  causa_radice?: string;
  fix?: string;
  fix_proposto?: string;
  dove?: string;
  impatto_crescita?: string;
  genera?: string;
  extra?: ReactNode;
  parlaTitolo?: string;
  parlaContesto?: string;
  umano?: FindingUmano;
};

export default function SchedaProblema({
  gravitaCls,
  gravitaDot,
  gravitaLabel,
  titolo,
  descrizione,
  impatto,
  causa_radice,
  fix,
  fix_proposto,
  dove,
  impatto_crescita,
  genera,
  extra,
  parlaTitolo,
  parlaContesto,
  umano: umanoProp,
}: Props) {
  const u = umanoProp || humanizzaFinding({ titolo, descrizione, impatto, causa_radice, fix, fix_proposto, dove });
  const contestoChat =
    parlaContesto ||
    [u.cosaSuccede, u.perche && `Perché: ${u.perche}`, u.cosaFare && `Cosa fare: ${u.cosaFare}`].filter(Boolean).join(" · ");

  return (
    <div className={`rounded-lg border p-2.5 mt-2 ${gravitaCls}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`w-1.5 h-1.5 rounded-full ${gravitaDot}`} />
        <span className="text-[10px] font-bold text-black/50">{gravitaLabel}</span>
        {impatto_crescita && (
          <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/55">{impattoCrescitaLeggibile(impatto_crescita)}</span>
        )}
        {genera && genera !== "solo-report" && (
          <span className="text-[10px] px-1.5 rounded bg-black/10 text-black/55 ml-auto">{genera}</span>
        )}
      </div>
      <div className="text-[12.5px] font-medium mt-1">{u.titolo}</div>
      {u.cosaSuccede && u.cosaSuccede !== u.titolo && (
        <div className="text-[12px] text-black/70 mt-0.5">{u.cosaSuccede}</div>
      )}
      {u.perche && (
        <div className="text-[12px] text-black/65 mt-1">
          <b>Perché succede:</b> {u.perche}
        </div>
      )}
      {u.cosaFare && (
        <div className="text-[12px] text-black/65 mt-0.5">
          <b>Cosa fare:</b> {u.cosaFare}
        </div>
      )}
      {extra}
      {u.tecnici && (
        <details className="mt-2 group">
          <summary className="text-[11px] font-medium text-black/45 cursor-pointer select-none hover:text-brand list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Dettagli tecnici
          </summary>
          <div className="text-[11px] text-black/50 mt-1.5 whitespace-pre-wrap break-words font-mono leading-relaxed">{u.tecnici}</div>
        </details>
      )}
      <ParlaCasella titolo={parlaTitolo || `Problema: ${u.titolo.slice(0, 60)}`} contesto={contestoChat} />
    </div>
  );
}
