"use client";

import { timbro } from "@/lib/format";
import { freschezza, quandoMs } from "@/lib/verdetto-dato";

// Chip condivisa: mostra QUANDO un dato/blocco è apparso (o è stato aggiornato)
// nel pannello — data + ora di Piacenza. Usata ovunque, accanto a ogni dato,
// così Nicola sa con esattezza quando quel dato è comparso nella Cabina.
//
// AR-237 — DUE OROLOGI DIVERSI, E CONFONDERLI È UNA BUGIA.
//   · `at`       = quando IO ho chiesto (ora del browser). Dice che il Pannello è vivo, non che il
//                  dato è fresco: su una fonte ferma da tre giorni scriveva «aggiornato · adesso».
//   · `dataDato` = di quando è il DATO (la sua data vera: frontmatter, riga di coda, nome del file).
//                  Quando c'è, è LEI a comandare la targhetta, e sopra le 24 ore diventa ambra.
//                  Se la fonte non porta nessuna data non si inventa «adesso»: si scrive che non lo
//                  so — il terzo stato, quello che questa Cabina non sapeva dire.
// La decisione (fresco / vecchio / ignota) sta in `lib/verdetto-dato.ts`, dove un test la esegue.
export default function Aggiornato({
  at,
  dataDato,
  prefisso = "aggiornato",
  tettoOre = 24,
  className = "",
}: {
  at?: string | number | Date | null | undefined;
  dataDato?: string | number | Date | null | undefined;
  prefisso?: string;
  tettoOre?: number;
  className?: string;
}) {
  // Modalità «età del dato»: attiva appena il chiamante dichiara di conoscere la fonte, ANCHE se
  // il valore è null — «non so di quando sono questi dati» è un'informazione, il silenzio no.
  if (dataDato !== undefined) {
    const f = freschezza({ dataDato, tettoOre });
    // `quandoMs` normalizza anche il formato del vault («AAAA-MM-GG HH:MM», fuso di Piacenza),
    // che `new Date()` interpreterebbe nel fuso del browser.
    const t = f.stato === "ignota" ? "" : timbro(quandoMs(dataDato));
    const letto = at ? timbro(at) : "";
    return (
      <span
        className={`t-aggiornato ${f.ambra ? "text-amber-600" : ""} ${className}`}
        title={
          f.stato === "ignota"
            ? `La fonte non porta una data.${letto ? ` Letto dal pannello: ${letto}` : ""}`
            : `Data del dato: ${t}${f.oreFa != null ? ` (${Math.round(f.oreFa)} ore fa)` : ""}.${letto ? ` Letto dal pannello: ${letto}` : ""}`
        }
      >
        {f.ambra ? "⚠️" : "🕗"} {f.prefisso}
        {t ? ` · ${t}` : ""}
      </span>
    );
  }

  if (!at) return null; // null/undefined/0/"" → niente chip
  const t = timbro(at);
  if (!t) return null;
  return (
    <span
      className={`t-aggiornato ${className}`}
      title={`Apparso nel pannello: ${t}`}
    >
      🕗 {prefisso} · {t}
    </span>
  );
}
