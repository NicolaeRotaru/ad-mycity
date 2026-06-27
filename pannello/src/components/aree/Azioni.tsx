"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronRight, Bot, ListChecks, BookOpen, CheckCircle2, XCircle, RotateCcw, Lightbulb, Zap } from "lucide-react";
import { istante } from "@/lib/format";
import { spiegaAzione } from "@/lib/spiega-azione";
import Aggiornato from "@/components/Aggiornato";

// L'UNICO posto dove si approva. Tre cose, in un riquadro solo:
//  💡 Proposte dal giro  → le idee fresche dell'analisi oraria (briefing) → approvi → l'AD le realizza.
//  📋 Coda da firmare    → le mosse pronte dei senior (vault + sentinelle), con la scheda completa
//                          e il controllo qualità (Livello 2) + le lezioni apprese.
//  🤖 Autopilota + 📒 Registro → il motore (🟢 in automatico) e lo storico dei risultati.

type Livello = "verde" | "giallo" | "rosso" | "?";
type Stato = "" | "rifiutata" | "fatta" | "simulata" | "coda";
type Azione = {
  id: string; titolo: string; reparto: string; livello: Livello;
  canale: string; destinatario: string; perche: string; preparato: string; testo: string;
  fonte: "vault" | "sentinella"; stato: Stato; esito: string;
  cambia?: string; seguito?: string;
  qualita?: { voto: "ok" | "rivedere"; problemi: string[] };
};
type Proposta = { titolo: string; motivo: string; livello: Livello };
type VoceLog = { at: string; id: string; titolo: string; reparto: string; livello: string; stato: string; esito: string; auto: boolean };
type Registro = { voci: VoceLog[]; stat: { totale: number; fatte: number; simulate: number; coda: number; rifiutate: number; auto: number; repartoTop: string } };

const BORDO: Record<string, string> = { rosso: "border-red-200", giallo: "border-amber-200", verde: "border-green-200", "?": "border-black/[0.08]" };
const PALLINO: Record<string, string> = { rosso: "bg-red-500", giallo: "bg-amber-500", verde: "bg-green-500", "?": "bg-black/30" };
const ETICHETTA: Record<string, string> = { rosso: "🔴 serve la tua firma", giallo: "🟡 un tocco", verde: "🟢 sicura", "?": "" };

function badgeStato(s: string): { txt: string; cls: string } | null {
  if (s === "fatta") return { txt: "✅ Inviata", cls: "bg-green-50 text-green-700" };
  if (s === "simulata") return { txt: "🧪 Simulata (test)", cls: "bg-amber-50 text-amber-700" };
  if (s === "coda") return { txt: "⏳ In coda", cls: "bg-black/[0.05] text-black/55" };
  if (s === "rifiutata") return { txt: "✕ rifiutata", cls: "bg-black/[0.05] text-black/50" };
  return null;
}
const quando = istante; // "GG/MM · HH:MM" in Europe/Rome

// La scheda «Se approvi, ecco cosa succede» dentro una card della coda.
function Scheda({ a }: { a: Azione }) {
  return (
    <div className="mt-2.5 rounded-lg border border-brand/15 bg-brand-50/40 px-3 py-2.5 space-y-1.5">
      <div className="text-[10.5px] font-semibold text-brand uppercase tracking-wide">Se approvi, ecco cosa succede</div>
      {spiegaAzione({ reparto: a.reparto, azione: a.titolo, canale: a.canale, contenuto: a.perche, livello: a.livello, cambia: a.cambia, seguito: a.seguito }).map((r) => (
        <p key={r.etichetta} className="text-[11.5px] leading-relaxed text-ink/80">
          <span className="mr-1">{r.ico}</span>
          <span className="font-semibold text-ink/90">{r.etichetta}:</span> {r.testo}
        </p>
      ))}
    </div>
  );
}

