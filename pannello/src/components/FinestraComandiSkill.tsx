"use client";

import { useState } from "react";
import { Zap, X, ChevronDown, ChevronRight, Sparkles, Terminal } from "lucide-react";
import { REPARTI_COMANDI, SKILL_RAPIDE } from "@/lib/comandi-data";

// ⚡ FINESTRA "Skill & comandi" — si apre e si chiude DENTRO la chat, sopra la
// casella di scrittura. Sostituisce le chip fisse sopra l'input e la vecchia card
// "Comandi — cosa puoi dirmi" in fondo alla pagina: tutto vive qui, richiamato dal
// pulsante ⚡ nella riga dei pulsanti (allega · voce · invia).
// Un tocco su una skill/comando riempie l'input (il genitore chiude la finestra).

/** Il pulsante ⚡ da mettere nella riga dei pulsanti della chat (stessa taglia degli altri). */
export function BottoneSkill({
  aperta,
  onToggle,
  lato = 44,
  icona = 18,
}: {
  aperta: boolean;
  onToggle: () => void;
  lato?: number;
  icona?: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`grid place-items-center rounded-xl border transition active:scale-95 ${
        aperta
          ? "bg-brand/10 text-brand border-brand/40"
          : "border-black/10 text-black/55 hover:bg-black/[0.04]"
      }`}
      style={{ minHeight: lato, minWidth: lato }}
      aria-label="Skill e comandi"
      aria-expanded={aperta}
      title="Skill e comandi rapidi"
    >
      <Zap size={icona} />
    </button>
  );
}

/** La finestra vera e propria: mettila SOPRA la textarea della chat. */
export default function FinestraComandiSkill({
  aperta,
  onChiudi,
  onScegli,
}: {
  aperta: boolean;
  onChiudi: () => void;
  onScegli: (cmd: string) => void;
}) {
  const [repartoAperto, setRepartoAperto] = useState<number | null>(null);
  if (!aperta) return null;

  const totale = REPARTI_COMANDI.reduce((n, r) => n + r.comandi.length, 0);
  const toggleReparto = (i: number) => setRepartoAperto((cur) => (cur === i ? null : i));

  return (
    <div
      className="rounded-xl border shadow-lg overflow-hidden"
      style={{ borderColor: "var(--border)", background: "var(--bg-surface)" }}
    >
      {/* Testata della finestra */}
      <div
        className="px-3 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: "var(--border)", background: "var(--bg-surface-2)" }}
      >
        <span className="text-brand"><Zap size={14} /></span>
        <span className="text-[12.5px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Skill &amp; comandi
        </span>
        <span className="t-eti text-[11px]">
          {SKILL_RAPIDE.length} skill · {totale} comandi
        </span>
        <button
          type="button"
          onClick={onChiudi}
          className="ml-auto grid place-items-center w-7 h-7 rounded-lg text-black/45 hover:bg-black/[0.05] transition"
          aria-label="Chiudi skill e comandi"
          title="Chiudi"
        >
          <X size={15} />
        </button>
      </div>

      {/* Corpo scrollabile: la finestra non sfonda mai la chat */}
      <div className="scroll-soft overflow-y-auto max-h-[min(340px,45vh)] p-2.5 space-y-3">
        {/* ⚡ Skill rapide — un tocco e l'input è pronto */}
        <div>
          <p className="t-eti text-[11px] mb-1.5 flex items-center gap-1">
            <Zap size={11} /> Skill rapide
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_RAPIDE.map((s) => (
              <button
                key={s.cmd}
                type="button"
                onClick={() => onScegli(s.cmd)}
                className="text-xs font-medium border border-brand/30 bg-brand-50/40 text-ink/70 rounded-full px-2.5 py-1 hover:border-brand/50 hover:bg-brand-50/70 active:scale-95 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* >_ Comandi per reparto — il vecchio menù "cosa puoi dirmi", ora dentro la chat */}
        <div>
          <p className="t-eti text-[11px] mb-1.5 flex items-center gap-1">
            <Terminal size={11} /> Comandi — cosa puoi dirmi
          </p>
          <div className="space-y-1">
            {REPARTI_COMANDI.map((r, i) => {
              const open = repartoAperto === i;
              return (
                <div
                  key={r.nome}
                  className="rounded-lg border overflow-hidden transition"
                  style={{
                    borderColor: open ? "rgba(177, 92, 67, 0.35)" : "var(--border)",
                    background: open ? "var(--bg-surface-2)" : "var(--bg-surface)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleReparto(i)}
                    className="w-full flex items-center gap-2 text-left px-2.5 py-2"
                    aria-expanded={open}
                  >
                    <span className="text-[12.5px] flex-1 min-w-0 leading-snug font-medium" style={{ color: "var(--text-primary)" }}>
                      {r.nome}
                    </span>
                    <span className="badge badge-off shrink-0">{r.comandi.length}</span>
                    <span className="shrink-0" style={{ color: "var(--text-faint)" }}>
                      {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </span>
                  </button>
                  {open && (
                    <div className="px-2 pb-2 space-y-1 border-t" style={{ borderColor: "var(--border)" }}>
                      {r.comandi.map((c) => (
                        <button
                          key={c.cmd}
                          type="button"
                          onClick={() => onScegli(c.cmd)}
                          className="w-full text-left rounded-lg border px-2.5 py-2 transition hover:border-brand/40"
                          style={{
                            background: c.evidenzia ? "var(--brand-soft)" : "var(--bg-elevated)",
                            borderColor: c.evidenzia ? "rgba(177, 92, 67, 0.3)" : "var(--border)",
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {c.evidenzia && <Sparkles size={11} className="text-brand shrink-0" />}
                            <code className="text-[12px] font-semibold text-brand">{c.cmd}</code>
                          </div>
                          <p className="t-eti mt-0.5 text-[11.5px] leading-relaxed">{c.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="t-eti text-[10.5px] leading-relaxed px-1 pt-1.5">
            Scrivimi come ti viene — posso imparare nuovi comandi e salvarli in <code className="text-brand">COMANDI.md</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
