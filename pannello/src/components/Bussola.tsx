"use client";

import { useState } from "react";
import { Compass, ChevronDown } from "lucide-react";
import { vaiArea, type VistaNav } from "@/lib/nav";

// 🧭 La Bussola: "non so dove andare a cercare". Questa guida traduce ogni domanda
// comune ("dove firmo?", "dov'è il piano?", "dove sono i numeri?") nell'area giusta,
// con un pulsante che ci porta davvero. È la mappa del Pannello a portata di clic.

type Riga = { q: string; area: VistaNav; sub?: string; dove: string };

const RIGHE: Riga[] = [
  { q: "Cosa devo firmare o approvare adesso", area: "azioni", sub: "approvare", dove: "Azioni › Da approvare" },
  { q: "I report, le radiografie e i piani (es. il §6 del piano di bonifica)", area: "report", dove: "Report & Piani" },
  { q: "Gli allarmi e le cose che sono scattate", area: "azioni", sub: "sentinelle", dove: "Azioni › Allarmi" },
  { q: "Le cose che devo fare io (to-do)", area: "azioni", sub: "dafare", dove: "Azioni › Cose da fare" },
  { q: "I numeri, gli incassi, i KPI dell'azienda", area: "numeri", dove: "Numeri" },
  { q: "Le decisioni passate e lo stato dell'azienda", area: "memoria", dove: "Memoria" },
  { q: "Cosa sta facendo la macchina in questo momento", area: "lavori", dove: "Lavori" },
  { q: "La salute della macchina e i suoi difetti", area: "cervello", dove: "Macchina" },
  { q: "Clienti, venditori e rider", area: "persone", dove: "Persone" },
  { q: "Ordini, consegne, catalogo e campagne", area: "operazioni", dove: "Operazioni" },
  { q: "Concorrenti, mercato, eventi e rischi", area: "mondo", dove: "Mondo" },
  { q: "Parlare con l'AD (chiedere qualcosa)", area: "assistente", dove: "Assistente" },
  { q: "Il diario e lo storico di cosa ha detto e fatto l'AD", area: "storico", dove: "Storico" },
  { q: "Il codice del sito", area: "esplora", dove: "GitHub" },
];

export default function Bussola() {
  const [aperto, setAperto] = useState(false);
  return (
    <section className="card overflow-hidden">
      <button
        onClick={() => setAperto((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-brand-50/40 transition"
      >
        <span className="sez-ico"><Compass size={16} /></span>
        <span className="min-w-0">
          <span className="t-sez block">Dove trovo cosa?</span>
          <span className="t-eti">Non sai dove andare? Apri la bussola: ogni cosa, con il pulsante che ti ci porta.</span>
        </span>
        <ChevronDown size={16} className={`ml-auto shrink-0 text-black/40 transition-transform ${aperto ? "rotate-180" : ""}`} />
      </button>
      {aperto && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="space-y-1.5 mt-2">
            {RIGHE.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <span className="t-riga min-w-0 flex-1">{r.q}</span>
                <button
                  onClick={() => vaiArea(r.area, undefined, r.sub)}
                  className="shrink-0 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline whitespace-nowrap"
                  title={`Vai a ${r.dove}`}
                >
                  {r.dove} →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
