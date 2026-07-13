"use client";

import { useCallback, useEffect, useState } from "react";
import { Terminal, RefreshCw } from "lucide-react";
import { faRelativo } from "@/lib/format";
import { usePanelSync } from "@/lib/panel-sync";

// 📜 Risultati comandi macchina — la STORIA di cosa ha eseguito il worker (giro, ritmo-mattino,
// ritmo-sera). I PULSANTI per lanciare i comandi sono stati spostati nella casella «Stato worker»
// (componente DiagnosticaWorker, richiesta di Nicola); qui resta solo l'esito recente, in una
// pagina dedicata dell'area Lavori. A eseguirli è sempre il worker sul VPS.

type Risultato = {
  id: string; tipo: string; stato: string; richiesta: string; risultato: string;
  created_at: string; updated_at: string;
};

const STATO_ETI: Record<string, { txt: string; cls: string }> = {
  in_attesa: { txt: "⏳ in coda", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  in_corso: { txt: "⚙️ in corso", cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  fatto: { txt: "✅ fatto", cls: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300" },
  // (coerente col fix #6) un fallito è "da riapprovare", non un allarme.
  errore: { txt: "🔄 da riapprovare", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
};

export default function ComandiVPS() {
  const [risultati, setRisultati] = useState<Risultato[]>([]);
  const [collegato, setCollegato] = useState<boolean>(true);
  const [espanso, setEspanso] = useState<Set<string>>(new Set());

  const carica = useCallback(() => {
    fetch("/api/comando-vps", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { setRisultati(d.risultati || []); setCollegato(Boolean(d.collegato)); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const t = setInterval(carica, 6000);
    return () => clearInterval(t);
  }, [carica]);

  usePanelSync(["lavori", "memoria", "all"], carica);

  const toggle = (id: string) =>
    setEspanso((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <section className="card p-4">
      <div className="sez-head mb-1">
        <span className="sez-ico"><Terminal size={16} /></span>
        <div className="min-w-0 flex-1">
          <span className="t-sez">Risultati comandi</span>
          <p className="t-eti mt-0.5">
            L&apos;esito recente dei comandi macchina (giro, Piano del mattino, Report della sera).
            Li lanci dalla casella <b>Stato worker</b>; l&apos;esito compare qui appena il worker li esegue.
          </p>
        </div>
        <button onClick={carica} className="btn-ghost shrink-0" title="Aggiorna risultati"><RefreshCw size={14} /></button>
      </div>

      {!collegato && (
        <p className="t-eti text-amber-700 dark:text-amber-400 mt-2">
          ⚠️ Memoria non collegata: i risultati compaiono quando il Pannello vede Supabase.
        </p>
      )}

      <div className="mt-4">
        {risultati.length === 0 ? (
          <p className="t-eti">Nessun comando ancora. Lancia un comando dalla casella «Stato worker»: appena il worker lo esegue, l&apos;esito compare qui.</p>
        ) : (
          <div className="space-y-1.5">
            {risultati.map((r) => {
              const b = STATO_ETI[r.stato] || { txt: r.stato, cls: "bg-black/[0.05] text-black/55" };
              const aperto = espanso.has(r.id);
              const hasOut = Boolean(r.risultato && r.risultato.trim());
              return (
                <div key={r.id} className="surface-muted p-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] font-medium" style={{ color: "var(--text-primary)" }}>{r.richiesta || r.tipo}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${b.cls}`}>{b.txt}</span>
                    <span className="t-eti ml-auto shrink-0">{faRelativo(r.updated_at || r.created_at)}</span>
                  </div>
                  {hasOut && (
                    <>
                      <button onClick={() => toggle(r.id)} className="t-eti hover:text-brand transition mt-1 inline-flex items-center gap-1">
                        {aperto ? "nascondi esito" : "vedi esito"}
                      </button>
                      {aperto && (
                        <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12px] leading-relaxed border-l-2 border-brand/30 pl-3 py-1.5 max-h-72 overflow-y-auto" style={{ color: "var(--text-secondary)" }}>{r.risultato}</pre>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
