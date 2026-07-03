"use client";

import { useState } from "react";
import { Terminal, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { REPARTI_COMANDI } from "@/lib/comandi-data";

export default function Comandi({ onScegli }: { onScegli?: (cmd: string) => void }) {
  const [aperto, setAperto] = useState(false);
  const [repartoAperto, setRepartoAperto] = useState<number | null>(null);

  const totale = REPARTI_COMANDI.reduce((n, r) => n + r.comandi.length, 0);

  const toggleReparto = (i: number) =>
    setRepartoAperto((cur) => (cur === i ? null : i));

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        className="w-full flex items-center gap-3 text-left px-4 py-3.5 hover:bg-[var(--bg-surface-2)] transition"
      >
        <span className="sez-ico shrink-0">
          <Terminal size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="t-sez text-[15px]">Comandi — cosa puoi dirmi</span>
          <div className="t-eti mt-0.5">
            {REPARTI_COMANDI.length} reparti · {totale} comandi
          </div>
        </div>
        <span className="shrink-0 t-eti">{aperto ? "chiudi" : "apri"}</span>
        <span className="shrink-0" style={{ color: "var(--text-faint)" }}>
          {aperto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: aperto ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t px-3 pb-3 pt-2 space-y-1" style={{ borderColor: "var(--border)" }}>
            {REPARTI_COMANDI.map((r, i) => {
              const open = repartoAperto === i;
              return (
                <div
                  key={r.nome}
                  className="rounded-xl border overflow-hidden transition"
                  style={{
                    borderColor: open ? "rgba(177, 92, 67, 0.35)" : "var(--border)",
                    background: open ? "var(--bg-surface-2)" : "var(--bg-surface)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleReparto(i)}
                    className="w-full flex items-center gap-2.5 text-left px-3 py-2.5"
                    aria-expanded={open}
                  >
                    <span className="text-[14px] flex-1 min-w-0 leading-snug font-medium" style={{ color: "var(--text-primary)" }}>
                      {r.nome}
                    </span>
                    <span className="badge badge-off shrink-0">{r.comandi.length}</span>
                    <span className="shrink-0" style={{ color: "var(--text-faint)" }}>
                      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </button>

                  <div
                    className="grid transition-[grid-template-rows] duration-200 ease-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-2 pb-2 space-y-1.5 border-t" style={{ borderColor: "var(--border)" }}>
                        {r.comandi.map((c) => (
                          <button
                            key={c.cmd}
                            type="button"
                            onClick={() => {
                              onScegli?.(c.cmd);
                              setAperto(false);
                              setRepartoAperto(null);
                            }}
                            className="w-full text-left rounded-lg border px-3 py-2.5 transition hover:border-brand/40"
                            style={{
                              background: c.evidenzia ? "var(--brand-soft)" : "var(--bg-elevated)",
                              borderColor: c.evidenzia ? "rgba(177, 92, 67, 0.3)" : "var(--border)",
                            }}
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {c.evidenzia && <Sparkles size={12} className="text-brand shrink-0" />}
                              <code className="text-[12.5px] font-semibold text-brand">
                                {c.cmd}
                              </code>
                            </div>
                            <p className="t-eti mt-1 text-[12px] leading-relaxed">{c.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <p className="t-eti text-[11px] leading-relaxed px-2 pt-2">
              Scrivimi come ti viene — posso imparare nuovi comandi e salvarli in{" "}
              <code className="text-brand">COMANDI.md</code>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
