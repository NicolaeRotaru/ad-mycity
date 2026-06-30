"use client";

import { useState } from "react";
import { Terminal, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { REPARTI_COMANDI } from "@/lib/comandi-data";

export default function Comandi({ onScegli }: { onScegli?: (cmd: string) => void }) {
  const [aperto, setAperto] = useState(true);
  const [apertiReparti, setApertiReparti] = useState<Set<number>>(new Set());

  const toggleReparto = (i: number) =>
    setApertiReparti((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const tuttiAperti = apertiReparti.size === REPARTI_COMANDI.length;
  const toggleTutti = () =>
    setApertiReparti(tuttiAperti ? new Set() : new Set(REPARTI_COMANDI.map((_, i) => i)));

  const totale = REPARTI_COMANDI.reduce((n, r) => n + r.comandi.length, 0);

  return (
    <section className="card p-4 sm:p-5">
      <button type="button" onClick={() => setAperto((v) => !v)} className="w-full flex items-center gap-3 text-left">
        <span className="sez-ico">
          <Terminal size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="t-sez">Comandi — cosa puoi dirmi</span>
          <div className="t-eti mt-0.5">
            {REPARTI_COMANDI.length} reparti · {totale} comandi · tocca per metterli in chat
          </div>
        </div>
        <span className="shrink-0" style={{ color: "var(--text-faint)" }}>
          {aperto ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>

      {aperto && (
        <div className="mt-4">
          <div className="flex justify-end mb-3">
            <button type="button" onClick={toggleTutti} className="t-eti hover:text-brand transition px-2 py-1 rounded-lg">
              {tuttiAperti ? "Chiudi tutti i reparti" : "Apri tutti i reparti"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
            {REPARTI_COMANDI.map((r, i) => {
              const open = apertiReparti.has(i);
              return (
                <div
                  key={r.nome}
                  className={`surface-muted overflow-hidden transition ${open ? "ring-1 ring-brand/25" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleReparto(i)}
                    className="w-full flex items-center gap-2 text-left px-3 py-3"
                    aria-expanded={open}
                  >
                    <span className="t-sez text-[14px] flex-1 min-w-0 leading-snug">{r.nome}</span>
                    <span className="badge badge-off shrink-0">{r.comandi.length}</span>
                    <span className="shrink-0" style={{ color: "var(--text-faint)" }}>
                      {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                    </span>
                  </button>

                  {open && (
                    <div className="px-2 pb-2 space-y-1.5 border-t" style={{ borderColor: "var(--border)" }}>
                      {r.comandi.map((c) => (
                        <button
                          key={c.cmd}
                          type="button"
                          onClick={() => onScegli?.(c.cmd)}
                          className={`w-full text-left rounded-lg border p-3 transition hover:border-brand/35 ${
                            c.evidenzia ? "border-brand/30" : ""
                          }`}
                          style={{
                            background: c.evidenzia ? "var(--brand-soft)" : "var(--bg-elevated)",
                            borderColor: c.evidenzia ? undefined : "var(--border)",
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.evidenzia && <Sparkles size={12} className="text-brand shrink-0" />}
                            <code className="text-[12.5px] font-semibold text-brand bg-[var(--bg-surface)] ring-1 ring-brand/20 rounded-md px-2 py-0.5">
                              {c.cmd}
                            </code>
                          </div>
                          <p className="t-eti mt-1.5 leading-relaxed">{c.desc}</p>
                          {c.punti && (
                            <ul className="mt-2 space-y-1 border-t border-brand/15 pt-2">
                              {c.punti.map((p, k) => (
                                <li key={k} className="t-eti flex gap-2 leading-relaxed">
                                  <span className="text-brand shrink-0">•</span>
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="t-eti leading-relaxed mt-4 px-1">
            Non sono rigidi: scrivimi come ti viene. Puoi inventarne di nuovi («d&apos;ora in poi quando scrivo X fai Y») e li aggiungo in{" "}
            <code className="text-brand text-[12px]">COMANDI.md</code>.
          </p>
        </div>
      )}
    </section>
  );
}
