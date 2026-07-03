"use client";

import { useEffect, useState } from "react";
import {
  Cpu, Activity, ShieldAlert, Wrench, Hammer, Swords, Sparkles, HelpCircle,
  Mail, TrendingUp, CheckCircle2, Eye, ArrowRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { dataVault } from "@/lib/format";
import { vaiArea, EVENTO_VAI, type DettaglioVai } from "@/lib/nav";
import ParlaCasella from "@/components/ParlaCasella";

// 🧠 CERVELLO — l'area dove Nicola vede la macchina pensare su sé stessa: salute, auto-analisi del lavoro,
// e la RADIOGRAFIA DI SÉ (la macchina analizza la propria architettura da cima a fondo).
// Legge /api/memoria/auto-radiografia. Spec: cervello/auto-radiografia.md.

type Finding = { titolo?: string; dove?: string; severita?: string; descrizione?: string; impatto?: string; causa_radice?: string; fix?: string; impatto_crescita?: string; genera?: string };
type Dimensione = { key?: string; voto?: number; stato?: string; sintesi?: string; findings?: Finding[] };
type Difetto = { id?: string; titolo?: string; dimensione?: string; gravita?: string; impatto_crescita?: string; causa_radice?: string; fix_proposto?: string; stato?: string; nato?: string; chiuso_il?: string; nota_fix?: string; nota?: string; verifica?: { tipo?: string; file?: string; pattern?: string }; chiuso_come?: string };
type PreMortem = { disastro?: string; probabilita?: string; come?: string; difesa_proposta?: string };
type Bench = { ambito?: string; come_fanno_i_migliori?: string; esempi?: { chi?: string; cosa?: string; link?: string }[]; nostro_divario?: string; obiettivo?: string; primo_passo?: string };
type Radiografia = {
  data?: string; tipo?: string; voto_salute_architettura?: number | string; trend?: string; sintesi?: string;
  dimensioni?: Dimensione[]; pre_mortem?: PreMortem[]; benchmark_vs_migliori?: Bench[];
  proposte_nuovi_pezzi?: { cosa?: string; perche?: string }[]; domande_per_nicola?: ({ domanda?: string; perche_serve?: string; se_rispondi?: string } | string)[];
  sonda?: { loop_chiude?: boolean; tasso_applicazione?: number; giro_a_cadenza?: boolean; sentinelle_scattano?: boolean; verdetto?: string };
  salute_marketplace?: { voto?: number; sintesi?: string };
  meta?: { agenti_totali?: number; bloccanti?: number };
};
type Cantiere = { difetti?: Difetto[]; meta?: { aperti?: number; in_corso?: number; chiusi?: number } };
type Storico = { serie?: { data?: string; voto_salute?: number; difetti_aperti?: number; difetti_chiusi?: number }[] };
type Dati = { collegato: boolean; messaggio?: string; radiografia?: Radiografia; cantiere?: Cantiere; storico?: Storico; watchlist?: any; lettera?: string };

type Tab = "dimensioni" | "cantiere" | "lettera" | "storico";

const GRAV: Record<string, { cls: string; dot: string; label: string }> = {
  bloccante: { cls: "border-red-200 bg-red-50/60", dot: "bg-red-500", label: "BLOCCANTE" },
  grave: { cls: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500", label: "GRAVE" },
  minore: { cls: "border-black/10 bg-paper/40", dot: "bg-black/30", label: "MINORE" },
};
const IMPATTO: Record<string, string> = { alto: "bg-red-100 text-red-700", medio: "bg-amber-100 text-amber-700", basso: "bg-black/5 text-black/50" };

function votoColore(v?: number) {
  if (v == null || !Number.isFinite(v)) return "text-black/40";
  if (v >= 80) return "text-green-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

export default function RadiografiaDiSe() {
  const [d, setD] = useState<Dati | null>(null);
  const [tab, setTab] = useState<Tab>("dimensioni");
  // 🔗 Azioni indicizzate per origine (origine → id azione): per il link "vai all'azione" sui difetti.
  const [azPerOrigine, setAzPerOrigine] = useState<Record<string, string>>({});

  useEffect(() => {
    const carica = () => {
      fetch("/api/memoria/auto-radiografia", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
      fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).then((x) => {
        const m: Record<string, string> = {};
        for (const a of x?.azioni || []) if (a?.origine && !a.stato) m[String(a.origine)] = String(a.id);
        setAzPerOrigine(m);
      }).catch(() => {});
    };
    carica();
    const id = setInterval(carica, 60000);
    return () => clearInterval(id);
  }, []);

  // Link bidirezionali: se si arriva al Cervello puntando la scheda "Cantiere", aprila.
  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "cervello" || !det.sub) return;
      const valide: Tab[] = ["dimensioni", "cantiere", "lettera", "storico"];
      if (valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

  const r = d?.radiografia;
  const votoS = Number(r?.voto_salute_architettura);
  const votoSOk = Number.isFinite(votoS);
  const sintesiR = r?.sintesi || (!votoSOk && typeof r?.voto_salute_architettura === "string" ? r!.voto_salute_architettura : "");
  const cantiere = d?.cantiere;
  const aperti = (cantiere?.difetti || []).filter((x) => x.stato !== "chiuso");
  const chiusi = (cantiere?.difetti || []).filter((x) => x.stato === "chiuso");
  const serie = d?.storico?.serie || [];
  const maxVoto = 100;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dimensioni", label: "Radiografia", icon: <Cpu size={15} />, badge: r?.dimensioni?.length || 0 },
    { id: "cantiere", label: "Cantiere difetti", icon: <Hammer size={15} />, badge: aperti.length },
    { id: "lettera", label: "Lettera", icon: <Mail size={15} /> },
    { id: "storico", label: "Andamento", icon: <TrendingUp size={15} /> },
  ];

  return (
    <section id="auto-radiografia" className="card p-4 border-brand/20 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Cpu size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">🩻 Radiografia di sé</span>
            <div className="t-eti">La macchina analizza la propria architettura da cima a fondo. {r?.data ? `· ${dataVault(r.data)}` : ""}</div>
          </div>
        </div>
        {votoSOk && (
          <div className="text-right shrink-0">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${votoColore(votoS)}`}>{votoS}<span className="text-[13px] text-black/30">/100</span></div>
            <div className="t-eti">salute {r?.trend || ""}</div>
          </div>
        )}
      </div>

      {!d?.collegato && <p className="t-eti py-6 text-center">{d?.messaggio || "Caricamento…"}</p>}

      {d?.collegato && (
        <>
          {sintesiR && <p className="t-corpo break-words mb-3">{sintesiR}</p>}

          {/* Sonda: i 4 invarianti del volano */}
          {r?.sonda && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { k: "Loop chiude", ok: !!r.sonda.loop_chiude },
                { k: `Lezioni applicate ${Math.round((r.sonda.tasso_applicazione || 0) * 100)}%`, ok: (r.sonda.tasso_applicazione || 0) >= 0.3 },
                { k: "Giro a cadenza", ok: !!r.sonda.giro_a_cadenza },
                { k: "Sentinelle attive", ok: !!r.sonda.sentinelle_scattano },
              ].map((s) => (
                <span key={s.k} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${s.ok ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                  <Activity size={11} /> {s.k}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded-lg transition ${tab === t.id ? "bg-brand text-white" : "bg-white text-black/60 ring-1 ring-black/[0.06] hover:bg-black/[0.03]"}`}>
                {t.icon}<span>{t.label}</span>
                {t.badge ? <span className={`text-[10px] px-1.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-black/10"}`}>{t.badge}</span> : null}
              </button>
            ))}
          </div>

          {/* === RADIOGRAFIA (dimensioni + pre-mortem + benchmark + proposte + domande) === */}
          {tab === "dimensioni" && (
            <div className="space-y-3">
              {(r?.dimensioni || []).map((dim, i) => (
                <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${dim.stato === "critico" ? "bg-red-500" : dim.stato === "attenzione" ? "bg-amber-500" : "bg-green-500"}`} />
                    <span className="text-[13px] font-medium">{dim.key}</span>
                    {dim.voto != null && <span className={`t-eti ml-auto tabular-nums ${votoColore(dim.voto)}`}>{dim.voto}/100</span>}
                  </div>
                  {dim.sintesi && <div className="text-[12px] text-black/65 mt-1">{dim.sintesi}</div>}
                  {(dim.findings || []).filter((f) => (f as Finding & { stato?: string }).stato !== "chiuso").map((f, j) => {
                    const g = GRAV[f.severita || "minore"] || GRAV.minore;
                    return (
                      <div key={j} className={`rounded-lg border p-2.5 mt-2 ${g.cls}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                          <span className="text-[10px] font-bold text-black/50">{g.label}</span>
                          {f.impatto_crescita && <span className={`text-[10px] px-1.5 rounded ${IMPATTO[f.impatto_crescita] || ""}`}>crescita {f.impatto_crescita}</span>}
                          {f.genera && f.genera !== "solo-report" && <span className="text-[10px] px-1.5 rounded bg-black/10 text-black/55 ml-auto">{f.genera}</span>}
                        </div>
                        <div className="text-[12.5px] font-medium mt-1">{f.titolo}</div>
                        {f.descrizione && <div className="text-[12px] text-black/65 mt-0.5">{f.descrizione}</div>}
                        {f.causa_radice && <div className="text-[12px] text-black/60 mt-1"><b>Causa radice:</b> {f.causa_radice}</div>}
                        {f.fix && <div className="text-[12px] text-black/60 mt-0.5"><b>Fix (🟡):</b> {f.fix}</div>}
                        {f.dove && <div className="t-eti mt-0.5 font-mono">{f.dove}</div>}
                      </div>
                    );
                  })}
                  <ParlaCasella titolo={`Dimensione: ${dim.key}`} contesto={dim.sintesi} />
                </div>
              ))}

              {(r?.pre_mortem || []).length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><ShieldAlert size={13} /> Pre-mortem — i disastri che prevengo prima</div>
                  <div className="space-y-2">
                    {r!.pre_mortem!.map((p, i) => (
                      <div key={i} className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                        <div className="text-[12.5px] font-medium">⚠️ {p.disastro} <span className="t-eti">· prob. {p.probabilita}</span></div>
                        {p.difesa_proposta && <div className="text-[12px] text-black/65 mt-0.5"><b>Difesa (🟡):</b> {p.difesa_proposta}</div>}
                        <ParlaCasella titolo={`Pre-mortem: ${p.disastro}`} contesto={[p.come, p.difesa_proposta && `Difesa: ${p.difesa_proposta}`].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(r?.benchmark_vs_migliori || []).length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Swords size={13} /> Vs i migliori (locali + mondo)</div>
                  <div className="space-y-2">
                    {r!.benchmark_vs_migliori!.map((b, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="flex items-center gap-2"><span className="text-[13px] font-medium">{b.ambito}</span>
                          {b.nostro_divario && <span className={`text-[10px] px-1.5 rounded ml-auto ${b.nostro_divario === "alto" ? "bg-red-100 text-red-700" : b.nostro_divario === "medio" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>divario {b.nostro_divario}</span>}
                        </div>
                        {b.come_fanno_i_migliori && <div className="text-[12px] text-black/65 mt-1">{b.come_fanno_i_migliori}</div>}
                        {b.obiettivo && <div className="text-[12px] text-black/70 mt-0.5"><b>Obiettivo:</b> {b.obiettivo}</div>}
                        {(b.esempi || []).map((e, j) => <div key={j} className="t-eti mt-0.5">↗ {e.chi}: {e.cosa}</div>)}
                        <ParlaCasella titolo={`Benchmark: ${b.ambito}`} contesto={[b.come_fanno_i_migliori, b.obiettivo && `Obiettivo: ${b.obiettivo}`].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(r?.proposte_nuovi_pezzi || []).length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Sparkles size={13} /> Pezzi nuovi di sé che propongo (🟡)</div>
                  <div className="space-y-1.5">
                    {r!.proposte_nuovi_pezzi!.map((p, i) => (
                      <div key={i} className="text-[12px] text-black/70 flex gap-1.5"><span className="text-brand">+</span><span><b>{p.cosa}</b> — {p.perche}</span></div>
                    ))}
                  </div>
                </div>
              )}

              {(r?.domande_per_nicola || []).length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><HelpCircle size={13} /> Domande per te</div>
                  {r!.domande_per_nicola!.map((q, i) => {
                    const testo = typeof q === "string" ? q : q?.domanda;
                    const perche = typeof q === "string" ? "" : q?.perche_serve;
                    return (
                      <div key={i} className="rounded-xl border border-brand/20 bg-brand-50/30 p-3 mb-2">
                        <div className="text-[13px] font-medium break-words">❓ {testo}</div>
                        {perche && <div className="text-[12px] text-black/65 mt-1"><b>Perché:</b> {perche}</div>}
                        <ParlaCasella titolo={`Domanda: ${(testo || "").slice(0, 60)}`} contesto={[testo, perche && `Perché: ${perche}`].filter(Boolean).join(" · ")} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Watchlist dei riferimenti: i "migliori" che la macchina tiene d'occhio (+ quelli aggiunti da Nicola) */}
              {(((d?.watchlist?.scoperti || []).length + (d?.watchlist?.aggiunti_da_nicola || []).length) > 0) && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Eye size={13} /> Riferimenti che tengo d'occhio (i migliori)</div>
                  <div className="space-y-1">
                    {(d!.watchlist.scoperti || []).map((w: any, i: number) => (
                      <div key={`s${i}`} className="text-[12px] text-black/70 flex gap-1.5"><span className="text-black/35">{w.mestiere ? `${w.mestiere}:` : "↗"}</span><span><b>{w.chi}</b>{w.perche ? ` — ${w.perche}` : ""}</span></div>
                    ))}
                    {(d!.watchlist.aggiunti_da_nicola || []).map((w: any, i: number) => (
                      <div key={`n${i}`} className="text-[12px] text-brand flex gap-1.5"><span>★</span><span><b>{w.chi}</b>{w.note ? ` — ${w.note}` : ""} <span className="t-eti">(scelto da te)</span></span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === CANTIERE === */}
          {tab === "cantiere" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200"><Wrench size={12} /> {aperti.length} aperti</span>
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-green-50 text-green-700 ring-1 ring-green-200"><CheckCircle2 size={12} /> {chiusi.length} chiusi</span>
              </div>
              {aperti.length === 0 && <p className="t-eti">Nessun difetto aperto. 👍</p>}
              {aperti.map((x, i) => {
                const g = GRAV[x.gravita || "minore"] || GRAV.minore;
                const azId = x.id ? azPerOrigine[`difetto:${x.id}`] : undefined;
                return (
                  <div id={x.id ? `difetto-${x.id}` : undefined} key={i} className={`rounded-xl border p-3 scroll-mt-24 ${g.cls}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                      <span className="text-[10px] font-bold text-black/50">{g.label}</span>
                      {x.impatto_crescita && <span className={`text-[10px] px-1.5 rounded ${IMPATTO[x.impatto_crescita] || ""}`}>crescita {x.impatto_crescita}</span>}
                      {x.stato === "in-corso" && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 ring-1 ring-blue-200" title="Il lavoro tecnico è fatto; resta un'azione umana per chiudere">
                          <Wrench size={10} /> fix fatto — attende Nicola
                        </span>
                      )}
                      <span className="t-eti ml-auto">{x.id}</span>
                    </div>
                    <div className="text-[12.5px] font-medium mt-1">{x.titolo}</div>
                    {x.causa_radice && <div className="text-[12px] text-black/60 mt-1"><b>Causa radice:</b> {x.causa_radice}</div>}
                    {x.fix_proposto && <div className="text-[12px] text-black/60 mt-0.5"><b>Fix (🟡):</b> {x.fix_proposto}</div>}
                    {x.nota_fix && <div className="text-[12px] mt-1 rounded-lg bg-blue-50/70 ring-1 ring-blue-100 px-2 py-1 text-blue-900/80"><b>🔧 Già fatto nel codice:</b> {x.nota_fix}</div>}
                    {x.verifica?.tipo === "umano" && x.stato === "in-corso" && <div className="text-[11px] text-black/45 mt-0.5">Chiusura riservata a Nicola (azione umana: revoca chiave, giudizio, firma).</div>}
                    {azId && (
                      <button onClick={() => vaiArea("azioni", `azione-${azId}`, "approvare")} className="mt-1.5 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                        <ArrowRight size={12} /> Vai all'azione collegata
                      </button>
                    )}
                    <ParlaCasella titolo={`Difetto: ${x.titolo}`} contesto={[x.causa_radice && `Causa radice: ${x.causa_radice}`, x.fix_proposto && `Fix: ${x.fix_proposto}`].filter(Boolean).join(" · ")} />
                  </div>
                );
              })}
              {chiusi.length > 0 && (
                <div className="pt-1">
                  <div className="t-micro mb-1.5">Chiusi</div>
                  {chiusi.map((x, i) => <div key={i} className="text-[12px] text-black/50 flex gap-1.5"><CheckCircle2 size={13} className="text-green-600 shrink-0" /><span className="line-through">{x.titolo}</span></div>)}
                </div>
              )}
            </div>
          )}

          {/* === LETTERA === */}
          {tab === "lettera" && (
            <div className="rounded-xl border border-black/[0.06] bg-paper/40 p-4 prose-sm max-w-none text-[13px] leading-relaxed [&_h1]:text-[16px] [&_h1]:font-bold [&_h1]:mb-2 [&_strong]:font-semibold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1">
              {d?.lettera ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{d.lettera}</ReactMarkdown> : <p className="t-eti">Nessuna lettera ancora. La macchina la scrive nella review settimanale.</p>}
            </div>
          )}

          {/* === STORICO / ANDAMENTO === */}
          {tab === "storico" && (
            <div className="space-y-3">
              <div className="t-eti">Voto di salute settimana su settimana — sto migliorando?</div>
              <div className="flex items-end gap-1.5 h-28">
                {serie.length === 0 && <p className="t-eti">Ancora un solo punto. La serie cresce a ogni radiografia.</p>}
                {serie.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <div className="w-full rounded-t bg-brand/70" style={{ height: `${Math.max(4, ((s.voto_salute || 0) / maxVoto) * 100)}%` }} title={`${s.voto_salute}/100`} />
                    <span className="text-[9px] text-black/40 truncate w-full text-center">{(s.data || "").slice(5)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {serie.slice().reverse().map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px]">
                    <span className="t-eti w-20">{s.data}</span>
                    <span className={`tabular-nums font-medium ${votoColore(s.voto_salute)}`}>{s.voto_salute}/100</span>
                    <span className="t-eti ml-auto">{s.difetti_aperti} aperti · {s.difetti_chiusi} chiusi</span>
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
