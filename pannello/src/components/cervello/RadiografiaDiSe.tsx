"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Cpu, Activity, ShieldAlert, Wrench, Hammer, Swords, Sparkles, HelpCircle,
  TrendingUp, CheckCircle2, Eye, ArrowRight,
} from "lucide-react";
import { dataVault } from "@/lib/format";
import { vaiArea, EVENTO_VAI, type DettaglioVai } from "@/lib/nav";
import ParlaCasella from "@/components/ParlaCasella";
import SchedaProblema from "@/components/cervello/SchedaProblema";
import { usePanelSync } from "@/lib/panel-sync";
import { dimensioneLeggibile, humanizzaDifetto } from "@/lib/radiografia-umana";

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
type Dati = { collegato: boolean; messaggio?: string; live?: Live; radiografia?: Radiografia; cantiere?: Cantiere; storico?: Storico; watchlist?: any; lettera?: string };
type Live = {
  voto?: number | null; fonte_voto?: string; data_sonda?: string | null; data_scan?: string | null;
  cantiere_aggiornato?: string | null; aperti?: number; in_corso?: number; chiusi?: number;
  da_fare?: number; findings_aperti?: number | null; findings_in_corso?: number | null;
  sync_aggiornato?: string | null;
  scan_ore_fa?: number | null; sonda_ore_fa?: number | null; scan_stale?: boolean;
};

const POLL_MS = 30_000; // quasi live: rilegge GitHub ogni 30s (prima 60s)

type Tab = "dimensioni" | "cantiere" | "storico";

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

// Un «trend» sano è un token breve. Il giro a volte ci scrive una frase intera: nel blocco shrink-0
// a destra del titolo quella frase non si stringe → schiaccia il titolo a 1 carattere per riga
// (testo verticale) e sfonda la card. L'API già lo sanifica; questo è il paracadute UI. (fix verticale)
function trendBreve(v: unknown): string {
  const t = String(v ?? "").trim();
  return t.length > 0 && t.length <= 24 && !/[.:;—]/.test(t) ? t : "";
}

