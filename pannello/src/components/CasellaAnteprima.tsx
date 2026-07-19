"use client";

import type { ReactNode } from "react";

/** Casella compatta: titolo + anteprima breve; clic per espandere il dettaglio. */
export default function CasellaAnteprima({
  titolo,
  meta,
  anteprima,
  children,
  className = "rounded-lg border border-black/[0.06] bg-paper/40",
  defaultOpen = false,
  id,
}: {
  titolo: ReactNode;
  meta?: ReactNode;
  anteprima?: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  id?: string;
}) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={`group ${className} px-2.5 py-2 [&_summary::-webkit-details-marker]:hidden`}
    >
      <summary className="cursor-pointer list-none select-none">
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium leading-snug">{titolo}</div>
          {meta ? <div className="flex items-center gap-1.5 flex-wrap mt-1">{meta}</div> : null}
          {anteprima ? (
            <p className="text-[11px] text-black/50 mt-1 leading-snug line-clamp-2 group-open:hidden">{anteprima}</p>
          ) : null}
        </div>
      </summary>
      <div className="mt-2 pt-2 border-t border-black/[0.06] space-y-1.5">{children}</div>
    </details>
  );
}

/** Prima riga utile per l'anteprima (max ~160 caratteri). */
export function anteprimaTesto(...parti: (string | undefined | null | false)[]): string | undefined {
  const t = parti.filter(Boolean).join(" · ").trim();
  if (!t) return undefined;
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}
