"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronDown, ChevronRight, Bot, ListChecks, BookOpen, CheckCircle2, XCircle, RotateCcw, Lightbulb, Zap, Footprints, ListTodo, FileText, ArrowRight, ShieldAlert, Swords } from "lucide-react";
import { istante, testoPulito } from "@/lib/format";
import { spiegaAzione } from "@/lib/spiega-azione";
import Aggiornato from "@/components/Aggiornato";
import { vaiArea, EVENTO_VAI, type DettaglioVai } from "@/lib/nav";
import { risolviOrigine } from "@/lib/origine";
import Arsenale from "@/components/Arsenale";

// L'UNICO posto dove si decide e si agisce. Schede separate (niente colonna unica lunga da scrollare):
//  🦶 Mosse di Nicola → le tue prossime mosse (dai Piani), con link all'azione da firmare.
//  💡 Proposte dal giro → le idee fresche dell'analisi oraria → approvi → l'AD le realizza.
//  ✅ Cose da fare → la tua checklist personale (spuntabile).
//  🛡️ Sentinelle → gli allarmi sui dati reali; ognuno linka all'azione che l'AD ha già preparato.
//  🖊️ Da approvare → la coda pronta dei senior, con scheda completa + qualità + cosa-fa.
//  📒 Registro → lo storico dei risultati.

type Tab = "mosse" | "proposte" | "dafare" | "sentinelle" | "approvare" | "registro" | "arsenale";
type Livello = "verde" | "giallo" | "rosso" | "?";
type Stato = "" | "rifiutata" | "fatta" | "simulata" | "coda";
type Azione = {
  id: string; titolo: string; reparto: string; livello: Livello;
  canale: string; destinatario: string; perche: string; preparato: string; testo: string;
  fonte: "vault" | "sentinella"; stato: Stato; esito: string;
  cambia?: string; seguito?: string; origine?: string;
  qualita?: { voto: "ok" | "rivedere"; problemi: string[] };
};
type Proposta = { titolo: string; motivo: string; livello: Livello };
type Alert = { id?: string; livello: "rosso" | "giallo"; titolo: string; perche: string; cosaFare: string };
type VoceLog = { at: string; id: string; titolo: string; reparto: string; livello: string; stato: string; esito: string; auto: boolean };
type Registro = { voci: VoceLog[]; stat: { totale: number; fatte: number; simulate: number; coda: number; rifiutate: number; auto: number; repartoTop: string } };
type Mossa = { titolo: string; quando?: string; come?: string; priorita?: "alta" | "media" | "bassa"; ad_prepara?: string; senior?: string; colore?: string };
type Lacuna = { ambito?: string; cosa_manca: string; domanda_per_nicola: string };
type Intenzioni = { collegato: boolean; data?: string; sintesi?: string; prossime_mosse: Mossa[]; primi_negozi: { nome: string; perche?: string; stato?: string }[]; rischi: string[]; serve_da_nicola: Lacuna[] };
type TodoItem = { id: string; testo: string; livello: Livello; sezione: string; fatto: boolean };
type SchedaDoc = { loading: boolean; testo?: string; err?: string };

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
const quando = istante;

// Estrae un percorso di documento (consegne/… o creativi/….md) dal testo dell'azione.
function estraiPath(s: string): string | null {
  const m = (s || "").match(/(consegne|creativi)\/[A-Za-z0-9 _./-]+\.md/);
  return m ? m[0] : null;
}
// Parole-chiave significative di un titolo (per collegare una mossa/sentinella alla sua azione da firmare).
const STOP = new Set(["firmare", "portare", "aprire", "fare", "della", "delle", "degli", "come", "questa", "questo", "subito", "entro", "prima", "anche", "nicola", "sblocca", "sbloccare", "azione", "azioni", "mossa", "live", "prepara", "gestisci"]);
function chiavi(s: string): string[] {
  return ((s || "").toLowerCase().match(/[a-zàèéìòù0-9]{4,}/g) || []).filter((w) => !STOP.has(w));
}

