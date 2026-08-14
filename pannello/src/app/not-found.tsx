"use client";

import { usePathname } from "next/navigation";
import { AREE_NOTE, destinazioneDaPercorso, viePerTornare } from "@/lib/nav";

/**
 * AR-610 — l'indirizzo sbagliato non finisce più in una pagina inglese senza uscite.
 *
 * Il difetto: il Pannello ha una pagina sola. Qualunque altro percorso — e sono percorsi che viene
 * naturale digitare, perché `azioni`, `lavori`, `numeri` sono i nomi delle aree — cadeva sul 404
 * predefinito di Next: «404 | This page could not be found.». Inglese, senza logo e senza un solo
 * link per rientrare. Non dice cosa fare, che è l'esatto contrario della regola di scrittura di casa.
 *
 * Le vie d'uscita le decide `viePerTornare` in lib/nav.ts, che non ne restituisce MAI zero: se il
 * percorso lascia intendere un'area (`/azioni`) la prima via porta lì, e l'ultima è sempre la Cabina.
 * La decisione sta là perché è quella che si può provare; qui restano solo le parole.
 */
export default function IndirizzoSbagliato() {
  const percorso = usePathname();
  const vie = viePerTornare(percorso);
  const intuita = destinazioneDaPercorso(percorso);
  const nomeArea = intuita ? AREE_NOTE[intuita.vista] : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="text-2xl">🧭</div>
        <h2 className="text-lg font-semibold">Questo indirizzo non esiste nella Cabina</h2>
        <p className="text-sm opacity-80">
          {nomeArea
            ? `Sembra che tu stessi cercando ${nomeArea}. La Cabina è una pagina sola: le aree si aprono da dentro, non con un indirizzo tutto loro.`
            : "La Cabina è una pagina sola: le aree — Azioni, Lavori, Numeri, Memoria — si aprono da dentro, non con un indirizzo tutto loro."}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {vie.map((v, i) => (
            <a
              key={v.href}
              href={v.href}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                i === 0 ? "bg-white/10 hover:bg-white/20" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {v.testo}
            </a>
          ))}
        </div>

        <p className="text-[11px] opacity-60">Indirizzo cercato: {percorso}</p>
      </div>
    </div>
  );
}
