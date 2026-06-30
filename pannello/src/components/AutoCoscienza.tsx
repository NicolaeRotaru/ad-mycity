"use client";

import { useEffect, useState } from "react";
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
import { dataVault } from "@/lib/format";
import { vaiArea } from "@/lib/nav";
import ParlaCasella from "@/components/ParlaCasella";

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
            className="w-full text-[12.5px] rounded-lg border border-black/15 bg-white px-2.5 py-1.5 outline-none focus:border-brand/50 resize-y"
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
type Lezione = { id?: string; testo?: string; tag?: string[]; reparto?: string; confidenza?: number; evidenze?: number; fonte?: string; stato?: string };
type Apprendimento = { data?: string; lezioni?: Lezione[]; principi?: string[]; preferenze_nicola?: string[]; meta?: Record<string, number> };
type Calibrazione = { per_reparto?: { reparto?: string; previsioni?: number; azzeccate?: number; punteggio?: number; autonomia?: string; nota?: string }[] };
type Benchmark = { ambito?: string; nostro?: string; migliori?: { chi?: string; cosa_fa?: string; fonte?: string }[]; divario?: string; cosa_ci_manca?: string };
type Miglioramento = {
  data?: string; benchmark?: Benchmark[];
  esperimenti?: { id?: string; ipotesi?: string; reparto_guida?: string; stato?: string; esito?: string }[];
  peer_review?: { lavoro?: string; autore?: string; revisori?: string[]; prima?: string; dopo?: string; guadagno?: string }[];
  proposte_auto_riscrittura?: { cosa?: string; perche?: string; dove?: string }[];
};
type Entita = { id?: string; nome?: string; tipo?: string; stato?: string; fonte?: string; confidenza?: number; fonte_ragionamento?: string; evidenze?: string[]; note?: string; domanda_per_nicola?: string };
type Registro = { entita?: Entita[] };
type Dati = { collegato: boolean; messaggio?: string; analisi?: Analisi; analisi_affidabile?: boolean; apprendimento?: Apprendimento; miglioramento?: Miglioramento; calibrazione?: Calibrazione; registro?: Registro };

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