export default function RadiografiaDiSe() {
  const [d, setD] = useState<Dati | null>(null);
  const [tab, setTab] = useState<Tab>("cantiere");
  // 🔗 Azioni indicizzate per origine (origine → id azione): per il link "vai all'azione" sui difetti.
  const [azPerOrigine, setAzPerOrigine] = useState<Record<string, string>>({});

  const carica = useCallback(() => {
    fetch("/api/memoria/auto-radiografia", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
    fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).then((x) => {
      const m: Record<string, string> = {};
      for (const a of x?.azioni || []) if (a?.origine && !a.stato) m[String(a.origine)] = String(a.id);
      setAzPerOrigine(m);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(carica, POLL_MS);
    return () => clearInterval(id);
  }, [carica]);

  // Rete sync: fix firmato / difetto chiuso → aggiorna subito cantiere + link azioni.
  usePanelSync(["radiografia", "azioni", "memoria", "all"], carica);

  // Link bidirezionali: se si arriva al Cervello puntando la scheda "Cantiere", aprila.
  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "cervello" || !det.sub) return;
      const valide: Tab[] = ["dimensioni", "cantiere", "storico"];
      if (valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

  const r = d?.radiografia;
  const live = d?.live;
  const votoS = Number(live?.voto ?? r?.voto_salute_architettura);
  const votoSOk = Number.isFinite(votoS);
  const sintesiR = r?.sintesi || (!votoSOk && typeof r?.voto_salute_architettura === "string" ? r!.voto_salute_architettura : "");
  const cantiere = d?.cantiere;
  const aperti = (cantiere?.difetti || []).filter((x) => x.stato !== "chiuso");
  const chiusi = (cantiere?.difetti || []).filter((x) => x.stato === "chiuso");
  const serie = d?.storico?.serie || [];
  // 📈 Andamento LEGGIBILE: lo storico grezzo ha più radiografie nello stesso giorno →
  // qui si tiene UNA voce per giorno (l'ultima) e si mostrano al massimo le ultime 3 settimane.
  // Prima il grafico era rotto due volte: barre con height in % dentro una colonna senza
  // altezza definita (= sempre 0px, grafico vuoto) e 60+ colonne con etichette strizzate a «0.».
  const perGiorno = new Map<string, (typeof serie)[number]>();
  for (const s of serie) {
    const giorno = String(s?.data || "").slice(0, 10);
    if (giorno) perGiorno.set(giorno, { ...s, data: giorno }); // la successiva sovrascrive: resta l'ultima del giorno
  }
  const serieGiorni = [...perGiorno.values()].sort((a, b) => String(a.data).localeCompare(String(b.data))).slice(-21);
  const BARRA_MAX_PX = 96; // il grafico è alto h-28 (112px): 96px di barra + etichetta data

  const daFare = live?.da_fare ?? aperti.length;
  const findingsAperti = live?.findings_aperti;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "cantiere", label: "Da fare ora", icon: <Hammer size={15} />, badge: daFare || undefined },
    { id: "dimensioni", label: "Archivio audit (foto storica)", icon: <Cpu size={15} />, badge: findingsAperti ?? undefined },
    { id: "storico", label: "Andamento", icon: <TrendingUp size={15} /> },
  ];

  const primoAperto = aperti[0];
  const azioneOrigine = primoAperto ? azPerOrigine[String(primoAperto.id || primoAperto.titolo || "")] : undefined;
  const semaforoCart = daFare > 0 ? "🟡" : votoSOk && votoS >= 80 ? "🟢" : "🟡";

  return (
    <section id="auto-radiografia" className="card p-4 border-brand/20 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Cpu size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">🩻 Radiografia macchina</span>
            <div className="t-eti">La macchina analizza la propria architettura da cima a fondo.
              {live?.cantiere_aggiornato ? ` · cantiere ${dataVault(live.cantiere_aggiornato)}` : r?.data ? ` · scan ${dataVault(r.data)}` : ""}
            </div>
          </div>
        </div>
        {votoSOk && (
          <div className="text-right shrink-0 max-w-[42%]">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${votoColore(votoS)}`}>{votoS}<span className="text-[13px] text-black/30">/100</span></div>
            <div className="t-eti truncate">
              {daFare > 0 ? `${daFare} da fare · ` : "ok · "}
              salute {trendBreve(r?.trend)}{live?.fonte_voto === "sonda" ? " · live" : ""}
            </div>
          </div>
        )}
      </div>

      {!d?.collegato && <p className="t-eti py-6 text-center">{d?.messaggio || "Caricamento…"}</p>}

      {d?.collegato && (
        <>
          {/* Cartolina: semaforo + un passo + data referto */}
          <div className="rounded-xl border border-brand/25 bg-brand-50/40 px-3 py-2.5 mb-3">
            <p className="t-corpo text-[13px] font-semibold">
              {semaforoCart} {daFare > 0 ? `${daFare} da fare ora` : "Nessun difetto aperto nel cantiere"}
              {votoSOk ? ` · salute ${votoS}/100` : ""}
            </p>
            {primoAperto?.titolo && (
              <p className="t-eti mt-1 line-clamp-2">Prossimo: {primoAperto.titolo}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {azioneOrigine && (
                <button type="button" onClick={() => vaiArea("azioni", azioneOrigine, "approvare")} className="text-[12px] font-medium text-brand hover:underline inline-flex items-center gap-1">
                  Vai a firmare <ArrowRight size={12} />
                </button>
              )}
              <button type="button" onClick={() => vaiArea("plancia")} className="text-[12px] t-eti hover:text-brand">
                Lettera completa → in Home
              </button>
            </div>
            <p className="t-micro mt-1.5 normal-case">
              Referto scan {live?.data_scan ? dataVault(live.data_scan) : r?.data ? dataVault(r.data) : "—"}
              {live?.cantiere_aggiornato ? ` · cantiere aggiornato ${dataVault(live.cantiere_aggiornato)}` : ""}
            </p>
          </div>

          {sintesiR && <p className="t-corpo break-words mb-3">{sintesiR}</p>}

          {/* La lista «Radiografia» è la foto dell'audit; il cantiere è il backlog vivo che si aggiorna coi fix. */}
          {live && (live.scan_stale || (findingsAperti != null && daFare < findingsAperti)) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 mb-3 text-[12px] text-amber-900/90">
              <b>Archivio audit</b>
              {live.data_scan ? ` del ${dataVault(live.data_scan)}` : ""}
              {live.scan_ore_fa != null ? ` (${live.scan_ore_fa}h fa)` : ""}
              {findingsAperti != null ? ` · ${findingsAperti} voci nello scan` : ""}.
              {" "}I fix aggiornano <button type="button" onClick={() => setTab("cantiere")} className="underline font-medium hover:text-brand">Da fare ora</button>
              {live.chiusi != null ? ` (${live.chiusi} chiusi` : ""}
              {live.in_corso ? `, ${live.in_corso} in corso` : ""}
              {live.aperti ? `, ${live.aperti} aperti` : ""}
              {live.chiusi != null ? ")" : ""}.
              {live.sync_aggiornato ? ` Sync ${dataVault(live.sync_aggiornato)}.` : ""}
            </div>
          )}

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
              {/* Difesa: se il file radiografia c'è ma non è parsabile (troncato in lettura, era il
                  bug del cap a 200k) la sezione restava MUTA e vuota → disorientante. Ora lo dice. */}
              {!(r?.dimensioni?.length) && !(r?.pre_mortem?.length) && !(r?.benchmark_vs_migliori?.length) && (
                <p className="t-eti py-4 text-center">
                  La radiografia non è caricabile in questo momento (file troppo grande in lettura, oppure non ancora rigenerata dopo l&apos;ultima analisi). Le dimensioni ricompaiono al prossimo aggiornamento.
                </p>
              )}
              {(r?.dimensioni || []).map((dim, i) => (
                <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${dim.stato === "critico" ? "bg-red-500" : dim.stato === "attenzione" ? "bg-amber-500" : "bg-green-500"}`} />
                    <span className="text-[13px] font-medium">{dimensioneLeggibile(dim.key || "")}</span>
                    {dim.key && dimensioneLeggibile(dim.key) !== dim.key && (
                      <span className="text-[10px] text-black/35">{dim.key}</span>
                    )}
                    {dim.voto != null && <span className={`t-eti ml-auto tabular-nums ${votoColore(dim.voto)}`}>{dim.voto}/100</span>}
                  </div>
                  {dim.sintesi && <div className="text-[12px] text-black/65 mt-1">{dim.sintesi}</div>}
                  {(dim.findings || []).filter((f) => (f as Finding & { stato?: string }).stato !== "chiuso").map((f, j) => {
                    const g = GRAV[f.severita || "minore"] || GRAV.minore;
                    return (
                      <SchedaProblema
                        key={j}
                        gravitaCls={g.cls}
                        gravitaDot={g.dot}
                        gravitaLabel={g.label}
                        titolo={f.titolo}
                        descrizione={f.descrizione}
                        impatto={f.impatto}
                        causa_radice={f.causa_radice}
                        fix={f.fix}
                        dove={f.dove}
                        impatto_crescita={f.impatto_crescita}
                        genera={f.genera}
                        parlaTitolo={`Problema: ${(f.titolo || "").slice(0, 60)}`}
                        parlaContesto={[
                          dim.key && `Area: ${dimensioneLeggibile(dim.key)}`,
                          f.descrizione,
                          f.causa_radice && `Causa radice: ${f.causa_radice}`,
                          f.fix && `Fix proposto: ${f.fix}`,
                          f.dove && `Dove: ${f.dove}`,
                        ].filter(Boolean).join(" · ")}
                      />
                    );
                  })}
                  <ParlaCasella titolo={`Area: ${dimensioneLeggibile(dim.key || "")}`} contesto={dim.sintesi} />
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
                const umano = humanizzaDifetto(x);
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
                    <div className="text-[12.5px] font-medium mt-1">{umano.titolo}</div>
                    {umano.cosaSuccede && umano.cosaSuccede !== umano.titolo && (
                      <div className="text-[12px] text-black/70 mt-0.5">{umano.cosaSuccede}</div>
                    )}
                    {umano.perche && (
                      <div className="text-[12px] text-black/65 mt-1"><b>Perché succede:</b> {umano.perche}</div>
                    )}
                    {umano.cosaFare && (
                      <div className="text-[12px] text-black/65 mt-0.5"><b>Cosa fare:</b> {umano.cosaFare}</div>
                    )}
                    {x.nota_fix && <div className="text-[12px] mt-1 rounded-lg bg-blue-50/70 ring-1 ring-blue-100 px-2 py-1 text-blue-900/80"><b>Già fatto nel codice:</b> {x.nota_fix}</div>}
                    {x.verifica?.tipo === "umano" && x.stato === "in-corso" && <div className="text-[11px] text-black/45 mt-0.5">Chiusura riservata a Nicola (azione umana: revoca chiave, giudizio, firma).</div>}
                    {umano.tecnici && (
                      <details className="mt-2 group">
                        <summary className="text-[11px] font-medium text-black/45 cursor-pointer select-none hover:text-brand list-none flex items-center gap-1">
                          <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Dettagli tecnici
                        </summary>
                        <div className="text-[11px] text-black/50 mt-1.5 whitespace-pre-wrap break-words font-mono leading-relaxed">{umano.tecnici}</div>
                      </details>
                    )}
                    {azId && (
                      <button onClick={() => vaiArea("azioni", `azione-${azId}`, "approvare")} className="mt-1.5 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                        <ArrowRight size={12} /> Vai all'azione collegata
                      </button>
                    )}
                    <ParlaCasella titolo={`Difetto: ${umano.titolo}`} contesto={[umano.cosaSuccede, umano.perche && `Perché: ${umano.perche}`, umano.cosaFare && `Cosa fare: ${umano.cosaFare}`].filter(Boolean).join(" · ")} />
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

          {/* === STORICO / ANDAMENTO === */}
          {tab === "storico" && (
            <div className="space-y-3">
              <div className="t-eti">Voto di salute giorno per giorno (ultime 3 settimane) — sto migliorando?</div>
              {serieGiorni.length === 0 && <p className="t-eti">Ancora nessun punto. La serie cresce a ogni radiografia.</p>}
              {serieGiorni.length > 0 && (
                <div className="flex items-end gap-1.5">
                  {serieGiorni.map((s, i) => {
                    const voto = Number(s.voto_salute) || 0;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0" title={`${s.data}: ${voto}/100 · ${s.difetti_aperti ?? "–"} aperti · ${s.difetti_chiusi ?? "–"} chiusi`}>
                        <span className={`text-[9px] tabular-nums ${votoColore(voto)}`}>{voto}</span>
                        <div className="w-full max-w-[26px] rounded-t bg-brand/70" style={{ height: `${Math.max(3, Math.round((voto / 100) * BARRA_MAX_PX))}px` }} />
                        <span className="text-[9px] text-black/40 w-full text-center whitespace-nowrap">{String(s.data).slice(8, 10)}/{String(s.data).slice(5, 7)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="space-y-1">
                {serieGiorni.slice().reverse().map((s, i, arr) => {
                  const prec = arr[i + 1]; // il giorno prima (lista dal più recente)
                  const delta = prec ? (Number(s.voto_salute) || 0) - (Number(prec.voto_salute) || 0) : 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-[12px]">
                      <span className="t-eti w-20">{s.data}</span>
                      <span className={`tabular-nums font-medium ${votoColore(s.voto_salute)}`}>{s.voto_salute}/100</span>
                      {prec && delta !== 0 && (
                        <span className={`text-[11px] tabular-nums ${delta > 0 ? "text-green-600" : "text-red-600"}`}>{delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}</span>
                      )}
                      <span className="t-eti ml-auto">{s.difetti_aperti} aperti · {s.difetti_chiusi} chiusi</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
