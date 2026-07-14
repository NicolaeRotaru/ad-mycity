"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Microscope,
  GraduationCap,
  Rocket,
  ShieldAlert,
  HelpCircle,
  EyeOff,
  Activity,
  Target,
  Lightbulb,
  Swords,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquarePlus,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { dataVault, dataVaultRecente } from "@/lib/format";
import { vaiArea } from "@/lib/nav";
import { usePanelSync } from "@/lib/panel-sync";
import ParlaCasella from "@/components/ParlaCasella";
import { TestoUmano } from "@/components/TestoUmano";
import { humanizzaErrore, traduciTestoCompleto } from "@/lib/radiografia-umana";
import {
  autonomiaLeggibile,
  divarioLeggibile,
  repartoLeggibile,
  saluteValore,
  statoEntita,
  statoLezione,
} from "@/lib/auto-coscienza-umana";

// 🔑 Id stabile di una domanda, derivato dal suo testo (djb2): resta lo stesso tra
// un refresh e l'altro finché la domanda è la stessa → così sappiamo a quale è già
// stata data risposta. Niente dipendenze esterne.
function qidDa(testo: string): string {
  const s = (testo || "").trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "q" + h.toString(36);
}

type Salvata = { risposta: string; at: string };

// 💬 Casella per rispondere a una domanda dell'AD. Se c'è già una risposta, la
// mostra; altrimenti apre un campo e la manda al cervello (POST /api/memoria/risposta).
function RispostaBox({
  qid,
  domanda,
  salvata,
  onSalvata,
}: {
  qid: string;
  domanda: string;
  salvata?: Salvata;
  onSalvata: (qid: string, risposta: string, at: string) => void;
}) {
  const [aperto, setAperto] = useState(false);
  const [bozza, setBozza] = useState("");
  const [inviando, setInviando] = useState(false);
  const [err, setErr] = useState("");

  if (salvata) {
    return (
      <div className="mt-2 rounded-lg border border-green-200 bg-green-50/60 px-3 py-2">
        <div className="text-[10.5px] font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1">
          <CheckCircle2 size={12} /> La tua risposta
        </div>
        <div className="text-[12.5px] text-ink/85 mt-0.5 whitespace-pre-wrap break-words">{salvata.risposta}</div>
        <div className="t-eti mt-0.5">il cervello la applica al prossimo giro{salvata.at ? ` · ${dataVault(salvata.at)}` : ""}</div>
      </div>
    );
  }

  async function invia() {
    const testo = bozza.trim();
    if (!testo) return;
    setInviando(true);
    setErr("");
    try {
      const r = await fetch("/api/memoria/risposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qid, domanda, risposta: testo }),
      }).then((x) => x.json());
      if (r?.ok) onSalvata(qid, testo, r.at || "");
      else setErr(r?.error || "Non riuscito.");
    } catch {
      setErr("Errore di rete.");
    } finally {
      setInviando(false);
    }
  }

  return (
    <div className="mt-2">
      {!aperto ? (
        <button onClick={() => setAperto(true)} className="inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
          <MessageSquarePlus size={13} /> ✍️ Rispondi
        </button>
      ) : (
        <div className="space-y-1.5">
          <textarea
            value={bozza}
            onChange={(e) => setBozza(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Scrivi la tua risposta… arriva al cervello e chiude la domanda."
            className="input-soft w-full text-[12.5px] resize-y"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={invia}
              disabled={inviando || !bozza.trim()}
              className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dark disabled:opacity-50 transition"
            >
              {inviando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Invia al cervello
            </button>
            <button onClick={() => { setAperto(false); setBozza(""); setErr(""); }} className="t-eti hover:text-brand">annulla</button>
            {err && <span className="t-eti text-red-600">{err}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// 🧠 AUTO-COSCIENZA — il pannello con cui Nicola vede la macchina pensare su se stessa:
// si controlla (auto-analisi), impara (apprendimento), si migliora (auto-miglioramento).
// Legge /api/memoria/auto-coscienza (i 5 digest del vault). Spec: cervello/auto-coscienza.md.

type Errore = { gravita?: string; titolo?: string; dettaglio?: string; azione_presa?: string; riguarda?: string; livello_scoperta?: string };
type Domanda = { id?: string; domanda?: string; perche_serve?: string; se_rispondi?: string; gravita?: string };
type Analisi = {
  // voto_fiducia DOVREBBE essere un numero 0-100, ma il giro a volte ci scrive una frase:
  // accettiamo entrambi e in render coerciamo (vedi votoF/votoFOk), così l'header non esplode.
  data?: string; voto_fiducia?: number | string; trend_fiducia?: string; sintesi?: string;
  verifiche?: Record<string, string>; errori?: Errore[]; domande_per_nicola?: (Domanda | string)[];
  punti_ciechi?: string[]; miglioramenti_prossimo_giro?: string[];
  salute_macchina?: { supabase?: string; stripe?: string; dati_freschi?: boolean; sensori_attivi?: number };
};
type Lezione = { id?: string; testo?: string; tag?: string[]; reparto?: string; confidenza?: number; evidenze?: number; fonte?: string; stato?: string; nato?: string; ultima_conferma?: string };
type AppMeta = {
  lezioni_attive?: number;
  promosse_a_principio?: number;
  decadute?: number;
  tasso_applicazione?: number;
  tasso_calcolato_il?: string;
  tick_leggero_il?: string;
};
type Apprendimento = { data?: string; aggiornato?: string; lezioni?: Lezione[]; principi?: string[]; preferenze_nicola?: string[]; meta?: AppMeta };
type Calibrazione = { per_reparto?: { reparto?: string; previsioni?: number; azzeccate?: number; punteggio?: number; autonomia?: string; nota?: string }[] };
type Benchmark = {
  reparto?: string;
  ambito?: string;
  livello_attuale_L?: number;
  migliori?: { chi?: string; livello?: string; cosa_fa?: string; fonte?: string; esempi?: { cosa?: string; link?: string }[] }[];
  divario?: string;
  obiettivo?: string;
  progresso?: { data?: string; punteggio?: number; fonte?: string; nota?: string }[];
  nostro?: string;
  cosa_ci_manca?: string;
};
type Miglioramento = {
  data?: string;
  aggiornato?: string;
  meta_esperimenti?: { aggiornato?: string };
  benchmark?: Benchmark[];
  esperimenti?: { id?: string; ipotesi?: string; reparto_guida?: string; stato?: string; esito?: string }[];
  peer_review?: { lavoro?: string; autore?: string; revisori?: string[]; prima?: string; dopo?: string; guadagno?: string }[];
  proposte_auto_riscrittura?: { cosa?: string; perche?: string; dove?: string }[];
};
type Entita = { id?: string; nome?: string; tipo?: string; stato?: string; fonte?: string; confidenza?: number; fonte_ragionamento?: string; evidenze?: string[]; note?: string; domanda_per_nicola?: string };
type Registro = { entita?: Entita[] };
type LiveAnalisi = {
  sensori_aggiornato?: string | null;
  analisi_data?: string | null;
  analisi_ore_fa?: number | null;
  analisi_stale?: boolean;
  salute_macchina?: Analisi["salute_macchina"];
  gap?: string[];
};
type Dati = {
  collegato: boolean;
  messaggio?: string;
  aggiornato?: string | null;
  live?: LiveAnalisi | null;
  analisi?: Analisi;
  analisi_affidabile?: boolean;
  apprendimento?: Apprendimento;
  miglioramento?: Miglioramento;
  calibrazione?: Calibrazione;
  registro?: Registro;
};

const VERIFICA_LABEL: Record<string, string> = { entita: "Entità reali", numeri: "Numeri con fonte", coerenza: "Coerenza", semaforo: "Semaforo 🟢🟡🔴", qualita: "Qualità" };

type Tab = "analisi" | "apprendimento" | "miglioramento";

const GRAV: Record<string, { cls: string; dot: string; label: string }> = {
  alta: { cls: "border-red-200 bg-red-50/60", dot: "bg-red-500", label: "ALTA" },
  media: { cls: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500", label: "MEDIA" },
  bassa: { cls: "border-black/10 bg-paper/40", dot: "bg-black/30", label: "BASSA" },
};

function votoColore(v?: number) {
  if (v == null || !Number.isFinite(v)) return "text-black/40";
  if (v >= 80) return "text-green-600";
  if (v >= 60) return "text-amber-600";
  return "text-red-600";
}

// Un «trend» sano è un token breve. Il giro a volte ci scrive una frase intera: nel blocco shrink-0 a
// destra del titolo quella frase non si stringe → schiaccia il titolo a 1 carattere per riga (testo
// verticale). L'API già lo sanifica; questo è il paracadute UI. (fix «scritta in verticale»)
function trendBreve(v: unknown): string {
  const t = String(v ?? "").trim();
  return t.length > 0 && t.length <= 24 && !/[.:;—]/.test(t) ? t : "";
}

function barra(conf?: number) {
  const pct = Math.round((conf ?? 0) * 100);
  const c = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-black/30";
  return (
    <div className="h-1.5 w-16 rounded-full bg-black/10 overflow-hidden shrink-0">
      <div className={`h-full ${c}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function dataLezione(l: Lezione): Date | null {
  const raw = (l.ultima_conferma || l.nato || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const dt = new Date(`${raw}T12:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function lezioneRecente(l: Lezione, giorni = 7): boolean {
  const dt = dataLezione(l);
  if (!dt) return false;
  const lim = new Date();
  lim.setDate(lim.getDate() - giorni);
  lim.setHours(0, 0, 0, 0);
  return dt >= lim;
}

export default function AutoCoscienza({
  fixedTab,
  hideSwitcher = false,
}: {
  fixedTab?: Tab;
  hideSwitcher?: boolean;
} = {}) {
  const [d, setD] = useState<Dati | null>(null);
  const [tabInterno, setTabInterno] = useState<Tab>("analisi");
  const tab = fixedTab ?? tabInterno;
  const setTab = fixedTab ? () => {} : setTabInterno;
  // Risposte già date alle domande dell'AD (qid → {risposta, at}).
  const [risposte, setRisposte] = useState<Record<string, Salvata>>({});
  const onSalvata = (qid: string, risposta: string, at: string) => setRisposte((s) => ({ ...s, [qid]: { risposta, at } }));
  // 🔗 Azioni da firmare indicizzate per origine: per ogni casella (domanda/entità) sappiamo
  // se esiste un'azione che ne è nata → mostriamo "vai all'azione". (origine → id azione)
  const [azPerOrigine, setAzPerOrigine] = useState<Record<string, string>>({});
  const [mostraArchivioLezioni, setMostraArchivioLezioni] = useState(false);

  const carica = useCallback(() => {
    fetch("/api/memoria/auto-coscienza", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
    fetch("/api/memoria/risposta", { cache: "no-store" }).then((r) => r.json()).then((x) => { if (x?.risposte) setRisposte(x.risposte); }).catch(() => {});
    fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).then((x) => {
      const m: Record<string, string> = {};
      for (const a of x?.azioni || []) if (a?.origine && !a.stato) m[String(a.origine)] = String(a.id);
      setAzPerOrigine(m);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    carica();
    const id = setInterval(carica, 30_000);
    return () => clearInterval(id);
  }, [carica]);

  usePanelSync(["radiografia", "azioni", "memoria", "all"], carica);

  // Deep-link dal banner della Plancia (#auto-coscienza): porta la card sott'occhio.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.replace("#", "") === "auto-coscienza") {
      setTimeout(() => document.getElementById("auto-coscienza")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [d]);

  const a = d?.analisi;
  const live = d?.live;
  // Il voto può arrivare come numero o (per un giro che non rispetta il contratto) come frase.
  const votoF = Number(a?.voto_fiducia);
  // 🩺 Mostriamo il numerone SOLO se l'analisi è affidabile (l'API marca i gusci vuoti dei giri rotti:
  // voto 7 + sintesi vuota). Così non compare più un falso e allarmante «7/100». Default true per
  // retrocompatibilità se l'API non manda il flag.
  const analisiAffidabile = d?.analisi_affidabile !== false;
  const votoFOk = Number.isFinite(votoF) && analisiAffidabile;
  // Se il voto è una frase non numerica, mostriamola come sintesi piccola (non come numero gigante).
  const sintesiEff = a?.sintesi || (!votoFOk && typeof a?.voto_fiducia === "string" ? a!.voto_fiducia : "");
  const scelteRagionate = (d?.registro?.entita || []).filter((e) => e.stato === "scelta_ragionata");
  const daVerificare = (d?.registro?.entita || []).filter((e) => e.stato === "da_verificare");
  const ap = d?.apprendimento;
  const mi = d?.miglioramento;
  const dataApprendimento = dataVaultRecente(
    ap?.data,
    ap?.aggiornato,
    typeof ap?.meta?.tasso_calcolato_il === "string" ? ap.meta.tasso_calcolato_il : undefined,
  );
  const dataMiglioramento = dataVaultRecente(mi?.data, mi?.aggiornato, mi?.meta_esperimenti?.aggiornato);
  const cal = d?.calibrazione;
  const erroriLive = live?.gap?.length ? live.gap : a?.errori;
  const nErrori = (Array.isArray(erroriLive) ? erroriLive : []).length;
  const nDomande = a?.domande_per_nicola?.length || 0;
  const tutteLezioni = ap?.lezioni || [];
  const lezioniRecenti = tutteLezioni.filter((l) => lezioneRecente(l));
  const lezioniVis = mostraArchivioLezioni ? tutteLezioni : lezioniRecenti;
  const nLezioniArchivio = Math.max(0, tutteLezioni.length - lezioniRecenti.length);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "analisi", label: "Auto-analisi", icon: <Microscope size={15} />, badge: nErrori },
    { id: "apprendimento", label: "Apprendimento", icon: <GraduationCap size={15} />, badge: lezioniRecenti.length || undefined },
    { id: "miglioramento", label: "Auto-miglioramento", icon: <Rocket size={15} />, badge: mi?.benchmark?.length || 0 },
  ];

  const titoloSezione =
    tab === "apprendimento" ? "🎓 Apprendimento" : tab === "miglioramento" ? "🚀 Auto-miglioramento" : "🔬 Auto-analisi";
  const sottotitoloSezione =
    tab === "apprendimento"
      ? "Lezioni imparate e calibrazione."
      : tab === "miglioramento"
        ? "Confronto coi migliori, esperimenti e peer review."
        : "Si controlla prima di consegnare — errori, domande, entità.";

  return (
    <section id={tab === "analisi" ? "auto-coscienza" : undefined} className="card p-4 border-brand/20 scroll-mt-24">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="sez-ico"><Microscope size={16} /></span>
          <div className="min-w-0">
            <span className="t-sez">{titoloSezione}</span>
            <div className="t-eti">{sottotitoloSezione}{" "}
              {tab === "analisi" && live?.sensori_aggiornato
                ? `· sensori ${dataVault(live.sensori_aggiornato)}${a?.data ? ` · analisi ${dataVault(a.data)}` : ""}`
                : a?.data && tab === "analisi"
                  ? `· ultima ${dataVault(a.data)}`
                  : dataApprendimento && tab === "apprendimento"
                    ? `· ultima ${dataVault(dataApprendimento)}`
                    : dataMiglioramento && tab === "miglioramento"
                      ? `· ultima ${dataVault(dataMiglioramento)}`
                      : ""}
            </div>
          </div>
        </div>
        {votoFOk ? (
          <div className="text-right shrink-0 max-w-[42%]">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${votoColore(votoF)}`}>{votoF}<span className="text-[13px] text-black/30">/100</span></div>
            <div className="t-eti truncate">{trendBreve(a?.trend_fiducia) || (a?.trend_fiducia ? traduciTestoCompleto(String(a.trend_fiducia)).slice(0, 40) : "fiducia")}</div>
          </div>
        ) : a ? (
          <div className="text-right shrink-0 max-w-[44%]">
            <div className="text-[12px] font-medium text-amber-600 leading-tight">analisi in aggiornamento</div>
            <div className="t-eti">in attesa di un giro valido</div>
          </div>
        ) : null}
      </div>

      {!d?.collegato && (
        <p className="t-eti py-6 text-center">{d?.messaggio || "Caricamento…"}</p>
      )}

      {d?.collegato && (
        <>
          {!hideSwitcher && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 text-[12.5px] font-medium px-2.5 py-1.5 rounded-lg transition ${
                  tab === t.id ? "bg-brand text-white" : "bg-white text-black/60 ring-1 ring-black/[0.06] hover:bg-black/[0.03]"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge ? <span className={`text-[10px] px-1.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-black/10"}`}>{t.badge}</span> : null}
              </button>
            ))}
          </div>
          )}

          {d?.collegato && (
            <div className="rounded-xl border border-black/[0.08] bg-paper/50 px-3 py-2.5 mb-3">
              {tab === "analisi" && (
                <p className="t-corpo text-[13px] font-semibold">
                  {votoFOk ? (votoF >= 80 ? "🟢" : votoF >= 60 ? "🟡" : "🔴") : "🟡"}{" "}
                  {votoFOk ? `${votoF}/100 fiducia` : "Analisi in aggiornamento"}
                  {nErrori > 0 ? ` · ${nErrori} errori` : ""}
                  {nDomande > 0 ? ` · ${nDomande} domande per te` : ""}
                </p>
              )}
              {tab === "apprendimento" && (
                <p className="t-corpo text-[13px] font-semibold">
                  {lezioniRecenti.length} lezioni negli ultimi 7 giorni
                  {ap?.meta?.tasso_applicazione != null ? ` · ${Math.round((ap.meta.tasso_applicazione || 0) * 100)}% applicazione` : ""}
                </p>
              )}
              {tab === "miglioramento" && (
                <p className="t-corpo text-[13px] font-semibold">
                  {mi?.benchmark?.length || 0} benchmark · {mi?.esperimenti?.length || 0} esperimenti
                  {(mi?.esperimenti?.length || 0) === 0 ? " · prossimo passo: misurare un esperimento" : ""}
                </p>
              )}
            </div>
          )}

          {/* ===== AUTO-ANALISI ===== */}
          {tab === "analisi" && (
            <div className="space-y-3">
              {live?.analisi_stale && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-900/90">
                  <b>Testo e voto = ultimo giro</b>
                  {live.analisi_data ? ` (${dataVault(live.analisi_data)}` : ""}
                  {live.analisi_ore_fa != null ? `, ${live.analisi_ore_fa}h fa` : ""}
                  {live.analisi_data ? ")" : ""}.
                  {" "}Sensori, salute e avvisi sotto si aggiornano da soli ogni 30 secondi
                  {live.sensori_aggiornato ? ` (ultimo controllo ${dataVault(live.sensori_aggiornato)})` : ""}.
                  Per rifare tutta l&apos;analisi testuale: «fai un giro».
                </div>
              )}

              {sintesiEff && <TestoUmano testo={sintesiEff} className="t-corpo break-words whitespace-pre-wrap [overflow-wrap:anywhere]" />}

              {/* Le 5 verifiche a colpo d'occhio */}
              {a?.verifiche && (
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(a.verifiche).map(([k, v]) => {
                    const ok = v === "ok";
                    return (
                      <span key={k} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${ok ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                        {ok ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />} {VERIFICA_LABEL[k] || k}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* 🧠 Scelte ragionate: entità che la macchina ha scelto DA SOLA con prove (legittime, non inventate) */}
              {scelteRagionate.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} /> Scelte ragionate della macchina ({scelteRagionate.length})</div>
                  <div className="space-y-2">
                    {scelteRagionate.map((e, i) => (
                      <div key={i} className="rounded-xl border border-green-200 bg-green-50/50 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium">{e.nome}</span>
                          {e.tipo && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{e.tipo}</span>}
                          <span className="text-[10px] px-1.5 rounded bg-green-100 text-green-700">{statoEntita(e.stato || "scelta_ragionata")}</span>
                          {e.confidenza != null && <span className="t-eti ml-auto">confidenza {Math.round((e.confidenza || 0) * 100)}%</span>}
                        </div>
                        {e.evidenze && e.evidenze.length > 0 && (
                          <ul className="mt-1.5 space-y-1">
                            {e.evidenze.map((ev, j) => (
                              <li key={j} className="flex gap-1.5">
                                <span className="text-green-600 shrink-0">✓</span>
                                <TestoUmano testo={ev} className="text-[12px] text-black/70" />
                              </li>
                            ))}
                          </ul>
                        )}
                        {e.fonte_ragionamento && (
                          <div className="mt-1.5">
                            <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wide">Perché questa scelta</div>
                            <TestoUmano testo={e.fonte_ragionamento} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {e.note && (
                          <div className="mt-1.5">
                            <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wide">Note</div>
                            <TestoUmano testo={e.note} className="text-[12px] text-black/60 mt-0.5" />
                          </div>
                        )}
                        <ParlaCasella titolo={`Scelta ragionata: ${e.nome}`} contesto={[e.fonte_ragionamento && `Perché: ${e.fonte_ragionamento}`, ...(e.evidenze || []), e.note].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🚩 Entità senza fondamento: il vero «inventato» → bloccate finché non chiarisci */}
              {daVerificare.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><ShieldAlert size={13} /> Entità senza fondamento — bloccate ({daVerificare.length})</div>
                  <div className="space-y-2">
                    {daVerificare.map((e, i) => {
                      const domE = e.domanda_per_nicola || `${e.nome}: è reale o lo scarto?`;
                      // 🔑 id stabile: usa quello esplicito del giro (così il tag {origine:entita:<id>} combacia
                      // ESATTAMENTE), altrimenti ricavalo dal testo (link generico ok, puntuale solo con id).
                      const idE = e.id || qidDa(`entita:${e.nome}:${domE}`);
                      return (
                        <div id={`entita-${idE}`} key={i} className="rounded-xl border border-red-200 bg-red-50/60 p-3 scroll-mt-24">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium">{e.nome}</span>
                            {e.tipo && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{e.tipo}</span>}
                            {e.confidenza != null && <span className="t-eti ml-auto">confidenza {Math.round((e.confidenza || 0) * 100)}%</span>}
                          </div>
                          {e.note && (
                            <div className="mt-1">
                              <TestoUmano testo={e.note} className="text-[12px] text-black/65" />
                            </div>
                          )}
                          {e.domanda_per_nicola && (
                            <div className="mt-1.5">
                              <div className="text-[12px] font-medium text-brand">❓ Domanda per te</div>
                              <TestoUmano testo={e.domanda_per_nicola} className="text-[12px] text-black/75 mt-0.5" />
                            </div>
                          )}
                          <RispostaBox qid={idE} domanda={domE} salvata={risposte[idE]} onSalvata={onSalvata} />
                          {azPerOrigine[`entita:${idE}`] && (
                            <button onClick={() => vaiArea("azioni", `azione-${azPerOrigine[`entita:${idE}`]}`, "approvare")} className="mt-2 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai all'azione collegata
                            </button>
                          )}
                          <ParlaCasella titolo={`Entità: ${e.nome}`} contesto={[e.note, e.domanda_per_nicola].filter(Boolean).join(" · ")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Salute della macchina — live dai sensori quando disponibili */}
              {(live?.salute_macchina || a?.salute_macchina) && (
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const sm = live?.salute_macchina || a!.salute_macchina!;
                    return [
                      { k: "Database", raw: sm.supabase, okKey: "supabase" },
                      { k: "Pagamenti", raw: sm.stripe, okKey: "stripe" },
                      { k: "Dati freschi", raw: sm.dati_freschi, okKey: "dati freschi" },
                      { k: "Sensori attivi", raw: sm.sensori_attivi ?? 0, okKey: "sensori" },
                    ].map((s) => {
                      const { label, ok } = saluteValore(s.okKey, s.raw);
                      return (
                      <span key={s.k} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${ok ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                        <Activity size={11} /> {s.k}: <b>{label}</b>
                        {live?.salute_macchina ? " · live" : ""}
                      </span>
                    );});
                  })()}
                </div>
              )}

              {/* Errori / gap — preferisci messaggi live dai sensori */}
              {nErrori > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><ShieldAlert size={13} /> Errori trovati ({nErrori}){live?.gap?.length ? " · live" : ""}</div>
                  <div className="space-y-2">
                    {(Array.isArray(erroriLive) ? erroriLive : []).map((e, i) => {
                      const err: Errore = typeof e === "string" ? { titolo: e } : (e || {});
                      const g = GRAV[err.gravita || "bassa"] || GRAV.bassa;
                      const umano = humanizzaErrore(err);
                      return (
                        <div key={i} className={`rounded-xl border p-3 ${g.cls}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                            <span className="text-[10px] font-bold tracking-wide text-black/50">{g.label}</span>
                            {err.livello_scoperta && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/45">scoperto al livello {err.livello_scoperta}</span>}
                          </div>
                          <div className="text-[13px] font-medium mt-1 break-words [overflow-wrap:anywhere]">{umano.titolo}</div>
                          {umano.cosaSuccede && umano.cosaSuccede !== umano.titolo && (
                            <div className="text-[12px] text-black/65 mt-0.5 break-words [overflow-wrap:anywhere]">{umano.cosaSuccede}</div>
                          )}
                          {err.riguarda && (
                            <div className="mt-1">
                              <div className="text-[11px] font-semibold text-black/50">Riguarda</div>
                              <TestoUmano testo={err.riguarda} className="text-[12px] text-black/60 mt-0.5" />
                            </div>
                          )}
                          {err.azione_presa && (
                            <div className="text-[12px] text-black/60 mt-1">
                              <b>Azione già presa:</b> {traduciTestoCompleto(err.azione_presa)}
                            </div>
                          )}
                          {umano.tecnici && (
                            <details className="mt-2 group">
                              <summary className="text-[11px] font-medium text-black/45 cursor-pointer select-none hover:text-brand list-none flex items-center gap-1">
                                <span className="group-open:rotate-90 transition-transform inline-block">▸</span> Dettagli tecnici
                              </summary>
                              <div className="text-[11px] text-black/50 mt-1.5 whitespace-pre-wrap break-words font-mono leading-relaxed">{umano.tecnici}</div>
                            </details>
                          )}
                          <ParlaCasella titolo={`Errore: ${umano.titolo}`} contesto={[umano.cosaSuccede, err.riguarda && `Riguarda: ${err.riguarda}`].filter(Boolean).join(" · ")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Domande per Nicola */}
              {nDomande > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><HelpCircle size={13} /> Domande per te ({nDomande})</div>
                  <div className="space-y-2">
                    {a!.domande_per_nicola!.map((q, i) => {
                      const testo = (typeof q === "string" ? q : q?.domanda) || "";
                      const perche = typeof q === "string" ? "" : q?.perche_serve;
                      const seRisp = typeof q === "string" ? "" : q?.se_rispondi;
                      // id stabile: quello dato dal giro se c'è (combacia col tag origine delle azioni), altrimenti dall'hash del testo.
                      const id = (typeof q !== "string" && q?.id) ? q.id : qidDa(testo || `domanda-${i}`);
                      const azId = azPerOrigine[`domanda:${id}`];
                      return (
                        <div id={`domanda-${id}`} key={i} className="rounded-xl border border-brand/20 bg-brand-50/30 p-3 scroll-mt-24">
                          <div className="text-[13px] font-medium break-words">❓ Domanda</div>
                          <TestoUmano testo={testo} className="text-[13px] font-medium mt-0.5" />
                          {perche && (
                            <div className="mt-1.5">
                              <div className="text-[12px] font-semibold text-black/70">Perché serve</div>
                              <TestoUmano testo={perche} className="text-[12px] text-black/65 mt-0.5" />
                            </div>
                          )}
                          {seRisp && (
                            <div className="mt-1.5">
                              <div className="text-[12px] font-semibold text-black/70">Se rispondi</div>
                              <TestoUmano testo={seRisp} className="text-[12px] text-black/65 mt-0.5" />
                            </div>
                          )}
                          <RispostaBox qid={id} domanda={testo} salvata={risposte[id]} onSalvata={onSalvata} />
                          {azId ? (
                            <button onClick={() => vaiArea("azioni", `azione-${azId}`, "approvare")} className="mt-2 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai all'azione collegata
                            </button>
                          ) : (
                            <button onClick={() => vaiArea("azioni", undefined, "approvare")} className="mt-2 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai alle Azioni da firmare
                            </button>
                          )}
                          <ParlaCasella titolo={`Domanda: ${testo.slice(0, 60)}`} contesto={[testo, perche && `Perché serve: ${perche}`].filter(Boolean).join(" · ")} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Punti ciechi */}
              {a?.punti_ciechi && a.punti_ciechi.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><EyeOff size={13} /> Punti ciechi</div>
                  <ul className="space-y-2">
                    {a.punti_ciechi.map((p, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-black/30 shrink-0">•</span>
                        <TestoUmano testo={p} className="text-[12px] text-black/65" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ===== APPRENDIMENTO ===== */}
          {tab === "apprendimento" && (
            <div className="space-y-3">
              {ap?.meta && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { l: "Lezioni attive", v: ap.meta.lezioni_attive },
                    { l: "Principi", v: ap.meta.promosse_a_principio },
                    { l: "Decadute", v: ap.meta.decadute },
                    { l: "Tasso applic.", v: ap.meta.tasso_applicazione != null ? `${Math.round((ap.meta.tasso_applicazione || 0) * 100)}%` : "—" },
                  ].map((m) => (
                    <div key={m.l} className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
                      <div className="text-[18px] font-semibold tabular-nums">{m.v ?? "—"}</div>
                      <div className="t-eti">{m.l}</div>
                    </div>
                  ))}
                </div>
              )}

              {ap?.lezioni && ap.lezioni.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Lightbulb size={13} /> Lezioni imparate</div>
                  {nLezioniArchivio > 0 && (
                    <button
                      type="button"
                      onClick={() => setMostraArchivioLezioni((v) => !v)}
                      className="mb-2 text-[12.5px] font-medium text-brand hover:underline"
                    >
                      {mostraArchivioLezioni ? "Mostra solo ultimi 7 giorni" : `Mostra archivio (${nLezioniArchivio} lezioni più vecchie)`}
                    </button>
                  )}
                  <div className="space-y-2">
                    {lezioniVis.map((l, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <TestoUmano testo={l.testo} />
                        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                          {l.stato && <span className={`text-[10px] px-1.5 rounded ${l.stato === "principio" ? "bg-green-100 text-green-700" : l.stato === "decaduta" ? "bg-black/5 text-black/40" : "bg-amber-100 text-amber-700"}`}>{statoLezione(l.stato)}</span>}
                          {l.reparto && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{repartoLeggibile(l.reparto)}</span>}
                          {l.fonte && <span className="t-eti">da: {traduciTestoCompleto(l.fonte)}</span>}
                          {l.evidenze != null && <span className="t-eti">· {l.evidenze} conferme</span>}
                          <span className="ml-auto flex items-center gap-1.5">{barra(l.confidenza)}<span className="t-eti tabular-nums">{Math.round((l.confidenza ?? 0) * 100)}%</span></span>
                        </div>
                        <ParlaCasella titolo={`Lezione: ${(l.testo || "").slice(0, 50)}`} contesto={l.testo} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calibrazione */}
              {cal?.per_reparto && cal.per_reparto.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Target size={13} /> Calibrazione (previsto vs reale)</div>
                  <div className="space-y-1.5">
                    {cal.per_reparto.map((r, i) => (
                      <div key={i} className="rounded-lg border border-black/[0.05] bg-paper/30 px-2.5 py-2">
                        <div className="flex items-center gap-2 text-[12px] flex-wrap">
                          <span className="font-medium">{repartoLeggibile(r.reparto)}</span>
                          <span className="t-eti">{r.azzeccate}/{r.previsioni} previsioni azzeccate</span>
                          <span className="ml-auto flex items-center gap-1.5">{barra(r.punteggio)}<span className="t-eti">{autonomiaLeggibile(r.autonomia)}</span></span>
                        </div>
                        {r.nota && <TestoUmano testo={r.nota} className="text-[11.5px] text-black/55 mt-1" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ap?.preferenze_nicola && ap.preferenze_nicola.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5">🎯 Cosa ho capito che vuoi</div>
                  <ul className="space-y-2">
                    {ap.preferenze_nicola.map((p, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="text-black/30 shrink-0">•</span>
                        <TestoUmano testo={p} className="text-[12px] text-black/65" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ===== AUTO-MIGLIORAMENTO ===== */}
          {tab === "miglioramento" && (
            <div className="space-y-3">
              {mi?.benchmark && mi.benchmark.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><Swords size={13} /> Confronto coi migliori</div>
                  <div className="space-y-2">
                    {mi.benchmark.map((b, i) => {
                      const titolo = repartoLeggibile(b.reparto || b.ambito) || "Confronto";
                      const ultimoProgresso = b.progresso?.length ? b.progresso[b.progresso.length - 1] : undefined;
                      const contesto = [
                        b.obiettivo && `Obiettivo: ${b.obiettivo}`,
                        b.nostro && `Noi: ${b.nostro}`,
                        b.cosa_ci_manca && `Ci manca: ${b.cosa_ci_manca}`,
                        ultimoProgresso?.punteggio != null && `Punteggio: ${ultimoProgresso.punteggio}/100`,
                        ultimoProgresso?.nota,
                      ].filter(Boolean).join(" · ");
                      return (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-medium">{titolo}</span>
                          {b.livello_attuale_L != null && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">livello {b.livello_attuale_L}</span>}
                          {b.divario && <span className={`text-[10px] px-1.5 rounded ml-auto ${b.divario === "alto" ? "bg-red-100 text-red-700" : b.divario === "medio" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{divarioLeggibile(b.divario)}</span>}
                        </div>
                        {b.obiettivo && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Obiettivo</div>
                            <TestoUmano testo={b.obiettivo} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {b.nostro && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Dove siamo noi</div>
                            <TestoUmano testo={b.nostro} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {b.cosa_ci_manca && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Cosa ci manca</div>
                            <TestoUmano testo={b.cosa_ci_manca} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {ultimoProgresso?.punteggio != null && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Ultimo punteggio: {ultimoProgresso.punteggio}/100</div>
                            {ultimoProgresso.nota && <TestoUmano testo={ultimoProgresso.nota} className="text-[12px] text-black/55 mt-0.5" />}
                          </div>
                        )}
                        {b.migliori && b.migliori.length > 0 && (
                          <div className="mt-2 space-y-2">
                            <div className="text-[11px] font-semibold text-black/50 uppercase tracking-wide">Chi fa meglio</div>
                            {b.migliori.map((m, j) => (
                              <div key={j}>
                                <div className="text-[12px] font-medium">↗ {m.chi}{m.livello ? ` (${m.livello})` : ""}</div>
                                {m.cosa_fa && <TestoUmano testo={m.cosa_fa} className="text-[11.5px] text-black/55 mt-0.5 pl-3" />}
                                {m.esempi?.map((e, k) => (
                                  <div key={k} className="pl-3 mt-0.5">
                                    <TestoUmano testo={e.cosa} className="text-[11.5px] text-black/50" />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                        <ParlaCasella titolo={`Confronto: ${titolo}`} contesto={contesto} />
                      </div>
                    );})}
                  </div>
                </div>
              )}

              {mi?.esperimenti && mi.esperimenti.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} /> Esperimenti di miglioria</div>
                  <div className="space-y-2">
                    {mi.esperimenti.map((e, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="text-[12px] font-semibold text-black/70">Ipotesi da testare</div>
                        <TestoUmano testo={e.ipotesi} className="text-[12.5px] font-medium mt-0.5" />
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {e.reparto_guida && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{repartoLeggibile(e.reparto_guida)}</span>}
                          {e.stato && <span className="text-[10px] px-1.5 rounded bg-black/10 text-black/55">{traduciTestoCompleto(e.stato)}</span>}
                        </div>
                        {e.esito && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Esito</div>
                            <TestoUmano testo={e.esito} className="text-[12px] text-black/60 mt-0.5" />
                          </div>
                        )}
                        <ParlaCasella titolo={`Esperimento: ${(e.ipotesi || "").slice(0, 50)}`} contesto={[e.ipotesi, e.esito].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mi?.peer_review && mi.peer_review.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5">🤝 I senior si migliorano a vicenda</div>
                  <div className="space-y-2">
                    {mi.peer_review.map((p, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="text-[12.5px] font-medium">{traduciTestoCompleto(p.lavoro || "")} <span className="t-eti">· di {repartoLeggibile(p.autore) || p.autore}</span></div>
                        {p.guadagno && (
                          <div className="mt-1">
                            <div className="text-[12px] text-green-700 font-medium">Miglioramento</div>
                            <TestoUmano testo={p.guadagno} className="text-[12px] text-green-700/90 mt-0.5" />
                          </div>
                        )}
                        {p.prima && (
                          <div className="mt-1.5">
                            <div className="text-[11px] font-semibold text-black/50">Prima</div>
                            <TestoUmano testo={p.prima} className="text-[11.5px] text-black/55 mt-0.5" />
                          </div>
                        )}
                        {p.dopo && (
                          <div className="mt-1.5">
                            <div className="text-[11px] font-semibold text-black/50">Dopo</div>
                            <TestoUmano testo={p.dopo} className="text-[11.5px] text-black/55 mt-0.5" />
                          </div>
                        )}
                        {p.revisori && <div className="t-eti mt-1.5">Rivisto da: {p.revisori.map((r) => repartoLeggibile(r) || r).join(", ")}</div>}
                        <ParlaCasella titolo={`Revisione tra specialisti: ${p.lavoro}`} contesto={[p.lavoro && `Lavoro: ${p.lavoro}`, p.guadagno && `Guadagno: ${p.guadagno}`].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mi?.proposte_auto_riscrittura && mi.proposte_auto_riscrittura.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><AlertTriangle size={13} /> Proposte di auto-riscrittura (🟡 da validare)</div>
                  <div className="space-y-2">
                    {mi.proposte_auto_riscrittura.map((p, i) => (
                      <div key={i} className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                        <div className="text-[12px] font-semibold text-amber-900/80">Cosa vorrebbe cambiare</div>
                        <TestoUmano testo={p.cosa} className="text-[12.5px] font-medium mt-0.5" />
                        {p.perche && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Perché</div>
                            <TestoUmano testo={p.perche} className="text-[12px] text-black/65 mt-0.5" />
                          </div>
                        )}
                        {p.dove && (
                          <div className="mt-1.5">
                            <div className="text-[12px] font-semibold text-black/70">Dove nel sistema</div>
                            <TestoUmano testo={p.dove} className="text-[12px] text-black/55 mt-0.5" />
                          </div>
                        )}
                        <ParlaCasella titolo={`Proposta: ${(p.cosa || "").slice(0, 50)}`} contesto={[p.cosa, p.perche, p.dove].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!mi?.benchmark?.length && !mi?.esperimenti?.length && !mi?.peer_review?.length) && (
                <p className="t-eti py-4 text-center">Nessun ciclo di miglioramento ancora. Parte al primo lavoro importante (contenuti, pitch, pagine).</p>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