function barra(conf?: number) {
  const pct = Math.round((conf ?? 0) * 100);
  const c = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-black/30";
  return (
    <div className="h-1.5 w-16 rounded-full bg-black/10 overflow-hidden shrink-0">
      <div className={`h-full ${c}`} style={{ width: `${pct}%` }} />
    </div>
  );
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

  useEffect(() => {
    const carica = () => {
      fetch("/api/memoria/auto-coscienza", { cache: "no-store" }).then((r) => r.json()).then(setD).catch(() => {});
      fetch("/api/memoria/risposta", { cache: "no-store" }).then((r) => r.json()).then((x) => { if (x?.risposte) setRisposte(x.risposte); }).catch(() => {});
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

  // Deep-link dal banner della Plancia (#auto-coscienza): porta la card sott'occhio.
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.replace("#", "") === "auto-coscienza") {
      setTimeout(() => document.getElementById("auto-coscienza")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [d]);

  const a = d?.analisi;
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
  const cal = d?.calibrazione;
  const nErrori = a?.errori?.length || 0;
  const nDomande = a?.domande_per_nicola?.length || 0;

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "analisi", label: "Auto-analisi", icon: <Microscope size={15} />, badge: nErrori },
    { id: "apprendimento", label: "Apprendimento", icon: <GraduationCap size={15} />, badge: ap?.lezioni?.length || 0 },
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
            <div className="t-eti">{sottotitoloSezione} {a?.data && tab === "analisi" ? `· ultima ${dataVault(a.data)}` : ap?.data && tab === "apprendimento" ? `· ultima ${dataVault(ap.data)}` : mi?.data && tab === "miglioramento" ? `· ultima ${dataVault(mi.data)}` : ""}</div>
          </div>
        </div>
        {votoFOk ? (
          <div className="text-right shrink-0">
            <div className={`text-[26px] font-bold leading-none tabular-nums ${votoColore(votoF)}`}>{votoF}<span className="text-[13px] text-black/30">/100</span></div>
            <div className="t-eti">fiducia {a?.trend_fiducia || ""}</div>
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

          {/* ===== AUTO-ANALISI ===== */}
          {tab === "analisi" && (
            <div className="space-y-3">
              {sintesiEff && <p className="t-corpo break-words">{sintesiEff}</p>}

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
                          <span className="text-[10px] px-1.5 rounded bg-green-100 text-green-700">scelta motivata</span>
                          {e.confidenza != null && <span className="t-eti ml-auto">confidenza {Math.round((e.confidenza || 0) * 100)}%</span>}
                        </div>
                        {e.evidenze && e.evidenze.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5">
                            {e.evidenze.map((ev, j) => <li key={j} className="text-[12px] text-black/70 flex gap-1.5"><span className="text-green-600">✓</span>{ev}</li>)}
                          </ul>
                        )}
                        {e.fonte_ragionamento && <div className="t-eti mt-1 font-mono">perché: {e.fonte_ragionamento}</div>}
                        {e.note && <div className="text-[12px] text-black/60 mt-1">{e.note}</div>}
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
                          {e.note && <div className="text-[12px] text-black/65 mt-1">{e.note}</div>}
                          {e.domanda_per_nicola && <div className="text-[12px] mt-1 text-brand">❓ {e.domanda_per_nicola}</div>}
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

              {/* Salute della macchina */}
              {a?.salute_macchina && (
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { k: "Supabase", v: a.salute_macchina.supabase, ok: a.salute_macchina.supabase === "ok" },
                    { k: "Stripe", v: a.salute_macchina.stripe, ok: a.salute_macchina.stripe === "ok" },
                    { k: "Dati freschi", v: a.salute_macchina.dati_freschi ? "sì" : "no", ok: !!a.salute_macchina.dati_freschi },
                    { k: "Sensori attivi", v: String(a.salute_macchina.sensori_attivi ?? 0), ok: (a.salute_macchina.sensori_attivi ?? 0) > 0 },
                  ].map((s) => (
                    <span key={s.k} className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ring-1 ${s.ok ? "bg-green-50 text-green-700 ring-green-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
                      <Activity size={11} /> {s.k}: <b>{s.v}</b>
                    </span>
                  ))}
                </div>
              )}

              {/* Errori trovati */}
              {nErrori > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><ShieldAlert size={13} /> Errori trovati ({nErrori})</div>
                  <div className="space-y-2">
                    {a!.errori!.map((e, i) => {
                      const g = GRAV[e.gravita || "bassa"] || GRAV.bassa;
                      return (
                        <div key={i} className={`rounded-xl border p-3 ${g.cls}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
                            <span className="text-[10px] font-bold tracking-wide text-black/50">{g.label}</span>
                            {e.livello_scoperta && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/45">scoperto {e.livello_scoperta}</span>}
                            {e.azione_presa && <span className="text-[10px] px-1.5 rounded bg-black/10 text-black/55 ml-auto">{e.azione_presa}</span>}
                          </div>
                          <div className="text-[13px] font-medium mt-1">{e.titolo}</div>
                          {e.dettaglio && <div className="text-[12px] text-black/65 mt-0.5">{e.dettaglio}</div>}
                          {e.riguarda && <div className="t-eti mt-1">riguarda: {e.riguarda}</div>}
                          <ParlaCasella titolo={`Errore: ${e.titolo}`} contesto={[e.dettaglio, e.riguarda && `riguarda: ${e.riguarda}`].filter(Boolean).join(" · ")} />
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
                          <div className="text-[13px] font-medium break-words">❓ {testo}</div>
                          {perche && <div className="text-[12px] text-black/65 mt-1"><b>Perché serve:</b> {perche}</div>}
                          {seRisp && <div className="text-[12px] text-black/65 mt-0.5"><b>Se rispondi:</b> {seRisp}</div>}
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
                  <ul className="space-y-1">
                    {a.punti_ciechi.map((p, i) => <li key={i} className="text-[12px] text-black/65 flex gap-1.5"><span className="text-black/30">•</span>{p}</li>)}
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
                  <div className="space-y-2">
                    {ap.lezioni.map((l, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="text-[12.5px]">{l.testo}</div>
                        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                          {l.stato && <span className={`text-[10px] px-1.5 rounded ${l.stato === "principio" ? "bg-green-100 text-green-700" : l.stato === "decaduta" ? "bg-black/5 text-black/40" : "bg-amber-100 text-amber-700"}`}>{l.stato}</span>}
                          {l.reparto && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{l.reparto}</span>}
                          {l.fonte && <span className="t-eti">da: {l.fonte}</span>}
                          {l.evidenze != null && <span className="t-eti">· {l.evidenze} evid.</span>}
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
                      <div key={i} className="flex items-center gap-2 text-[12px]">
                        <span className="font-medium">{r.reparto}</span>
                        <span className="t-eti">{r.azzeccate}/{r.previsioni} azzeccate</span>
                        <span className="ml-auto flex items-center gap-1.5">{barra(r.punteggio)}<span className="t-eti">autonomia {r.autonomia}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ap?.preferenze_nicola && ap.preferenze_nicola.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5">🎯 Cosa ho capito che vuoi (preference learning)</div>
                  <ul className="space-y-1">
                    {ap.preferenze_nicola.map((p, i) => <li key={i} className="text-[12px] text-black/65 flex gap-1.5"><span className="text-black/30">•</span>{p}</li>)}
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
                    {mi.benchmark.map((b, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium capitalize">{b.ambito}</span>
                          {b.divario && <span className={`text-[10px] px-1.5 rounded ml-auto ${b.divario === "alto" ? "bg-red-100 text-red-700" : b.divario === "medio" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>divario {b.divario}</span>}
                        </div>
                        {b.nostro && <div className="text-[12px] text-black/65 mt-1"><b>Noi:</b> {b.nostro}</div>}
                        {b.cosa_ci_manca && <div className="text-[12px] text-black/65 mt-0.5"><b>Cosa ci manca:</b> {b.cosa_ci_manca}</div>}
                        {b.migliori && b.migliori.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {b.migliori.map((m, j) => <div key={j} className="t-eti">↗ {m.chi}: {m.cosa_fa}</div>)}
                          </div>
                        )}
                        <ParlaCasella titolo={`Confronto: ${b.ambito}`} contesto={[b.nostro && `Noi: ${b.nostro}`, b.cosa_ci_manca && `Ci manca: ${b.cosa_ci_manca}`].filter(Boolean).join(" · ")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mi?.esperimenti && mi.esperimenti.length > 0 && (
                <div>
                  <div className="t-micro mb-1.5 flex items-center gap-1.5"><CheckCircle2 size={13} /> Esperimenti di miglioria</div>
                  <div className="space-y-2">
                    {mi.esperimenti.map((e, i) => (
                      <div key={i} className="rounded-xl border border-black/[0.06] bg-paper/40 p-3">
                        <div className="text-[12.5px] font-medium">{e.ipotesi}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {e.reparto_guida && <span className="text-[10px] px-1.5 rounded bg-black/5 text-black/50">{e.reparto_guida}</span>}
                          {e.stato && <span className="text-[10px] px-1.5 rounded bg-black/10 text-black/55">{e.stato}</span>}
                          {e.esito && <span className="t-eti ml-auto">{e.esito}</span>}
                        </div>
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
                        <div className="text-[12.5px] font-medium">{p.lavoro} <span className="t-eti">· di {p.autore}</span></div>
                        {p.guadagno && <div className="text-[12px] text-green-700 mt-0.5">▲ {p.guadagno}</div>}
                        {p.revisori && <div className="t-eti mt-0.5">rivisto da: {p.revisori.join(", ")}</div>}
                        <ParlaCasella titolo={`Peer review: ${p.lavoro}`} contesto={[p.lavoro && `Lavoro: ${p.lavoro}`, p.guadagno && `Guadagno: ${p.guadagno}`].filter(Boolean).join(" · ")} />
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
                        <div className="text-[12.5px] font-medium">{p.cosa}</div>
                        {p.perche && <div className="text-[12px] text-black/65 mt-0.5">{p.perche}</div>}
                        {p.dove && <div className="t-eti mt-0.5 font-mono">{p.dove}</div>}
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
