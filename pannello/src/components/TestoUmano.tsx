"use client";

import { quadroTesto } from "@/lib/radiografia-umana";

export function DettagliTecnici({ testo }: { testo?: string }) {
  if (!testo?.trim()) return null;
  return (
    <details className="mt-2 group">
      <summary className="text-[11px] font-medium text-black/45 cursor-pointer select-none hover:text-brand list-none flex items-center gap-1">
        <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Dettagli tecnici
      </summary>
      <div className="text-[11px] text-black/50 mt-1.5 whitespace-pre-wrap break-words font-mono leading-relaxed">
        {testo}
      </div>
    </details>
  );
}

/** Testo completo in italiano semplice + appendice tecnica (niente omesso). */
export function TestoUmano({
  testo,
  className = "text-[12.5px] text-black/80 whitespace-pre-wrap break-words [overflow-wrap:anywhere]",
}: {
  testo?: string;
  className?: string;
}) {
  const raw = (testo || "").trim();
  if (!raw) return null;
  const { visibile, tecnici } = quadroTesto(raw);
  return (
    <>
      <div className={className}>{visibile}</div>
      <DettagliTecnici testo={tecnici} />
    </>
  );
}
