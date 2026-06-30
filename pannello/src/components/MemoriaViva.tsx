"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ListChecks,
  Gauge,
  Map as MapIcon,
  RefreshCw,
  Loader2,
  Target,
  ScrollText,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { dataVault } from "@/lib/format";
import Aggiornato from "@/components/Aggiornato";
import StellePolari from "@/components/StellePolari";
import ParlaCasella from "@/components/ParlaCasella";

// La MEMORIA: ciò che l'AD sa e ricorda. (Le cose DA FARE — Mosse di Nicola, Cose da fare,
// Sentinelle — vivono in ⚡ Azioni, l'hub delle decisioni.)
type Attivita = {
  collegato: boolean;
  vaultGithub?: boolean;
  ramo?: string;
  repo?: string | null;
  briefing: { nome: string; data?: string; testo: string } | null;
  salaOperativa: string;
  decisioni: string;
};
type Piano = { nome: string; testo: string };
type Okr = { senior: string; kpi: string; target: string; budget: string };
type Decisione = { data: string; colore: string; livello: "verde" | "giallo" | "rosso" | "?"; reparto: string; cosa: string; perche: string; stato: string; firma: string };

type Tab = "attivita" | "decisioni" | "okr" | "stato" | "piani";

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

function dot(livello: "verde" | "giallo" | "rosso" | "?") {
  const c = livello === "verde" ? "bg-green-500" : livello === "giallo" ? "bg-amber-500" : livello === "rosso" ? "bg-red-500" : "bg-black/30";
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} />;
}