// La scheda «Se approvi, ecco cosa succede» dentro una card della coda: finestra
// che si apre e si chiude (chiusa di default), così la card resta compatta.
function Scheda({ a, open, onToggle }: { a: Azione; open: boolean; onToggle: () => void }) {
  return (
    <div className="mt-2.5 rounded-lg border border-brand/15 bg-brand-50/40 px-3 py-2.5">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-1.5 text-[10.5px] font-semibold text-brand uppercase tracking-wide"
      >
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        Se approvi, ecco cosa succede
      </button>
      {open && (
        <div className="mt-1.5 space-y-1.5">
          {spiegaAzione({ reparto: a.reparto, azione: a.titolo, canale: a.canale, contenuto: a.perche, livello: a.livello, cambia: a.cambia, seguito: a.seguito }).map((r) => (
            <p key={r.etichetta} className="text-[11.5px] leading-relaxed text-ink/80">
              <span className="mr-1">{r.ico}</span>
              <span className="font-semibold text-ink/90">{r.etichetta}:</span> {r.testo}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Azioni({ proposte = [] }: { proposte?: Proposta[] }) {
  const [tab, setTab] = useState<Tab>("mosse");
  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [salvataggio, setSalvataggio] = useState(false);
  const [collegato, setCollegato] = useState(true);
  const [autopilota, setAutopilota] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aperte, setAperte] = useState<Set<string>>(new Set());
  // Finestre «Se approvi, ecco cosa succede» aperte (chiuse di default → card compatta).
  const [schedeAperte, setSchedeAperte] = useState<Set<string>>(new Set());
  const [schede, setSchede] = useState<Record<string, SchedaDoc>>({});
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [aggAt, setAggAt] = useState<number | null>(null);

  const [intenzioni, setIntenzioni] = useState<Intenzioni | null>(null);
  const [todo, setTodo] = useState<TodoItem[]>([]);
  const [todoSalva, setTodoSalva] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

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
    fetch("/api/memoria/intenzioni", { cache: "no-store" }).then((r) => r.json()).then((i) => setIntenzioni(i)).catch(() => {});
    fetch("/api/memoria/todo", { cache: "no-store" }).then((r) => r.json()).then((t) => { setTodo(t.items || []); setTodoSalva(Boolean(t.salvataggio)); }).catch(() => {});
    fetch("/api/alert", { cache: "no-store" }).then((r) => r.json()).then((a) => setAlerts(a.alert || [])).catch(() => {});
  }, [carica]);

  // Salto da un'altra area (Plancia → #azioni-mosse): apri la scheda giusta.
  useEffect(() => {
    const apriDaHash = () => {
      const h = (typeof window !== "undefined" ? window.location.hash : "").replace("#", "");
      const map: Record<string, Tab> = { "azioni-mosse": "mosse", "azioni-proposte": "proposte", "azioni-dafare": "dafare", "azioni-sentinelle": "sentinelle", "azioni-approvare": "approvare", "azioni-arsenale": "arsenale" };
      if (map[h]) setTab(map[h]);
    };
    apriDaHash();
    window.addEventListener("hashchange", apriDaHash);
    return () => window.removeEventListener("hashchange", apriDaHash);
  }, []);

  // Link bidirezionali: quando si arriva nell'area Azioni puntando una scheda specifica, aprila
  // (es. da un difetto/domanda nel Cervello → "vai all'azione" apre "Da approvare").
  useEffect(() => {
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "azioni" || !det.sub) return;
      const valide: Tab[] = ["mosse", "proposte", "dafare", "sentinelle", "approvare", "registro", "arsenale"];
      if (valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
    };
    window.addEventListener(EVENTO_VAI, onVai);
    return () => window.removeEventListener(EVENTO_VAI, onVai);
  }, []);

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
  async function decidi(id: string, dec: "approva" | "rifiuta" | "annulla") {
    if (dec === "approva") patch(id, { stato: "coda", esito: "Invio in corso…" });
    else if (dec === "rifiuta") patch(id, { stato: "rifiutata", esito: "" });
    else patch(id, { stato: "", esito: "" });
    try {
      const r = await fetch("/api/azioni-pronte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decisione: dec }) }).then((x) => x.json());
      if (r && typeof r.stato === "string") patch(id, { stato: r.stato as Stato, esito: r.esito || "" });
      setRegistro(null);
    } catch {
      /* ignora */
    }
  }
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
  async function spunta(item: TodoItem) {
    const nuovo = !item.fatto;
    setTodo((list) => list.map((t) => (t.id === item.id ? { ...t, fatto: nuovo } : t)));
    try {
      await fetch("/api/memoria/todo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, fatto: nuovo }) });
    } catch {
      /* se fallisce, alla prossima ricarica torna lo stato del server */
    }
  }
  const toggle = (id: string) =>
    setAperte((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleScheda = (id: string) =>
    setSchedeAperte((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  async function apriScheda(id: string, path: string) {
    if (schede[id]?.testo || schede[id]?.loading) return;
    setSchede((s) => ({ ...s, [id]: { loading: true } }));
    try {
      const r = await fetch(`/api/azione-scheda?path=${encodeURIComponent(path)}`, { cache: "no-store" }).then((x) => x.json());
      setSchede((s) => ({ ...s, [id]: { loading: false, testo: r.ok ? r.testo : undefined, err: r.ok ? undefined : (r.error || "Non trovato") } }));
    } catch {
      setSchede((s) => ({ ...s, [id]: { loading: false, err: "Errore di rete" } }));
    }
  }
  // Da una mossa/sentinella, trova l'azione da firmare collegata (match per parole chiave) e vacci.
  function vaiAllAzione(titolo: string) {
    const k = chiavi(titolo);
    let best: Azione | null = null;
    let bestScore = 0;
    for (const a of azioni) {
      if (a.stato) continue;
      const testo = `${a.titolo} ${a.perche}`.toLowerCase();
      const score = k.reduce((n, w) => n + (testo.includes(w) ? 1 : 0), 0);
      if (score > bestScore) { bestScore = score; best = a; }
    }
    setTab("approvare");
    if (best && bestScore > 0) {
      const id = best.id;
      setAperte((s) => new Set(s).add(id));
      setTimeout(() => document.getElementById(`azione-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
    }
  }

  const daDecidere = azioni.filter((a) => !a.stato).length;
  const proposteVive = proposte.filter((_, i) => !propDecise.has(i)).length;
  const daFareTodo = todo.filter((t) => !t.fatto);
  const mosse = intenzioni?.collegato ? intenzioni.prossime_mosse : [];
  const qVerificate = azioni.filter((a) => !a.stato && a.qualita?.voto === "ok").length;
  const qDaRivedere = azioni.filter((a) => !a.stato && a.qualita?.voto === "rivedere").length;
  const lezioni: [string, number][] = (() => {
    const m: Record<string, number> = {};
    for (const a of azioni) for (const p of a.qualita?.problemi || []) m[p] = (m[p] || 0) + 1;
    return Object.entries(m).sort((x, y) => y[1] - x[1]).slice(0, 4);
  })();

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "mosse", label: "Mosse di Nicola", icon: <Footprints size={14} />, badge: mosse.length || undefined },
    { id: "proposte", label: "Proposte dal giro", icon: <Lightbulb size={14} />, badge: proposteVive || undefined },
    { id: "dafare", label: "Cose da fare", icon: <ListTodo size={14} />, badge: daFareTodo.length || undefined },
    { id: "sentinelle", label: "Sentinelle", icon: <ShieldAlert size={14} />, badge: alerts.length || undefined },
    { id: "approvare", label: "Da approvare", icon: <ListChecks size={14} />, badge: daDecidere || undefined },
    { id: "registro", label: "Registro", icon: <BookOpen size={14} /> },
    { id: "arsenale", label: "Arsenale", icon: <Swords size={14} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="t-area">⚡ Azioni</h2>
          <p className="t-eti mt-0.5">Le tue mosse, le proposte fresche, la checklist, le sentinelle e la coda da firmare — ognuna nella sua scheda.</p>
        </div>
        <Aggiornato at={aggAt} className="mt-1 shrink-0" />
      </div>

      {/* tab */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-lg transition ${
              tab === t.id ? "bg-brand text-white shadow-card" : "bg-paper/60 text-black/60 hover:bg-black/[0.05]"
            }`}
          >
            {t.icon}
            {t.label}
            {t.badge != null && (
              <span className={`ml-0.5 text-[11px] px-1.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-amber-100 text-amber-700"}`}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== MOSSE DI NICOLA ===== */}
      {tab === "mosse" && (
        <div className="space-y-3">
          {!intenzioni?.collegato && <p className="text-[13px] text-black/55 py-4 text-center">L'AD non ha ancora letto i tuoi Piani. Lancia un giro e qui compaiono le tue prossime mosse.</p>}
          {intenzioni?.collegato && (
            <>
              {intenzioni.data && <p className="t-eti">🕗 Letto dai Piani · {intenzioni.data}</p>}
              {intenzioni.sintesi && <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 text-[13px] text-ink/90">{intenzioni.sintesi}</div>}
              {mosse.map((m, i) => {
                const c = m.priorita === "alta" ? "border-red-200 bg-red-50/40" : m.priorita === "media" ? "border-amber-200 bg-amber-50/40" : "border-black/[0.07] bg-paper/40";
                return (
                  <div id={`mossa-${i + 1}`} key={i} className={`rounded-xl border p-3 scroll-mt-24 ${c}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-[12px] font-mono text-black/40 mt-0.5 shrink-0">{i + 1}.</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-ink/90">{m.colore ? `${m.colore} ` : ""}{m.titolo}</div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-black/50 mt-0.5">
                          {m.quando && <span>🗓️ {m.quando}</span>}
                          {m.senior && <span className="text-brand">{m.senior}</span>}
                          {m.priorita && <span>priorità: {m.priorita}</span>}
                        </div>
                        {m.come && <div className="text-[12px] text-black/65 mt-1">Come: {m.come}</div>}
                        {m.ad_prepara && <div className="text-[12px] text-ink/80 mt-1">🤖 L'AD prepara: {m.ad_prepara}</div>}
                        <button onClick={() => vaiAllAzione(m.titolo)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
                          <ArrowRight size={13} /> Vai all'azione da firmare
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {intenzioni.serve_da_nicola.length > 0 && (
                <div className="rounded-xl border border-black/[0.07] bg-paper/40 p-3">
                  <div className="t-micro mb-1">🙋 Cosa serve da te (decisioni mancanti)</div>
                  {intenzioni.serve_da_nicola.map((l, i) => (
                    <div key={i} className="mb-1.5">
                      <div className="text-[13px] text-ink/90">{l.domanda_per_nicola}</div>
                      {l.cosa_manca && <div className="text-[11px] text-black/50">{l.cosa_manca}</div>}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== PROPOSTE DAL GIRO ===== */}
      {tab === "proposte" && (
        <div className="space-y-2">
          <p className="t-eti">Idee appena scoperte dall'AD nell'analisi oraria. Approvarle le trasforma in azioni concrete.</p>
          {proposte.length === 0 && <p className="text-[13px] text-black/55 py-4 text-center">Nessuna proposta fresca adesso. Compaiono dopo ogni giro dell'AD.</p>}
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

      {/* ===== COSE DA FARE (checklist) ===== */}
      {tab === "dafare" && (
        <div className="space-y-3">
          {!todoSalva && todo.length > 0 && (
            <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">⚠️ Le spunte non si salvano ancora: collega la memoria («impostazioni») e resteranno su ogni dispositivo.</p>
          )}
          {todo.length === 0 && <p className="text-[13px] text-black/55 py-4 text-center">Nessuna cosa da fare. L'AD scrive l'elenco in CHECKLIST-NICOLA.md.</p>}
          {Array.from(new Set(todo.map((t) => t.sezione))).map((sez) => (
            <div key={sez || "_"}>
              {sez && <div className="t-micro mb-1.5">{sez}</div>}
              <div className="space-y-1.5">
                {todo.filter((t) => t.sezione === sez).map((item) => {
                  const c = item.livello === "rosso" ? "border-red-200 bg-red-50/60" : item.livello === "giallo" ? "border-amber-200 bg-amber-50/60" : "border-green-200 bg-green-50/50";
                  return (
                    <button key={item.id} onClick={() => spunta(item)} className={`w-full text-left flex items-start gap-2.5 rounded-xl border p-2.5 transition active:scale-[0.99] ${item.fatto ? "border-black/[0.06] bg-black/[0.02] opacity-60" : c}`}>
                      <span className={`mt-0.5 grid place-items-center w-5 h-5 rounded-md border shrink-0 ${item.fatto ? "bg-brand border-brand text-white" : "border-black/25 bg-white"}`}>
                        {item.fatto && <CheckCircle2 size={13} />}
                      </span>
                      <span className={`text-[13px] leading-snug ${item.fatto ? "line-through text-black/45" : "text-ink/90"}`}>{testoPulito(item.testo)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {todo.length > 0 && <p className="t-eti pt-1">{daFareTodo.length} da fare · {todo.length - daFareTodo.length} fatte. Tocca una voce per spuntarla.</p>}
        </div>
      )}

      {/* ===== SENTINELLE (allarmi → azione preparata) ===== */}
      {tab === "sentinelle" && (
        <div className="space-y-2.5">
          <p className="t-eti">Allarmi sui dati reali del marketplace. Per ognuno, l'AD ha già capito la mossa: il link ti porta all'azione da firmare.</p>
          {alerts.length === 0 && <p className="text-[13px] text-green-700 py-4 text-center flex items-center justify-center gap-1.5"><CheckCircle2 size={15} /> Nessun allarme attivo: tutto sotto controllo.</p>}
          {alerts.map((al, i) => {
            const rosso = al.livello === "rosso";
            return (
              <div id={al.id ? `alert-${al.id}` : undefined} key={i} className={`rounded-xl border p-3 scroll-mt-24 ${rosso ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60"}`}>
                <div className="flex items-start gap-2">
                  <ShieldAlert size={15} className={`mt-0.5 shrink-0 ${rosso ? "text-red-600" : "text-amber-600"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-ink/90">{rosso ? "🔴" : "🟡"} {al.titolo}</div>
                    <div className="text-[12px] text-black/60 mt-0.5">{al.perche}</div>
                    <div className="text-[12px] text-ink/80 mt-1">→ {al.cosaFare}</div>
                    <button onClick={() => vaiAllAzione(al.titolo)} className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-brand hover:underline">
                      <ArrowRight size={13} /> Vai all'azione da firmare
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== DA APPROVARE (coda) ===== */}
      {tab === "approvare" && (
        <>
          <div className="rounded-xl border border-brand/20 bg-brand-50/40 p-3 text-[12.5px] text-ink/85 flex items-start gap-2">
            <Zap size={15} className="text-brand mt-0.5 shrink-0" />
            <span>Quando approvi, l'azione parte dalle «mani»: invia <b>davvero</b> solo con la chiave e l'interruttore attivi; altrimenti la <b>simula</b> o resta <b>in coda</b>. <b>Mai invii per sbaglio.</b></span>
          </div>

          {/* Autopilota */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={toggleAutopilota} className={`inline-flex items-center gap-2 text-[12.5px] font-medium px-3 py-2 rounded-xl border transition ${autopilota ? "border-brand/40 bg-brand-50 text-brand" : "border-black/10 text-black/60 hover:bg-black/[0.04]"}`}>
              <Bot size={15} /> Autopilota azioni sicure 🟢: <b>{autopilota ? "ON" : "OFF"}</b>
            </button>
            <span className="t-eti">Quando è ON, le mosse 🟢 partono da sole e te le segno. Restano sicure: senza modalità live, simula.</span>
          </div>

          {loading && <div className="flex items-center gap-2 text-black/45 text-sm py-4"><Loader2 size={16} className="animate-spin" /> Carico le azioni…</div>}
          {!loading && !collegato && azioni.length === 0 && (
            <div className="card p-4 text-sm text-black/55">Le azioni le accoda l'AD in <code className="bg-black/[0.06] px-1 rounded">90-Memoria-AI/AZIONI-IN-ATTESA.md</code>. Memoria non raggiungibile ora.</div>
          )}
          {!loading && collegato && azioni.length === 0 && <div className="card p-4 text-sm text-black/55">Nessuna azione pronta adesso. Quando l'AD prepara una mossa, compare qui.</div>}

          {!loading && azioni.length > 0 && (
            <>
              <div className="t-micro flex items-center gap-1.5">
                <ListChecks size={13} className="text-brand" /> Coda pronta dai senior · {daDecidere} da firmare
                {daDecidere > 0 && <span className="t-eti">· 🏆 {qVerificate} verificate · ⚠️ {qDaRivedere} da rivedere</span>}
              </div>

              {lezioni.length > 0 && (
                <div className="card border border-amber-200 bg-amber-50/40 p-3.5">
                  <div className="flex items-center gap-2"><span className="text-[15px]">📚</span><span className="t-sez">Lezioni apprese <span className="t-eti">(auto-miglioramento)</span></span></div>
                  <div className="mt-2 space-y-1">{lezioni.map(([p, n]) => <div key={p} className="flex items-center gap-2 text-[12.5px] text-ink/85"><span className="badge badge-off shrink-0">{n}×</span><span>{p}</span></div>)}</div>
                </div>
              )}

              <div className="space-y-2.5">
                {azioni.map((a) => {
                  const decisa = a.stato !== "";
                  const open = aperte.has(a.id);
                  const b = badgeStato(a.stato);
                  const path = estraiPath(a.testo) || estraiPath(a.perche);
                  const sch = schede[a.id];
                  return (
                    <div id={`azione-${a.id}`} key={a.id} className={`card border ${BORDO[a.livello]} p-4 scroll-mt-24 ${decisa ? "opacity-80" : ""}`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PALLINO[a.livello]}`} />
                        <div className="min-w-0 flex-1">
                          <div className="t-sez leading-snug">{a.titolo}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            <span className="badge badge-off">{a.reparto}</span>
                            {ETICHETTA[a.livello] && <span className="t-eti">{ETICHETTA[a.livello]}</span>}
                            {a.fonte === "sentinella" && <span className="badge badge-on">🛡️ da sentinella</span>}
                            {a.qualita?.voto === "rivedere" && <span className="badge bg-amber-50 text-amber-700" title={a.qualita.problemi.join(" · ")}>⚠️ qualità: da rivedere</span>}
                            {a.qualita?.voto === "ok" && !decisa && <span className="badge bg-green-50 text-green-700">✅ qualità ok</span>}
                          </div>
                        </div>
                        {b && <span className={`badge shrink-0 ${b.cls}`}>{b.txt}</span>}
                      </div>

                      <p className="t-corpo mt-2">{a.perche}</p>
                      <div className="t-eti mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                        {a.preparato && <span>preparato da {a.preparato}</span>}
                        {a.canale && <span>· canale: {a.canale}</span>}
                      </div>
                      {(() => {
                        const o = risolviOrigine(a.origine);
                        if (o) {
                          return (
                            <button onClick={() => vaiArea(o.vista, o.anchor, o.sub)} className="mt-1.5 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Vai all'origine: {o.etichetta}
                            </button>
                          );
                        }
                        // Senza tag origine: link generico al Cervello (auto-coscienza).
                        return (
                          <button onClick={() => vaiArea("cervello", "auto-coscienza")} className="mt-1.5 inline-flex items-center gap-1 t-eti hover:text-brand transition">
                            <ArrowRight size={12} /> Perché l'ho proposta? Vedi nel Cervello
                          </button>
                        );
                      })()}

                      {a.qualita?.voto === "rivedere" && a.qualita.problemi.length > 0 && (
                        <div className="mt-2 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">⚠️ Da sistemare prima di inviare: {a.qualita.problemi.join(" · ")}</div>
                      )}

                      {/* 📄 Scheda completa: il documento VERO che il senior eseguirà */}
                      {path && (
                        <div className="mt-2.5">
                          <button onClick={() => apriScheda(a.id, path)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline">
                            <FileText size={13} /> Apri scheda completa <span className="text-black/40 font-normal">({path})</span>
                          </button>
                          {sch?.loading && <p className="t-eti mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> carico il documento…</p>}
                          {sch?.err && <p className="t-eti mt-1 text-amber-700">Documento non disponibile ({sch.err}). Serve la memoria collegata.</p>}
                          {sch?.testo && (
                            <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12.5px] text-ink/85 leading-relaxed border-l-2 border-brand/30 pl-3 bg-paper/50 rounded-r-lg py-2 max-h-96 overflow-y-auto">{sch.testo}</pre>
                          )}
                        </div>
                      )}

                      {/* Anteprima breve (se il contenuto NON è un percorso ma testo vero) */}
                      {a.testo && !path && (
                        <div className="mt-2.5">
                          <button onClick={() => toggle(a.id)} className="t-eti hover:text-brand inline-flex items-center gap-1 transition">
                            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Anteprima del testo
                          </button>
                          {open && <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12.5px] text-ink/85 leading-relaxed border-l-2 border-brand/20 pl-3 bg-paper/40 rounded-r-lg py-2">{a.testo}</pre>}
                        </div>
                      )}

                      {!decisa && <Scheda a={a} open={schedeAperte.has(a.id)} onToggle={() => toggleScheda(a.id)} />}
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
                          <button onClick={() => decidi(a.id, "annulla")} className="inline-flex items-center gap-1.5 t-eti hover:text-brand transition"><RotateCcw size={13} /> annulla</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {!salvataggio && <p className="t-eti">⚠️ Le decisioni non si salvano ancora: collega la memoria (tabella «impostazioni») e resteranno anche dopo il refresh e su ogni dispositivo.</p>}
            </>
          )}
        </>
      )}

      {/* ===== ARSENALE ===== */}
      {tab === "arsenale" && <Arsenale />}

      {/* ===== REGISTRO & RISULTATI ===== */}
      {tab === "registro" && (
        <>
          {!registro && <div className="flex items-center gap-2 text-black/45 text-sm py-4"><Loader2 size={16} className="animate-spin" /> Carico il registro…</div>}
          {registro && (
            <>
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
              <div className="card p-4">
                <div className="sez-head mb-2"><span className="sez-ico"><BookOpen size={16} /></span><span className="t-sez">Cosa ho imparato</span></div>
                {registro.stat.totale > 0 ? (
                  <p className="t-corpo">Hai messo in moto <b>{registro.stat.totale}</b> mosse: {registro.stat.fatte} inviate, {registro.stat.simulate} simulate, {registro.stat.coda} in attesa delle mani, {registro.stat.rifiutate} rifiutate ({registro.stat.auto} in automatico).{registro.stat.repartoTop ? ` Reparto più attivo: ${registro.stat.repartoTop}.` : ""} Per capire se hanno reso, confronta i numeri prima/dopo nell'area <b>Numeri</b>.</p>
                ) : (
                  <p className="t-eti">Ancora nessuna azione registrata. Appena approvi (o l'autopilota agisce), qui trovi la storia e i conteggi. Serve la memoria collegata.</p>
                )}
              </div>
              {registro.voci.length > 0 && (
                <div className="space-y-1.5">
                  {registro.voci.map((v, i) => {
                    const b = badgeStato(v.stato);
                    return (
                      <div key={i} className="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-paper/40 px-2.5 py-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PALLINO[v.livello] || "bg-black/30"}`} />
                        <span className="text-[12.5px] text-ink/85 truncate flex-1">{v.auto && "🤖 "}{v.titolo}</span>
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
