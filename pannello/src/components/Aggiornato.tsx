"use client";

import { timbro } from "@/lib/format";

// Chip condivisa: mostra QUANDO un dato/blocco è apparso (o è stato aggiornato)
// nel pannello — data + ora di Piacenza. Usata ovunque, accanto a ogni dato,
// così Nicola sa con esattezza quando quel dato è comparso nella Cabina.
export default function Aggiornato({
  at,
  prefisso = "aggiornato",
  className = "",
}: {
  at: string | number | Date | null | undefined;
  prefisso?: string;
  className?: string;
}) {
  if (!at) return null; // null/undefined/0/"" → niente chip
  const t = timbro(at);
  if (!t) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] text-black/40 whitespace-nowrap ${className}`}
      title={`Apparso nel pannello: ${t}`}
    >
      🕗 {prefisso} · {t}
    </span>
  );
}
