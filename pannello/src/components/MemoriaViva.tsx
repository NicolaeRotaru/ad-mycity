"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ClipboardCheck,
  ListChecks,
  Gauge,
  Map as MapIcon,
  RefreshCw,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// --- Tipi (combaciano con le API /api/memoria/*) ---
type Azione = {
  numero: string;
  data: string;
  reparto: string;
  azione: string;
  colore: string;
  livello: "verde" | "giallo" | "rosso" | "?";
  contenuto: string;
  canale: string;
  stato: string;
  inAttesa: boolean;
};
type Attivita = {
  collegato: boolean;
  briefing: { nome: string; testo: string } | null;
  salaOperativa: string;
  decisioni: string;
};
type Piano = { nome: string; testo: string };

type Tab = "azioni" | "attivita" | "stato" | "piani";

// Rendering markdown compatto e leggibile (riusa i plugin già installati).
const md: Components = {
  h1: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5">{children}</h3>,
  h2: ({ children }) => <h4 className="text-[13px] font-semibold mt-3 mb-1">{children}</h4>,
  h3: ({ children }) => <h5 className="text-[13px] font-semibold mt-2 mb-1">{children}</h5>,
  p: ({ children }) => <p className="text-[13px] leading-relaxed text-ink/85 my-1.5">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-5 text-[13px] space-y-0.5 my-1.5">{children}</ol>,
  li: ({ children }) => <li className="text-ink/85">{children}</li>,
  a: ({ children }) => <span className="text-brand">{children}</span>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-black/10 bg-paper/60 px-2 py-1 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-black/10 px-2 py-1 align-top">{children}</td>,
  code: ({ children }) => <code className="text-[12px] bg-black/[0.05] rounded px-1 py-0.5">{children}</code>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-brand/30 pl-3 text-black/55 italic my-1.5">{children}</blockquote>,
};

function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={md}>
      {children}
    </ReactMarkdown>
  );
}

function dot(livello: Azione["livello"]) {
  const c = livello === "verde" ? "bg-green-500" : livello === "giallo" ? "bg-amber-500" : livello === "rosso" ? "bg-red-500" : "bg-black/30";
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />;
}

