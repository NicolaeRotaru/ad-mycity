"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, FileText } from "lucide-react";

type Risultato = { file: string; riga: string };

export default function RicercaGlobale() {
  const [q, setQ] = useState("");
  const [risultati, setRisultati] = useState<Risultato[]>([]);
  const [loading, setLoading] = useState(false);
  const [aperto, setAperto] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setRisultati([]);
      setAperto(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const mine = ++reqId.current; // marca questa richiesta: scarta le risposte sorpassate (race)
      setLoading(true);
      setAperto(true);
      try {
        const r = await fetch(`/api/cerca?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" }).then((x) => x.json());
        if (mine !== reqId.current) return; // è già partita una query più recente: ignora questo risultato
        setRisultati(r.risultati || []);
      } catch {
        if (mine === reqId.current) setRisultati([]);
      } finally {
        if (mine === reqId.current) setLoading(false);
      }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-4">
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <Search size={16} className="text-black/40 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca in tutta la memoria e la conoscenza (MyCity + AD MyCity)…"
            className="flex-1 text-[14px] bg-transparent outline-none placeholder:text-black/35"
          />
          {loading && <Loader2 size={15} className="animate-spin text-black/40" />}
        </div>

        {aperto && (
          <div className="mt-3 border-t border-black/[0.06] pt-3 space-y-1.5 max-h-80 overflow-y-auto">
            {!loading && risultati.length === 0 && <p className="text-[13px] text-black/45 py-2">Nessun risultato per “{q}”.</p>}
            {risultati.map((r, i) => (
              <div key={i} className="rounded-lg hover:bg-black/[0.03] px-2.5 py-2 transition">
                <div className="flex items-center gap-1.5 text-[11px] text-brand">
                  <FileText size={12} />
                  {r.file}
                </div>
                <p className="text-[13px] text-ink/80 mt-0.5 line-clamp-2">{r.riga}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
