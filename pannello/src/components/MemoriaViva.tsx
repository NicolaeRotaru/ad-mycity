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
  XCircle,
  ListTodo,
  ShieldAlert,
  Target,
  ScrollText,
  AlertTriangle,
} from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { testoPulito, dataVault } from "@/lib/format";

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
  briefing: { nome: string; data?: string; testo: string } | null;
  salaOperativa: string;
  decisioni: string;
};
type Piano = { nome: string; testo: string };
type TodoItem = { id: string; testo: string; livello: "verde" | "giallo" | "rosso" | "?"; sezione: string; fatto: boolean };
type Okr = { senior: string; kpi: string; target: string; budget: string };
type Decisione = { data: string; colore: string; livello: "verde" | "giallo" | "rosso" | "?"; reparto: string; cosa: string; perche: string; stato: string; firma: string };
type Alert = { livello: "rosso" | "giallo"; titolo: string; perche: string; cosaFare: string };

type Tab = "azioni" | "todo" | "sentinelle" | "attivita" | "decisioni" | "okr" | "stato" | "piani";

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
  const [statoAgg, setStatoAgg] = useState("");
  const [piani, setPiani] = useState<Piano[]>([]);
  const [todo, setTodo] = useState<TodoItem[]>([]);
  const [todoSalva, setTodoSalva] = useState(false);
  const [okr, setOkr] = useState<{ northStar: string; righe: Okr[] }>({ northStar: "", righe: [] });
  const [decisioni, setDecisioni] = useState<Decisione[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [approvando, setApprovando] = useState<string | null>(null);
  const [esito, setEsito] = useState<{ numero: string; ok: boolean; msg: string } | null>(null);

  const carica = useCallback(async () => {
    setLoading(true);
    try {
      const [a, at, st, pi, td, al, de, ok] = await Promise.all([
        fetch("/api/memoria/azioni").then((r) => r.json()).catch(() => ({ collegato: false, azioni: [] })),
        fetch("/api/memoria/attivita").then((r) => r.json()).catch(() => ({ collegato: false })),
        fetch("/api/memoria/stato").then((r) => r.json()).catch(() => ({ collegato: false, testo: "" })),
        fetch("/api/memoria/piani").then((r) => r.json()).catch(() => ({ collegato: false, piani: [] })),
        fetch("/api/memoria/todo").then((r) => r.json()).catch(() => ({ collegato: false, items: [] })),
        fetch("/api/alert").then((r) => r.json()).catch(() => ({ collegato: false, alert: [] })),
        fetch("/api/memoria/decisioni").then((r) => r.json()).catch(() => ({ collegato: false, decisioni: [] })),
        fetch("/api/memoria/okr").then((r) => r.json()).catch(() => ({ collegato: false, righe: [] })),
      ]);
      setAzioni(a.azioni || []);
      setAttivita(at && (at.briefing || at.salaOperativa || at.decisioni) ? at : at?.collegato ? at : null);
      setStato(st.testo || "");
      setStatoAgg(st.aggiornato || "");
      setPiani(pi.piani || []);
      setTodo(td.items || []);
      setTodoSalva(Boolean(td.salvataggio));
      setAlerts(al.alert || []);
      setDecisioni(de.decisioni || []);
      setOkr({ northStar: ok.northStar || "", righe: ok.righe || [] });
      setCollegato(Boolean(a.collegato || at?.collegato || st.collegato || pi.collegato || td.collegato || al.collegato || de.collegato || ok.collegato));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carica();
  }, [carica]);

  async function decidi(az: Azione, decisione: "approva" | "rifiuta") {
    setApprovando(az.numero);
    setEsito(null);
    try {
      const res = await fetch("/api/approva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero: az.numero, azione: az.azione, decisione }),
      });
      const d = await res.json();
      const okMsg = decisione === "rifiuta"
        ? "Rifiutata: l'AD la segnerà come ❌ RIFIUTATA."
        : "Inviata al cervello: l'AD la eseguirà e segnerà FATTO.";
      setEsito(
        d.ok
          ? { numero: az.numero, ok: true, msg: okMsg }
          : { numero: az.numero, ok: false, msg: d.error || "Errore." }
      );
    } catch (e: any) {
      setEsito({ numero: az.numero, ok: false, msg: e.message });
    } finally {
      setApprovando(null);
    }
  }

  // Spunta una voce della checklist: aggiorna subito a schermo e salva (Supabase).
  async function spunta(item: TodoItem) {
    const nuovo = !item.fatto;
    setTodo((list) => list.map((t) => (t.id === item.id ? { ...t, fatto: nuovo } : t)));
    try {
      await fetch("/api/memoria/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, fatto: nuovo }),
      });
    } catch {
      /* se fallisce, alla prossima ricarica torna lo stato del server */
    }
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "azioni", label: "Da approvare", icon: <ClipboardCheck size={14} /> },
    { id: "todo", label: "Cose da fare", icon: <ListTodo size={14} /> },
    { id: "sentinelle", label: "Sentinelle", icon: <ShieldAlert size={14} /> },
    { id: "decisioni", label: "Decisioni", icon: <ScrollText size={14} /> },
    { id: "okr", label: "OKR & pagella", icon: <Target size={14} /> },
    { id: "attivita", label: "Attività & briefing", icon: <ListChecks size={14} /> },
    { id: "stato", label: "Stato & numeri", icon: <Gauge size={14} /> },
    { id: "piani", label: "Piani", icon: <MapIcon size={14} /> },
  ];

  const daApprovare = azioni.filter((a) => a.inAttesa);
  const daFare = todo.filter((t) => !t.fatto);

  return (
    <section className="bg-white rounded-2xl border border-black/[0.06] shadow-card p-4">
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
          const badge =
            t.id === "azioni" && daApprovare.length > 0
              ? daApprovare.length
              : t.id === "todo" && daFare.length > 0
              ? daFare.length
              : t.id === "sentinelle" && alerts.length > 0
              ? alerts.length
              : null;
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
                        <span className="text-[11px] text-black/40">{dataVault(a.data)}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${a.inAttesa ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                          {a.stato}
                        </span>
                      </div>
                      <p className="text-[13px] text-ink/90 mt-1.5 leading-snug">{testoPulito(a.azione)}</p>
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
                      <div className="shrink-0 flex flex-col gap-1.5">
                        <button
                          onClick={() => decidi(a, "approva")}
                          disabled={approvando === a.numero}
                          className="inline-flex items-center justify-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3 py-1.5 rounded-lg shadow-card hover:bg-brand-dark active:scale-[0.98] transition disabled:opacity-50"
                        >
                          {approvando === a.numero ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approva
                        </button>
                        <button
                          onClick={() => decidi(a, "rifiuta")}
                          disabled={approvando === a.numero}
                          className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg border border-black/10 text-black/60 hover:bg-black/[0.04] active:scale-[0.98] transition disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Rifiuta
                        </button>
                      </div>
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
                <details className="rounded-xl border border-black/[0.07] bg-paper/30 p-3.5">
                  <summary className="text-[13px] font-semibold cursor-pointer">📋 Ultimo briefing · {dataVault(attivita.briefing.data || attivita.briefing.nome)}</summary>
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
                </details>
              ))}
            </div>
          )}

          {/* --- COSE DA FARE (checklist spuntabile) --- */}
          {tab === "todo" && (
            <div className="space-y-3">
              {!todoSalva && todo.length > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                  ⚠️ Le spunte non si salvano ancora: collega la memoria (tabella «impostazioni») e resteranno anche dopo il refresh e su ogni dispositivo.
                </p>
              )}
              {todo.length === 0 && (
                <p className="text-sm text-black/55 py-4 text-center">Nessuna cosa da fare. L'AD scrive l'elenco in CHECKLIST-NICOLA.md.</p>
              )}
              {Array.from(new Set(todo.map((t) => t.sezione))).map((sez) => (
                <div key={sez || "_"}>
                  {sez && <div className="t-micro mb-1.5">{sez}</div>}
                  <div className="space-y-1.5">
                    {todo
                      .filter((t) => t.sezione === sez)
                      .map((item) => {
                        const c =
                          item.livello === "rosso"
                            ? "border-red-200 bg-red-50/60"
                            : item.livello === "giallo"
                            ? "border-amber-200 bg-amber-50/60"
                            : "border-green-200 bg-green-50/50";
                        return (
                          <button
                            key={item.id}
                            onClick={() => spunta(item)}
                            className={`w-full text-left flex items-start gap-2.5 rounded-xl border p-2.5 transition active:scale-[0.99] ${
                              item.fatto ? "border-black/[0.06] bg-black/[0.02] opacity-60" : c
                            }`}
                          >
                            <span
                              className={`mt-0.5 grid place-items-center w-5 h-5 rounded-md border shrink-0 ${
                                item.fatto ? "bg-brand border-brand text-white" : "border-black/25 bg-white"
                              }`}
                            >
                              {item.fatto && <CheckCircle2 size={13} />}
                            </span>
                            <span className={`text-[13px] leading-snug ${item.fatto ? "line-through text-black/45" : "text-ink/90"}`}>
                              {testoPulito(item.testo)}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
              {todo.length > 0 && (
                <p className="t-eti pt-1">
                  {daFare.length} da fare · {todo.length - daFare.length} fatte. Tocca una voce per spuntarla.
                </p>
              )}
            </div>
          )}

          {/* --- SENTINELLE / ALLARMI --- */}
          {tab === "sentinelle" && (
            <div className="space-y-2">
              {alerts.length === 0 && (
                <p className="text-sm text-black/55 py-4 text-center">Nessun allarme attivo: tutto sotto controllo. (Soglie sui dati reali del marketplace.)</p>
              )}
              {alerts.map((al, i) => {
                const rosso = al.livello === "rosso";
                return (
                  <div key={i} className={`rounded-xl border p-3 ${rosso ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60"}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${rosso ? "text-red-600" : "text-amber-600"}`} />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-ink/90">{al.titolo}</div>
                        <div className="text-[12px] text-black/60 mt-0.5">{al.perche}</div>
                        <div className="text-[12px] text-ink/80 mt-1">→ {al.cosaFare}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                </div>
              ))}
            </div>
          )}

          {/* --- OKR / PAGELLA SQUADRA --- */}
          {tab === "okr" && (
            <div className="space-y-2">
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