export default function MemoriaViva() {
  const [tab, setTab] = useState<Tab>("azioni");
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);

  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [attivita, setAttivita] = useState<Attivita | null>(null);
  const [stato, setStato] = useState("");
  const [piani, setPiani] = useState<Piano[]>([]);

  const [approvando, setApprovando] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ numero: string; ok: boolean; msg: string } | null>(null);

  const carica = useCallback(async () => {
    setLoading(true);
    try {
      const [a, at, st, pi] = await Promise.all([
        fetch("/api/memoria/azioni").then((r) => r.json()).catch(() => ({ collegato: false, azioni: [] })),
        fetch("/api/memoria/attivita").then((r) => r.json()).catch(() => ({ collegato: false })),
        fetch("/api/memoria/stato").then((r) => r.json()).catch(() => ({ collegato: false, testo: "" })),
        fetch("/api/memoria/piani").then((r) => r.json()).catch(() => ({ collegato: false, piani: [] })),
      ]);
      setAzioni(a.azioni || []);
      setAttivita(at && (at.briefing || at.salaOperativa || at.decisioni) ? at : at?.collegato ? at : null);
      setStato(st.testo || "");
      setPiani(pi.piani || []);
      setCollegato(Boolean(a.collegato || at?.collegato || st.collegato || pi.collegato));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica();
  }, [carica]);

  async function approva(az: Azione) {
    setApprovando(az.numero);
    setEsito(null);
    try {
      const res = await fetch("/api/approva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: az.numero, azione: az.azione }),
      });
      const d = await res.json();
      setEsito(
        d.ok
          ? { numero: az.numero, ok: true, msg: "Inviata al cervello: l'AD la eseguirà e segnerà FATTO." }
          : { numero: az.numero, ok: false, msg: d.error || "Errore." }
      );
    } catch (e: any) {
      setEsito({ numero: az.numero, ok: false, msg: e.message });
    } finally {
      setApprovando(null);
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "azioni", label: "Da approvare", icon: <ClipboardCheck size={14} /> },
    { id: "attivita", label: "Attività & briefing", icon: <ListChecks size={14} /> },
    { id: "stato", label: "Stato & numeri", icon: <Gauge size={14} /> },
    { id: "piani", label: "Piani", icon: <MapIcon size={14} /> },
  ];

  const daApprovare = azioni.filter((a) => a.inAttesa);

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Brain />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">La memoria viva dell'AD</span>
        <button
          onClick={carica}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Aggiorna
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tabs.map((t) => {
          const on = tab === t.id;
          const badge = t.id === "azioni" && daApprovare.length > 0 ? daApprovare.length : null;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
                on ? "bg-brand text-white shadow-card" : "bg-paper/60 text-black/60 hover:bg-black/[0.05]"
              }`}
            >
              {t.icon}
              {t.label}
              {badge != null && (
                <span className={`ml-0.5 text-[11px] px-1.5 rounded-full ${on ? "bg-white/25" : "bg-amber-100 text-amber-700"}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && azioni.length === 0 && !attivita && !stato && piani.length === 0 ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico la memoria…
        </div>
      ) : !collegato ? (
        <div className="text-center text-black/50 py-8 text-sm">
          <p className="mb-1">Memoria del vault non raggiungibile.</p>
          <p className="text-xs text-black/40">
            In locale parte da sola (monorepo). Online imposta le variabili <code className="bg-black/[0.05] px-1 rounded">OBSIDIAN_*</code> verso la repo <b>ad-mycity</b>.
          </p>
        </div>
      ) : (
        <>
          {/* --- DA APPROVARE --- */}
          {tab === "azioni" && (
            <div className="space-y-2.5">
              {azioni.length === 0 && <p className="text-sm text-black/45 py-4 text-center">Nessuna azione in coda.</p>}
              {azioni.map((a) => (
                <div
                  key={a.numero}
                  className={`rounded-xl border p-3.5 transition ${
                    a.inAttesa ? "border-black/[0.08] bg-paper/40" : "border-black/[0.05] bg-black/[0.015] opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-1.5 shrink-0">{dot(a.livello)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-black/40">#{a.numero}</span>
                        <span className="text-[11px] font-medium text-brand bg-brand-50 px-1.5 py-0.5 rounded">{a.reparto}</span>
                        <span className="text-[11px] text-black/40">{a.data}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${a.inAttesa ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                          {a.stato}
                        </span>
                      </div>
                      <p className="text-[13px] text-ink/90 mt-1.5 leading-snug">{a.azione}</p>
                      <p className="text-[11px] text-black/45 mt-1">
                        📎 {a.contenuto} · 📣 {a.canale}
                      </p>
                      {esito && esito.numero === a.numero && (
                        <p className={`text-[12px] mt-2 flex items-center gap-1.5 ${esito.ok ? "text-green-700" : "text-red-600"}`}>
                          {esito.ok && <CheckCircle2 size={13} />} {esito.msg}
                        </p>
                      )}
                    </div>
                    {a.inAttesa && (
                      <button
                        onClick={() => approva(a)}
                        disabled={approvando === a.numero}
                        className="shrink-0 inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3 py-1.5 rounded-lg shadow-card hover:bg-brand-dark active:scale-[0.98] transition disabled:opacity-50"
                      >
                        {approvando === a.numero ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Approva
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-black/40 pt-1">
                «Approva» manda l'ordine all'AD (coda lavori): parte davvero solo con il worker attivo e le chiavi delle “mani”.
              </p>
            </div>
          )}

          {/* --- ATTIVITÀ & BRIEFING --- */}
          {tab === "attivita" && attivita && (
            <div className="space-y-4">
              {attivita.briefing && (
                <details open className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">📋 Ultimo briefing · {attivita.briefing.nome}</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                    <Markdown>{attivita.briefing.testo}</Markdown>
                  </div>
                </details>
              )}
              {attivita.salaOperativa && (
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">🛰️ Sala Operativa (squadra)</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                    <Markdown>{attivita.salaOperativa}</Markdown>
                  </div>
                </details>
              )}
              {attivita.decisioni && (
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">🧾 Decisioni (storico)</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                    <Markdown>{attivita.decisioni}</Markdown>
                  </div>
                </details>
              )}
            </div>
          )}

          {/* --- STATO & NUMERI --- */}
          {tab === "stato" && (
            <div className="max-h-[28rem] overflow-y-auto pr-1">
              {stato ? <Markdown>{stato}</Markdown> : <p className="text-sm text-black/45 py-4 text-center">STATO.md non trovato.</p>}
            </div>
          )}

          {/* --- PIANI --- */}
          {tab === "piani" && (
            <div className="space-y-2.5">
              {piani.length === 0 && <p className="text-sm text-black/45 py-4 text-center">Nessun piano trovato in 06-Piani.</p>}
              {piani.map((p) => (
                <details key={p.nome} className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">🧩 {p.nome}</summary>
                  <div className="mt-2 max-h-96 overflow-y-auto pr-1">
                    <Markdown>{p.testo}</Markdown>
                  </div>
                </details>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// Icona "cervello" inline (per non aggiungere import non usati altrove).
function Brain() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    </svg>
  );
}