export default function Azioni({ proposte = [] }: { proposte?: Proposta[] }) {
  const [tab, setTab] = useState<"dafare" | "registro">("dafare");
  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [salvataggio, setSalvataggio] = useState(false);
  const [collegato, setCollegato] = useState(true);
  const [autopilota, setAutopilota] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aperte, setAperte] = useState<Set<string>>(new Set());
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [aggAt, setAggAt] = useState<number | null>(null);

  // Stato delle proposte dal giro (decise solo a schermo: sono idee fresche, non una coda persistente).
  const [propBusy, setPropBusy] = useState<number | null>(null);
  const [propEsito, setPropEsito] = useState<Record<number, { ok: boolean; msg: string }>>({});
  const [propDecise, setPropDecise] = useState<Set<number>>(new Set());

  const carica = useCallback(async () => {
    const d = await fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (d) {
      setAzioni(d.azioni || []);
      setSalvataggio(Boolean(d.salvataggio));
      setCollegato(Boolean(d.collegato));
      setAutopilota(Boolean(d.autopilota));
    } else setCollegato(false);
    setAggAt(Date.now());
    return d;
  }, []);

  useEffect(() => {
    (async () => {
      const d = await carica();
      if (d?.autopilota) {
        await fetch("/api/azioni-pronte/autopilota", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
        await carica();
      }
      setLoading(false);
    })();
  }, [carica]);

  // Carica il registro alla prima apertura della tab.
  useEffect(() => {
    if (tab === "registro" && !registro) {
      fetch("/api/azioni-registro", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setRegistro({ voci: d.voci || [], stat: d.stat || {} }))
        .catch(() => setRegistro({ voci: [], stat: { totale: 0, fatte: 0, simulate: 0, coda: 0, rifiutate: 0, auto: 0, repartoTop: "" } }));
    }
  }, [tab, registro]);

  function patch(id: string, p: Partial<Azione>) {
    setAzioni((list) => list.map((a) => (a.id === id ? { ...a, ...p } : a)));
  }
  // Coda da firmare: approva/rifiuta passano dalle «mani» (esegue/simula) e si registrano.
  async function decidi(id: string, dec: "approva" | "rifiuta" | "annulla") {
    if (dec === "approva") patch(id, { stato: "coda", esito: "Invio in corso…" });
    else if (dec === "rifiuta") patch(id, { stato: "rifiutata", esito: "" });
    else patch(id, { stato: "", esito: "" });
    try {
      const r = await fetch("/api/azioni-pronte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decisione: dec }) }).then((x) => x.json());
      if (r && typeof r.stato === "string") patch(id, { stato: r.stato as Stato, esito: r.esito || "" });
      setRegistro(null); // il registro si ricaricherà
    } catch {
      /* ignora */
    }
  }
  // Proposte dal giro: approvarle le manda all'esecutore (o al cervello per i passi).
  async function approvaProposta(i: number, p: Proposta) {
    setPropBusy(i);
    try {
      const r = await fetch("/api/esegui", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ azione: p }) }).then((x) => x.json());
      const ok = Boolean(r?.ok);
      const msg = r?.collegato
        ? (ok ? `✅ Eseguito${r.risultato ? ": " + r.risultato : ""}` : `⚠️ Non riuscito${r.risultato ? ": " + r.risultato : ""}`)
        : "📨 Mandata al cervello: la trasforma in azione concreta e ti dice i passi.";
      setPropEsito((s) => ({ ...s, [i]: { ok, msg } }));
      setPropDecise((s) => new Set(s).add(i));
    } catch {
      setPropEsito((s) => ({ ...s, [i]: { ok: false, msg: "Errore di rete." } }));
    } finally {
      setPropBusy(null);
    }
  }
  function ignoraProposta(i: number) {
    setPropDecise((s) => new Set(s).add(i));
  }

  async function toggleAutopilota() {
    const nuovo = !autopilota;
    setAutopilota(nuovo);
    try {
      await fetch("/api/azioni-pronte/autopilota", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ attiva: nuovo }) });
      await carica();
      setRegistro(null);
    } catch {
      /* ignora */
    }
  }
  const toggle = (id: string) =>
    setAperte((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const daDecidere = azioni.filter((a) => !a.stato).length;
  const proposteVive = proposte.filter((_, i) => !propDecise.has(i)).length;
  const vuoto = azioni.length === 0 && proposte.length === 0;
  // 🏆 Qualità (Livello 2): quante mosse da firmare sono verificate / da rivedere.
  const qVerificate = azioni.filter((a) => !a.stato && a.qualita?.voto === "ok").length;
  const qDaRivedere = azioni.filter((a) => !a.stato && a.qualita?.voto === "rivedere").length;
  // 📚 Auto-miglioramento: i problemi di qualità più ricorrenti = le "lezioni".
  const lezioni: [string, number][] = (() => {
    const m: Record<string, number> = {};
    for (const a of azioni) for (const p of a.qualita?.problemi || []) m[p] = (m[p] || 0) + 1;
    return Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 4);
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">⚡ Azioni</h2>
          <p className="t-eti mt-0.5">L'unico posto dove firmi: le proposte fresche del giro e la coda pronta. Più Autopilota e Registro.</p>
        </div>
        <Aggiornato at={aggAt} className="mt-1 shrink-0" />
      </div>

      {/* tab */}
      <div className="flex gap-1.5">
        {[
          { id: "dafare", label: "Da approvare", icon: <ListChecks size={14} /> },
          { id: "registro", label: "Registro & risultati", icon: <BookOpen size={14} /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as "dafare" | "registro")}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "bg-brand text-white shadow-card" : "bg-paper/60 text-black/60 hover:bg-black/[0.05]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== DA APPROVARE ===== */}
      {tab === "dafare" && (
        <>
          <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 text-[12.5px] text-ink/85 flex items-start gap-2">
            <Zap size={15} className="text-brand mt-0.5 shrink-0" />
            <span>
              Quando approvi, l'azione parte dalle «mani»: invia <b>davvero</b> solo con la chiave e l'interruttore attivi;
              altrimenti la <b>simula</b> o resta <b>in coda</b>. <b>Mai invii per sbaglio.</b>
            </span>
          </div>

          {/* 💡 PROPOSTE DAL GIRO — idee fresche dell'analisi oraria */}
          {proposte.length > 0 && (
            <div className="space-y-2">
              <div className="t-micro flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-500" /> Proposte fresche dal giro · {proposteVive} da valutare
              </div>
              <p className="t-eti -mt-1">Idee appena scoperte dall'AD nell'analisi oraria. Approvarle le trasforma in azioni concrete.</p>
              {proposte.map((p, i) => {
                const decisa = propDecise.has(i);
                const e = propEsito[i];
                return (
                  <div key={i} className={`card border ${BORDO[p.livello]} p-4 ${decisa ? "opacity-80" : ""}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PALLINO[p.livello]}`} />
                      <div className="min-w-0 flex-1">
                        <div className="t-sez leading-snug">{p.titolo}</div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                          <span className="badge badge-on">💡 dal giro</span>
                          {ETICHETTA[p.livello] && <span className="t-eti">{ETICHETTA[p.livello]}</span>}
                        </div>
                        <p className="t-corpo mt-2">{p.motivo}</p>
                      </div>
                    </div>
                    {e && <p className={`t-eti mt-2 ${e.ok ? "text-green-700" : "text-ink/70"}`}>{e.msg}</p>}
                    {!decisa && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button onClick={() => approvaProposta(i, p)} disabled={propBusy === i} className="inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3.5 py-2 rounded-xl shadow-card hover:bg-brand-dark active:scale-[0.98] transition disabled:opacity-50">
                          {propBusy === i ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approva
                        </button>
                        <button onClick={() => ignoraProposta(i)} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl border border-black/10 text-black/60 hover:bg-black/[0.04] active:scale-[0.98] transition">
                          <XCircle size={15} /> Ignora
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 🤖 AUTOPILOTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={toggleAutopilota}
              className={`inline-flex items-center gap-2 text-[12.5px] font-medium px-3 py-2 rounded-xl border transition ${
                autopilota ? "border-brand/40 bg-brand-50 text-brand" : "border-black/10 text-black/60 hover:bg-black/[0.04]"
              }`}
            >
              <Bot size={15} /> Autopilota azioni sicure 🟢: <b>{autopilota ? "ON" : "OFF"}</b>
            </button>
            <span className="t-eti">Quando è ON, le mosse 🟢 partono da sole e te le segno («🤖 in automatico»). Restano sicure: senza modalità live, simula.</span>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-black/45 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Carico le azioni…
            </div>
          )}
          {!loading && !collegato && azioni.length === 0 && (
            <div className="card p-4 text-sm text-black/55">
              Le azioni le accoda l'AD in <code className="bg-black/[0.06] px-1 rounded">90-Memoria-AI/AZIONI-IN-ATTESA.md</code>. Memoria non raggiungibile ora.
            </div>
          )}
          {!loading && collegato && vuoto && (
            <div className="card p-4 text-sm text-black/55">Nessuna azione pronta adesso. Quando l'AD prepara una mossa, compare qui.</div>
          )}

          {/* 📋 CODA DA FIRMARE — mosse pronte dei senior, con scheda + qualità */}
          {!loading && azioni.length > 0 && (
            <>
              <div className="t-micro flex items-center gap-1.5">
                <ListChecks size={13} className="text-brand" /> Coda pronta dai senior · {daDecidere} da firmare
                {daDecidere > 0 && <span className="t-eti">· 🏆 {qVerificate} verificate · ⚠️ {qDaRivedere} da rivedere</span>}
              </div>

              {/* 📚 LEZIONI APPRESE — auto-miglioramento dai problemi di qualità ricorrenti */}
              {lezioni.length > 0 && (
                <div className="card border border-amber-200 bg-amber-50/40 p-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px]">📚</span>
                    <span className="t-sez">Lezioni apprese <span className="t-eti">(auto-miglioramento)</span></span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {lezioni.map(([p, n]) => (
                      <div key={p} className="flex items-center gap-2 text-[12.5px] text-ink/85">
                        <span className="badge badge-off shrink-0">{n}×</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                  <p className="t-eti mt-2">Sono gli errori di qualità più ricorrenti: l'AD li tiene presenti quando prepara le prossime mosse, così migliora da solo.</p>
                </div>
              )}

              <div className="space-y-2.5">
                {azioni.map((a) => {
                  const decisa = a.stato !== "";
                  const open = aperte.has(a.id);
                  const b = badgeStato(a.stato);
                  return (
                    <div key={a.id} className={`card border ${BORDO[a.livello]} p-4 ${decisa ? "opacity-80" : ""}`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PALLINO[a.livello]}`} />
                        <div className="min-w-0 flex-1">
                          <div className="t-sez leading-snug">{a.titolo}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            <span className="badge badge-off">{a.reparto}</span>
                            {ETICHETTA[a.livello] && <span className="t-eti">{ETICHETTA[a.livello]}</span>}
                            {a.fonte === "sentinella" && <span className="badge badge-on">🛡️ da sentinella</span>}
                            {a.qualita?.voto === "rivedere" && (
                              <span className="badge bg-amber-50 text-amber-700" title={a.qualita.problemi.join(" · ")}>⚠️ qualità: da rivedere</span>
                            )}
                            {a.qualita?.voto === "ok" && !decisa && (
                              <span className="badge bg-green-50 text-green-700">✅ qualità ok</span>
                            )}
                          </div>
                        </div>
                        {b && <span className={`badge shrink-0 ${b.cls}`}>{b.txt}</span>}
                      </div>

                      <p className="t-corpo mt-2">{a.perche}</p>
                      <div className="t-eti mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        {a.preparato && <span>preparato da {a.preparato}</span>}
                        {a.canale && <span>· canale: {a.canale}</span>}
                      </div>

                      {a.qualita?.voto === "rivedere" && a.qualita.problemi.length > 0 && (
                        <div className="mt-2 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                          ⚠️ Da sistemare prima di inviare: {a.qualita.problemi.join(" · ")}
                        </div>
                      )}

                      {a.testo && (
                        <div className="mt-2.5">
                          <button onClick={() => toggle(a.id)} className="t-eti hover:text-brand inline-flex items-center gap-1 transition">
                            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Anteprima del testo
                          </button>
                          {open && (
                            <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12.5px] text-ink/85 leading-relaxed border-l-2 border-brand/20 pl-3 bg-paper/40 rounded-r-lg py-2">
                              {a.testo}
                            </pre>
                          )}
                        </div>
                      )}

                      {!decisa && <Scheda a={a} />}
                      {decisa && a.esito && <p className="t-eti mt-2 text-ink/70">{a.esito}</p>}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {!decisa ? (
                          <>
                            <button onClick={() => decidi(a.id, "approva")} className="inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3.5 py-2 rounded-xl shadow-card hover:bg-brand-dark active:scale-[0.98] transition">
                              <CheckCircle2 size={15} /> Approva e fai
                            </button>
                            <button onClick={() => decidi(a.id, "rifiuta")} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl border border-black/10 text-black/60 hover:bg-black/[0.04] active:scale-[0.98] transition">
                              <XCircle size={15} /> Rifiuta
                            </button>
                          </>
                        ) : (
                          <button onClick={() => decidi(a.id, "annulla")} className="inline-flex items-center gap-1.5 t-eti hover:text-brand transition">
                            <RotateCcw size={13} /> annulla
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!salvataggio && (
                <p className="t-eti">
                  ⚠️ Le decisioni non si salvano ancora: collega la memoria (tabella «impostazioni») e resteranno anche dopo il refresh e su ogni dispositivo.
                </p>
              )}
            </>
          )}
        </>
      )}

      {/* ===== REGISTRO & RISULTATI ===== */}
      {tab === "registro" && (
        <>
          {!registro && (
            <div className="flex items-center gap-2 text-black/45 text-sm py-4">
              <Loader2 size={16} className="animate-spin" /> Carico il registro…
            </div>
          )}
          {registro && (
            <>
              {/* conteggi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { l: "Totale", v: registro.stat.totale },
                  { l: "✅ Inviate", v: registro.stat.fatte },
                  { l: "🧪 Simulate", v: registro.stat.simulate },
                  { l: "⏳ In coda", v: registro.stat.coda },
                  { l: "✕ Rifiutate", v: registro.stat.rifiutate },
                  { l: "🤖 Automatiche", v: registro.stat.auto },
                ].map((c) => (
                  <div key={c.l} className="rounded-xl border border-black/[0.06] bg-paper/40 p-2.5">
                    <div className="text-[10.5px] text-black/55 leading-tight">{c.l}</div>
                    <div className="text-[19px] font-semibold tracking-tight mt-0.5 tabular-nums">{c.v ?? 0}</div>
                  </div>
                ))}
              </div>

              {/* lettura / cosa ho imparato */}
              <div className="card p-4">
                <div className="sez-head mb-2">
                  <span className="sez-ico"><BookOpen size={16} /></span>
                  <span className="t-sez">Cosa ho imparato</span>
                </div>
                {registro.stat.totale > 0 ? (
                  <p className="t-corpo">
                    Hai messo in moto <b>{registro.stat.totale}</b> mosse: {registro.stat.fatte} inviate, {registro.stat.simulate} simulate,{" "}
                    {registro.stat.coda} in attesa delle mani, {registro.stat.rifiutate} rifiutate ({registro.stat.auto} in automatico).
                    {registro.stat.repartoTop ? ` Reparto più attivo: ${registro.stat.repartoTop}.` : ""}{" "}
                    Per capire se hanno reso, confronta i numeri prima/dopo nell'area <b>Numeri</b>.
                  </p>
                ) : (
                  <p className="t-eti">Ancora nessuna azione registrata. Appena approvi (o l'autopilota agisce), qui trovi la storia e i conteggi. Serve la memoria collegata.</p>
                )}
              </div>

              {/* elenco */}
              {registro.voci.length > 0 && (
                <div className="space-y-1.5">
                  {registro.voci.map((v, i) => {
                    const b = badgeStato(v.stato);
                    return (
                      <div key={i} className="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-paper/40 px-2.5 py-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PALLINO[v.livello] || "bg-black/30"}`} />
                        <span className="text-[12.5px] text-ink/85 truncate flex-1">
                          {v.auto && "🤖 "}
                          {v.titolo}
                        </span>
                        {v.reparto && <span className="badge badge-off shrink-0">{v.reparto}</span>}
                        {b && <span className={`badge shrink-0 ${b.cls}`}>{b.txt}</span>}
                        <span className="t-eti shrink-0">{quando(v.at)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
