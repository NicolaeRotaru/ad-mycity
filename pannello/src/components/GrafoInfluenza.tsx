"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type AreaIn = { area: string; n: number; peso: number; top: string[] };
type LevaOut = { nome: string; peso: number; leva: string; indiretto: string; colore: string; senior: string[] };
type Catena = { catena: string; anelli: string[]; opportunita: string; senior: string[] };
type Grafo = {
  generato: string;
  totali: { in: number; out: number; aree_in: number; catene: number };
  aree_in: AreaIn[];
  leve_out: LevaOut[];
  catene: Catena[];
};

const dotColore = (c: string) => (c === "verde" ? "bg-green-500" : c === "rosso" ? "bg-red-500" : "bg-amber-500");

// 🕸️ GRAFO D'INFLUENZA (Ondata 3.6) — il radar non più come lista ma come MAPPA:
// a sinistra cosa ci influenza (IN ⬇️), al centro MyCity, a destra cosa influenziamo
// (OUT ⬆️), e sotto le catene indirette (2°-3° ordine). Legge l'asset statico
// /radar-grafo.json (generato da cervello/genera-grafo.mjs).
export default function GrafoInfluenza() {
  const [g, setG] = useState<Grafo | null>(null);
  const [errore, setErrore] = useState(false);

  useEffect(() => {
    fetch("/radar-grafo.json", { cache: "no-store" })
      .then((r) => r.json())
      .then(setG)
      .catch(() => setErrore(true));
  }, []);

  if (errore) return <p className="text-[13px] text-black/45 py-4 text-center">Mappa non disponibile (rigenera con cervello/genera-grafo.mjs).</p>;
  if (!g) return <p className="text-[13px] text-black/45 py-6 text-center flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Carico la mappa…</p>;

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-black/50">
        {g.totali.in} fattori in entrata ({g.totali.aree_in} aree) · {g.totali.out} leve in uscita · {g.totali.catene} catene. Tutto ciò che a Piacenza ci tocca e che noi possiamo muovere.
      </p>

      {/* IN ⬇️  →  MyCity  →  OUT ⬆️ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        {/* SINISTRA — cosa ci influenza */}
        <div className="rounded-2xl border border-black/[0.07] bg-paper/30 p-3">
          <div className="t-micro mb-2">⬇️ Cosa ci influenza (entrata)</div>
          <div className="flex flex-wrap gap-1.5">
            {g.aree_in.map((a) => (
              <span
                key={a.area}
                title={a.top.join(" · ")}
                className={`inline-flex items-center gap-1 text-[11.5px] px-2 py-1 rounded-lg border surface-muted ${a.peso >= 5 ? "border-brand/40" : a.peso >= 4 ? "border-amber-300/60" : "border-black/10"}`}
              >
                {a.area}
                <span className="text-[10px] text-black/40">{a.n}</span>
              </span>
            ))}
          </div>
        </div>

        {/* CENTRO — MyCity */}
        <div className="flex lg:flex-col items-center justify-center gap-1 py-2">
          <ArrowRight className="text-brand/50 rotate-90 lg:rotate-0" size={18} />
          <div className="grid place-items-center w-20 h-20 rounded-full bg-brand text-white shadow-card shrink-0">
            <span className="text-[15px] font-bold tracking-tight">MyCity</span>
          </div>
          <ArrowRight className="text-brand/50 rotate-90 lg:rotate-0" size={18} />
        </div>

        {/* DESTRA — cosa influenziamo */}
        <div className="rounded-2xl border border-black/[0.07] bg-paper/30 p-3">
          <div className="t-micro mb-2">⬆️ Cosa influenziamo (uscita)</div>
          <div className="space-y-1">
            {g.leve_out.map((l) => (
              <div key={l.nome} title={`${l.leva}${l.indiretto ? " → " + l.indiretto : ""}`} className="flex items-center gap-1.5 text-[12px]">
                <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotColore(l.colore)}`} />
                <span className="text-ink/85 truncate">{l.nome}</span>
                {l.indiretto && <span className="ml-auto text-[10.5px] text-black/40 truncate max-w-[45%] text-right hidden sm:block">{l.indiretto}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATENE INDIRETTE */}
      <div className="rounded-2xl border border-black/[0.07] bg-paper/30 p-3">
        <div className="t-micro mb-2">🔗 Catene indirette (effetti a 2-3 mosse)</div>
        <div className="space-y-2">
          {g.catene.map((c, i) => (
            <div key={i} className="rounded-xl border border-black/[0.06] surface-muted p-2.5">
              <div className="flex flex-wrap items-center gap-1 text-[11.5px] text-ink/80">
                {c.anelli.map((an, j) => (
                  <span key={j} className="inline-flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-paper/70 border border-black/[0.06]">{an}</span>
                    {j < c.anelli.length - 1 && <ArrowRight size={11} className="text-black/30" />}
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-brand mt-1">→ {c.opportunita}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