export default function MemoriaViva() {
  const [tab, setTab] = useState<Tab>("attivita");
  const [loading, setLoading] = useState(true);
  const [collegato, setCollegato] = useState(false);

  const [attivita, setAttivita] = useState<Attivita | null>(null);
  const [stato, setStato] = useState("");
  const [statoAgg, setStatoAgg] = useState("");
  const [aggAt, setAggAt] = useState<number | null>(null);
  const [piani, setPiani] = useState<Piano[]>([]);
  const [okr, setOkr] = useState<{ northStar: string; righe: Okr[] }>({ northStar: "", righe: [] });
  const [decisioni, setDecisioni] = useState<Decisione[]>([]);
  const [ramoVault, setRamoVault] = useState<string | null>(null);

  const carica = useCallback(async (silenzioso = false) => {
    if (!silenzioso) setLoading(true);
    try {
      const [at, st, pi, de, ok] = await Promise.all([
        fetch("/api/memoria/attivita", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false })),
        fetch("/api/memoria/stato", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, testo: "" })),
        fetch("/api/memoria/piani", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, piani: [] })),
        fetch("/api/memoria/decisioni", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, decisioni: [] })),
        fetch("/api/memoria/okr", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ collegato: false, righe: [] })),
      ]);
      setAttivita(at && (at.briefing || at.salaOperativa || at.decisioni) ? at : at?.collegato ? at : null);
      setRamoVault(at?.ramo || null);
      setStato(st.testo || "");
      setStatoAgg(st.aggiornato || "");
      setPiani(pi.piani || []);
      setDecisioni(de.decisioni || []);
      setOkr({ northStar: ok.northStar || "", righe: ok.righe || [] });
      setCollegato(Boolean(at?.collegato || st.collegato || pi.collegato || de.collegato || ok.collegato));
      setAggAt(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica();
    // Aggiornamento di sfondo (senza spinner): il vault cambia mentre la tab resta aperta.
    const id = setInterval(() => carica(true), 90000);
    return () => clearInterval(id);
  }, [carica]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "attivita", label: "Attività & briefing", icon: <ListChecks size={14} /> },
    { id: "decisioni", label: "Decisioni", icon: <ScrollText size={14} /> },
    { id: "okr", label: "OKR & pagella", icon: <Target size={14} /> },
    { id: "stato", label: "Stato & numeri", icon: <Gauge size={14} /> },
    { id: "piani", label: "Piani", icon: <MapIcon size={14} /> },
  ];

  return (
    <section className="card p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="grid place-items-center w-8 h-8 rounded-lg bg-brand-50 text-brand shrink-0">
          <Brain />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">La memoria viva dell'AD</span>
        {ramoVault && collegato && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand border border-brand/15" title="Il Pannello legge questo ramo su GitHub — non serve merge su main">
            ramo {ramoVault}
          </span>
        )}
        <Aggiornato at={aggAt} className="ml-auto" />
        <button
          onClick={() => carica()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs text-black/55 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] transition disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Aggiorna
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tabs.map((t) => {
          const on = tab === t.id;
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
            </button>
          );
        })}
      </div>

      {loading && !attivita && !stato && piani.length === 0 ? (
        <div className="text-center text-black/45 py-8 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Carico la memoria…
        </div>
      ) : !collegato ? (
        <div className="text-center text-black/50 py-8 text-sm max-w-lg mx-auto">
          <p className="mb-2 font-medium text-ink/80">Memoria del vault non raggiungibile.</p>
          <p className="text-xs text-black/45 leading-relaxed">
            Il giro salva su GitHub nel ramo <b>memoria-ad</b>. Il Pannello lo legge <b>direttamente</b> da lì
            (variabili <code className="bg-black/[0.05] px-1 rounded">OBSIDIAN_*</code>) — <b>non devi mergiare su main</b> per
            vedere briefing, STATO e azioni.
          </p>
          <p className="text-xs text-black/40 mt-2">
            Online: <code className="bg-black/[0.05] px-1 rounded">OBSIDIAN_BRANCH=memoria-ad</code> su Vercel.
            Se è <code className="bg-black/[0.05] px-1 rounded">main</code>, vedi dati vecchi anche con giro fresco.
          </p>
        </div>
      ) : (
        <>
          {/* --- ATTIVITÀ & BRIEFING --- */}
          {tab === "attivita" && attivita && (
            <div className="space-y-4">
              {attivita.briefing && (
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">📋 Ultimo briefing · {dataVault(attivita.briefing.data || attivita.briefing.nome)}</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                    <Markdown>{attivita.briefing.testo}</Markdown>
                  </div>
                  <ParlaCasella titolo="Ultimo briefing" contesto={(attivita.briefing.testo || "").slice(0, 800)} />
                </details>
              )}
              {attivita.salaOperativa && (
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">🛰️ Sala Operativa (squadra)</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                    <Markdown>{attivita.salaOperativa}</Markdown>
                  </div>
                  <ParlaCasella titolo="Sala Operativa (squadra)" contesto={(attivita.salaOperativa || "").slice(0, 800)} />
                </details>
              )}
              {attivita.decisioni && (
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">🧾 Decisioni (storico)</summary>
                  <div className="mt-2 max-h-80 overflow-y-auto pr-1">
                    <Markdown>{attivita.decisioni}</Markdown>
                  </div>
                  <ParlaCasella titolo="Decisioni (storico)" contesto={(attivita.decisioni || "").slice(0, 800)} />
                </details>
              )}
            </div>
          )}

          {/* --- STATO & NUMERI --- */}
          {tab === "stato" && (
            <div className="max-h-[28rem] overflow-y-auto pr-1">
              {stato ? (
                <>
                  {statoAgg && <p className="text-[11px] text-black/45 mb-2">🕗 Aggiornato · {dataVault(statoAgg)}</p>}
                  <Markdown>{stato}</Markdown>
                </>
              ) : <p className="text-sm text-black/45 py-4 text-center">STATO.md non trovato.</p>}
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
                  <ParlaCasella titolo={`Piano: ${p.nome}`} contesto={(p.testo || "").slice(0, 800)} />
                </details>
              ))}
            </div>
          )}

          {/* --- DECISIONI RECENTI --- */}
          {tab === "decisioni" && (
            <div className="space-y-2">
              {decisioni.length === 0 && <p className="text-sm text-black/55 py-4 text-center">Nessuna decisione registrata.</p>}
              {decisioni.slice(0, 40).map((d, i) => (
                <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
                  <div className="flex items-center gap-2 text-[11px] text-black/50 mb-1">
                    <span className="shrink-0">{dot(d.livello)}</span>
                    <span className="font-mono">{dataVault(d.data)}</span>
                    {d.reparto && <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand font-medium">{d.reparto}</span>}
                    {d.stato && <span className="ml-auto shrink-0">{d.stato}</span>}
                  </div>
                  <div className="text-[13px] text-ink/90">{d.cosa}</div>
                  {d.perche && <div className="text-[12px] text-black/55 mt-0.5">{d.perche}</div>}
                  <ParlaCasella titolo={`Decisione: ${(d.cosa || "").slice(0, 50)}`} contesto={[d.cosa, d.perche, d.reparto && `Reparto: ${d.reparto}`].filter(Boolean).join(" · ")} />
                </div>
              ))}
            </div>
          )}

          {/* --- OKR / PAGELLA SQUADRA --- */}
          {tab === "okr" && (
            <div className="space-y-3">
              {/* ⭐ Le 3 Stelle Polari con interruttore on/off */}
              <StellePolari />
              {okr.northStar && (
                <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 text-[13px] text-ink/90">🌟 {okr.northStar}</div>
              )}
              {okr.righe.length === 0 && <p className="text-sm text-black/55 py-4 text-center">OKR non disponibili.</p>}
              <div className="space-y-1.5">
                {okr.righe.map((r, i) => (
                  <div key={i} className="rounded-xl border border-black/[0.07] bg-paper/40 p-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium text-ink/90">{r.senior}</span>
                      <span className="t-eti shrink-0">{r.budget}</span>
                    </div>
                    <div className="text-[12px] text-black/60">{r.kpi}</div>
                    <div className="text-[12px] text-ink/80 mt-0.5">🎯 {r.target}</div>
                    <ParlaCasella titolo={`OKR: ${r.senior}`} contesto={[r.kpi && `KPI: ${r.kpi}`, r.target && `Target: ${r.target}`, r.budget && `Budget: ${r.budget}`].filter(Boolean).join(" · ")} />
                  </div>
                ))}
              </div>
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
