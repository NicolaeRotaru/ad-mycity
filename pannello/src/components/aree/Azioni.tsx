"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown, ChevronRight, ListChecks, BookOpen, CheckCircle2, XCircle, RotateCcw, Lightbulb, Zap, Footprints, ListTodo, FileText, ArrowRight, ShieldAlert } from "lucide-react";
import { istante, testoPulito } from "@/lib/format";
import { spiegaAzione, nomeReparto } from "@/lib/spiega-azione";
import Aggiornato from "@/components/Aggiornato";
import { vaiArea, vaiSub, EVENTO_VAI, EVENTO_SUB, type DettaglioVai, type DettaglioSub } from "@/lib/nav";
import { risolviOrigine } from "@/lib/origine";
import ParlaCasella from "@/components/ParlaCasella";
import {
  etichettaScelta,
  isPropostaSceltaAB,
  normalizzaPropostaSceltaAB,
  slugDaTitolo,
  type DecisioneSceltaSalvata,
  type PropostaSceltaAB,
  type SceltaAB,
} from "@/lib/scelta-ab";

// L'UNICO posto dove si decide e si agisce. Schede separate (niente colonna unica lunga da scrollare):
//  🦶 Mosse di Nicola → le tue prossime mosse (dai Piani), con link all'azione da firmare.
//  💡 Proposte dal giro → le idee fresche dell'analisi oraria → approvi → l'AD le realizza.
//  ✅ Cose da fare → la tua checklist personale (spuntabile).
//  🛡️ Sentinelle → gli allarmi sui dati reali; ognuno linka all'azione che l'AD ha già preparato.
//  🖊️ Da approvare → la coda pronta dei senior, con scheda completa + qualità + cosa-fa.
//  📒 Registro → lo storico dei risultati.

type Tab = "mosse" | "proposte" | "dafare" | "sentinelle" | "approvare" | "registro";
type Livello = "verde" | "giallo" | "rosso" | "?";
type Stato = "" | "rifiutata" | "fatta" | "simulata" | "coda";
type Azione = {
  id: string; titolo: string; reparto: string; livello: Livello;
  canale: string; destinatario: string; perche: string; preparato: string; testo: string;
  fonte: "vault" | "sentinella"; stato: Stato; esito: string;
  cambia?: string; seguito?: string; origine?: string;
  qualita?: { voto: "ok" | "rivedere"; problemi: string[] };
};
type Proposta = PropostaSceltaAB & { titolo: string; motivo: string; livello: Livello };
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

// Il pulsante Approva dice COSA succede davvero, in base al canale dell'azione:
// merge di una PR ≠ invio email ≠ pubblicazione. Niente più "Approva e fai" generico.
function etichettaApprova(canale: string): string {
  const c = (canale || "").toLowerCase();
  if (/github|\bmerge\b|\bpr\s*#?\d/.test(c)) return "Approva e mergia";
  if (/e-?mail|mail|resend/.test(c)) return "Approva e invia";
  if (/\big\b|instagram|\bfb\b|facebook|social|telegram|push|notif/.test(c)) return "Approva e pubblica";
  return "Approva e fai";
}

// Id stabile di una proposta del giro (per la persistenza della decisione).
function idProposta(p: { scelta_id?: string; titolo?: string }): string {
  return p.scelta_id || slugDaTitolo(p.titolo || "");
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

// Le righe del riquadro «In parole semplici» dentro ogni card della coda (fix #3):
// il "cosa farà" e "come lo fa" ora sono SEMPRE visibili, non più nascosti in una tendina.
// Prende le voci giuste da spiegaAzione() e le mostra con etichette a misura d'uomo.
function righeInParoleSemplici(a: Azione): { ico: string; etichetta: string; testo: string }[] {
  const s = spiegaAzione({ reparto: a.reparto, azione: a.titolo, canale: a.canale, contenuto: a.perche, livello: a.livello, cambia: a.cambia, seguito: a.seguito });
  const testoDi = (et: string) => s.find((r) => r.etichetta === et)?.testo || "";
  return [
    { ico: "🎯", etichetta: "Cosa farà", testo: testoDi("Cosa cambia") },
    { ico: "✋", etichetta: "Come lo fa", testo: testoDi("Come agisce") },
    { ico: "➡️", etichetta: "Se va bene", testo: testoDi("Se va bene") },
  ].filter((r) => r.testo);
}

export default function Azioni({ proposte = [] }: { proposte?: Proposta[] }) {
  const [tab, setTab] = useState<Tab>("mosse");
  const [azioni, setAzioni] = useState<Azione[]>([]);
  const [salvataggio, setSalvataggio] = useState(false);
  const [collegato, setCollegato] = useState(true);
  const [loading, setLoading] = useState(true);
  const [aperte, setAperte] = useState<Set<string>>(new Set());
  const [schede, setSchede] = useState<Record<string, SchedaDoc>>({});
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [aggAt, setAggAt] = useState<number | null>(null);
  // Busy-lock: id delle azioni con una decisione (approva/rifiuta/annulla) in volo → evita
  // doppi click e doppie POST mentre la richiesta è in corso. (bug: nessun busy-lock)
  const [decidendo, setDecidendo] = useState<Set<string>>(new Set());
  // Decisioni/spunte LOCALI (ottimistiche) da riapplicare quando l'auto-refresh a 60s ricarica
  // dal server: senza memoria collegata il server non le persiste e le sovrascriverebbe. Si
  // auto-puliscono appena il server conferma lo stesso stato. (bug #7: merge, non overwrite)
  const decisiLocaliRef = useRef<Map<string, { stato: Stato; esito: string }>>(new Map());
  const spuntateLocaliRef = useRef<Map<string, boolean>>(new Map());

  const [intenzioni, setIntenzioni] = useState<Intenzioni | null>(null);
  const [todo, setTodo] = useState<TodoItem[]>([]);
  const [todoSalva, setTodoSalva] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Stato effimero delle proposte per ID STABILE (idProposta), non per indice: così dopo un nuovo
  // giro una proposta fresca alla stessa posizione NON eredita lo stato "decisa" di quella vecchia.
  const [propBusy, setPropBusy] = useState<string | null>(null);
  const [propEsito, setPropEsito] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [propDecise, setPropDecise] = useState<Set<string>>(new Set());
  // Decisioni PERSISTENTI sulle proposte (Supabase impostazioni proposta:{id}):
  // sopravvivono a refresh e ai giri successivi — la card non torna più "vergine".
  const [propDecisioni, setPropDecisioni] = useState<Record<string, { decisione: string; at?: string }>>({});
  const [scelteDecisioni, setScelteDecisioni] = useState<Record<string, DecisioneSceltaSalvata>>({});
  const [sceltaBusy, setSceltaBusy] = useState(false);

  const carica = useCallback(async () => {
    const d = await fetch("/api/azioni-pronte", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
    if (d) {
      // Riapplica le decisioni locali che il server non ha (ancora) persistito: se il server
      // riporta l'azione ancora "da decidere" ("") ma qui l'abbiamo decisa, tengo la nostra;
      // se il server ha una decisione sua, mi fido e pulisco il locale. (bug #7)
      setAzioni((d.azioni || []).map((a: Azione) => {
        const loc = decisiLocaliRef.current.get(a.id);
        if (!loc) return a;
        if (a.stato !== "") { decisiLocaliRef.current.delete(a.id); return a; }
        return { ...a, ...loc };
      }));
      setSalvataggio(Boolean(d.salvataggio));
      setCollegato(Boolean(d.collegato));
    } else setCollegato(false);
    setAggAt(Date.now());
    return d;
  }, []);

  // Fetch "di contorno" (intenzioni/todo/alert/scelte/proposte): estratti così si possono
  // ricaricare periodicamente insieme a carica(), non solo al montaggio.
  const caricaContorno = useCallback(() => {
    fetch("/api/memoria/intenzioni", { cache: "no-store" }).then((r) => r.json()).then((i) => setIntenzioni(i)).catch(() => {});
    fetch("/api/memoria/todo", { cache: "no-store" }).then((r) => r.json()).then((t) => {
      // Riapplica le spunte locali non ancora persistite dal server (bug #7): auto-pulizia
      // quando il server conferma lo stesso valore.
      setTodo((t.items || []).map((it: TodoItem) => {
        const loc = spuntateLocaliRef.current.get(it.id);
        if (loc === undefined) return it;
        if (loc === it.fatto) { spuntateLocaliRef.current.delete(it.id); return it; }
        return { ...it, fatto: loc };
      }));
      setTodoSalva(Boolean(t.salvataggio));
    }).catch(() => {});
    fetch("/api/alert", { cache: "no-store" }).then((r) => r.json()).then((a) => setAlerts(a.alert || [])).catch(() => {});
    fetch("/api/scelta-ab", { cache: "no-store" }).then((r) => r.json()).then((d) => { if (d?.decisioni) setScelteDecisioni(d.decisioni); }).catch(() => {});
    fetch("/api/proposta", { cache: "no-store" }).then((r) => r.json()).then((d) => { if (d?.decisioni) setPropDecisioni(d.decisioni); }).catch(() => {});
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
    caricaContorno();
  }, [carica, caricaContorno]);

  // Freschezza: l'area Azioni resta aperta a lungo → ricarica ogni 60s e al ritorno sulla scheda,
  // così ciò che è già stato fatto/approvato (anche da un altro dispositivo o dal worker) non
  // resta stantio e le novità compaiono senza dover cambiare area.
  useEffect(() => {
    const ricarica = () => { carica(); caricaContorno(); };
    const id = setInterval(ricarica, 60000);
    const onVis = () => { if (document.visibilityState === "visible") ricarica(); };
    window.addEventListener("focus", ricarica);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", ricarica);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [carica, caricaContorno]);

  // Ripristino scheda dal tasto INDIETRO (EVENTO_SUB dal popstate centrale) e salto cross-area
  // (EVENTO_VAI da vaiArea / Plancia): un solo canale di cronologia, niente più hash. (contratto nav)
  useEffect(() => {
    const valide: Tab[] = ["mosse", "proposte", "dafare", "sentinelle", "approvare", "registro"];
    const onSub = (e: Event) => {
      const det = (e as CustomEvent<DettaglioSub>).detail;
      if (det?.vista !== "azioni" || !det.sub) return;
      if (valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
    };
    const onVai = (e: Event) => {
      const det = (e as CustomEvent<DettaglioVai>).detail;
      if (det?.vista !== "azioni" || !det.sub) return;
      if (valide.includes(det.sub as Tab)) setTab(det.sub as Tab);
    };
    window.addEventListener(EVENTO_SUB, onSub);
    window.addEventListener(EVENTO_VAI, onVai);
    return () => {
      window.removeEventListener(EVENTO_SUB, onSub);
      window.removeEventListener(EVENTO_VAI, onVai);
    };
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
  // Registra/aggiorna la decisione locale (o la rimuove se torna "da decidere").
  function ricordaLocale(id: string, stato: Stato, esito: string) {
    if (stato === "") decisiLocaliRef.current.delete(id);
    else decisiLocaliRef.current.set(id, { stato, esito });
  }
  async function decidi(id: string, dec: "approva" | "rifiuta" | "annulla") {
    // Busy-lock: se c'è già una decisione in volo per questa azione, ignora il click. (bug: no busy-lock)
    if (decidendo.has(id)) return;
    const prev = azioni.find((a) => a.id === id);
    const prevStato: Stato = prev?.stato ?? "";
    const prevEsito = prev?.esito ?? "";
    const target: { stato: Stato; esito: string } =
      dec === "approva" ? { stato: "coda", esito: "Invio in corso…" }
      : dec === "rifiuta" ? { stato: "rifiutata", esito: "" }
      : { stato: "", esito: "" };
    setDecidendo((s) => new Set(s).add(id));
    patch(id, target);            // update ottimistico
    ricordaLocale(id, target.stato, target.esito);
    try {
      const r = await fetch("/api/azioni-pronte", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, decisione: dec }) }).then((x) => x.json());
      if (r && typeof r.stato === "string") {
        patch(id, { stato: r.stato as Stato, esito: r.esito || "" });
        ricordaLocale(id, r.stato as Stato, r.esito || "");
        setRegistro(null);
      } else {
        // Risposta non valida: rollback allo stato precedente + avviso. (bug: catch vuoto → card bloccata)
        patch(id, { stato: prevStato, esito: "⚠️ Non riuscito, riprova." });
        ricordaLocale(id, prevStato, prevEsito);
      }
    } catch {
      // Rete caduta: rollback, così Nicola non crede di aver messo in coda un'azione 🔴 mai registrata.
      patch(id, { stato: prevStato, esito: "⚠️ Non riuscito, riprova." });
      ricordaLocale(id, prevStato, prevEsito);
    } finally {
      setDecidendo((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }
  // Approva → il CERVELLO (worker AD) la trasforma in azione concreta; la decisione è
  // salvata in Supabase (proposta:{id}) così la card non torna mai più "vergine".
  // (Prima passava da /api/esegui → n8n: binario morto senza n8n e zero persistenza.)
  async function approvaProposta(_i: number, p: Proposta) {
    const pid = idProposta(p);
    setPropBusy(pid);
    try {
      const r = await fetch("/api/proposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisione: "approva", id: pid, titolo: p.titolo, motivo: p.motivo, livello: p.livello }),
      }).then((x) => x.json());
      if (r?.ok) {
        setPropEsito((s) => ({ ...s, [pid]: { ok: true, msg: "📨 Approvata: il cervello la sta trasformando in azione concreta (vedi Lavori). Non tornerà tra le proposte." } }));
        setPropDecise((s) => new Set(s).add(pid));
        setPropDecisioni((s) => ({ ...s, [r.id || pid]: { decisione: "approva", at: new Date().toISOString() } }));
        if (typeof window !== "undefined") window.dispatchEvent(new Event("mycity:lavori"));
      } else {
        setPropEsito((s) => ({ ...s, [pid]: { ok: false, msg: `⚠️ ${r?.error || "Approvazione non riuscita."}` } }));
      }
    } catch {
      setPropEsito((s) => ({ ...s, [pid]: { ok: false, msg: "Errore di rete." } }));
    } finally {
      setPropBusy(null);
    }
  }
  function ignoraProposta(_i: number, p: Proposta) {
    setPropDecise((s) => new Set(s).add(idProposta(p)));
    setPropDecisioni((s) => ({ ...s, [idProposta(p)]: { decisione: "ignora", at: new Date().toISOString() } }));
    // Persistenza best-effort: anche l'Ignora sopravvive a refresh e giri successivi.
    fetch("/api/proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decisione: "ignora", id: idProposta(p), titolo: p.titolo }),
    }).catch(() => {});
  }
  async function decidiSceltaAB(_i: number, p: Proposta, scelta: SceltaAB) {
    const config = normalizzaPropostaSceltaAB(p);
    const pid = idProposta(p);
    setSceltaBusy(true);
    setPropBusy(pid);
    try {
      const r = await fetch("/api/scelta-ab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scelta,
          titolo: p.titolo,
          motivo: p.motivo,
          tipo: p.tipo,
          id: config.id,
          scelta_id: p.scelta_id,
          opzione_a: config.opzione_a,
          opzione_b: config.opzione_b,
          contesto: config.contesto,
          istruzioni: config.istruzioni,
        }),
      }).then((x) => x.json());
      if (!r?.ok) {
        setPropEsito((s) => ({ ...s, [pid]: { ok: false, msg: r?.error || "Salvataggio fallito." } }));
        return;
      }
      const dec = r.decisione as DecisioneSceltaSalvata;
      setScelteDecisioni((prev) => ({ ...prev, [dec.id]: dec }));
      const eti = etichettaScelta(config, dec.scelta);
      setPropEsito((s) => ({
        ...s,
        [pid]: {
          ok: true,
          msg: r.giaRegistrata
            ? `✅ Già registrata: ${eti}`
            : `✅ Registrata ${dec.scelta}. L'AD accoda l'esecuzione 🔴 al prossimo giro; la card non tornerà.`,
        },
      }));
      setPropDecise((s) => new Set(s).add(pid));
    } catch {
      setPropEsito((s) => ({ ...s, [pid]: { ok: false, msg: "Errore di rete." } }));
    } finally {
      setSceltaBusy(false);
      setPropBusy(null);
    }
  }
  async function spunta(item: TodoItem) {
    const nuovo = !item.fatto;
    setTodo((list) => list.map((t) => (t.id === item.id ? { ...t, fatto: nuovo } : t)));
    // Ricorda la spunta localmente: l'auto-refresh a 60s non la cancella più. (bug #7)
    spuntateLocaliRef.current.set(item.id, nuovo);
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
  const proposteVive = proposte.filter((p) => !propDecise.has(idProposta(p)) && !propDecisioni[idProposta(p)]).length;
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
            onClick={() => {
              setTab(t.id);
              // Timbra una voce di cronologia per la scheda (pushState, non più hash): il tasto
              // INDIETRO torna alla scheda precedente invece di saltare alla Plancia. (contratto nav)
              vaiSub("azioni", t.id);
            }}
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
                        <ParlaCasella titolo={`Mossa: ${m.titolo}`} contesto={[m.come && `Come: ${m.come}`, m.quando && `Quando: ${m.quando}`, m.ad_prepara && `L'AD prepara: ${m.ad_prepara}`].filter(Boolean).join(" · ")} />
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
            const ab = isPropostaSceltaAB(p);
            const config = ab ? normalizzaPropostaSceltaAB(p) : null;
            const sceltaId = config?.id;
            const pid = idProposta(p);
            const decPersistita = propDecisioni[pid];
            const decisa = propDecise.has(pid) || Boolean(decPersistita) || Boolean(ab && sceltaId && scelteDecisioni[sceltaId]?.scelta);
            const e = propEsito[pid];
            const decSalvata = sceltaId ? scelteDecisioni[sceltaId] : undefined;
            const sceltaRegistrata = decSalvata?.scelta;
            return (
              <div key={i} className={`card border ${BORDO[p.livello]} p-4 ${decisa ? "opacity-80" : ""}`}>
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${PALLINO[p.livello]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="t-sez leading-snug">{p.titolo}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                      <span className="badge badge-on">💡 dal giro</span>
                      {ab && <span className="badge bg-red-50 text-red-700">A / B</span>}
                      {ETICHETTA[p.livello] && <span className="t-eti">{ETICHETTA[p.livello]}</span>}
                    </div>
                    <p className="t-corpo mt-2">{p.motivo}</p>
                    {ab && config?.contesto && !decisa && (
                      <p className="t-eti mt-2 text-ink/75">{config.contesto}</p>
                    )}
                  </div>
                </div>
                {sceltaRegistrata && config && !e && (
                  <p className="t-eti mt-2 text-green-700">
                    ✅ Decisione {etichettaScelta(config, sceltaRegistrata)}
                  </p>
                )}
                {decPersistita && !e && !sceltaRegistrata && (
                  <p className={`t-eti mt-2 ${decPersistita.decisione === "approva" ? "text-green-700" : "text-ink/60"}`}>
                    {decPersistita.decisione === "approva"
                      ? `✅ Approvata${decPersistita.at ? " il " + quando(decPersistita.at) : ""} — il cervello la sta eseguendo (vedi Lavori).`
                      : `✕ Ignorata${decPersistita.at ? " il " + quando(decPersistita.at) : ""}.`}
                  </p>
                )}
                {e && <p className={`t-eti mt-2 ${e.ok ? "text-green-700" : "text-ink/70"}`}>{e.msg}</p>}
                {!decisa && ab && config && (
                  <div className="mt-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => decidiSceltaAB(i, p, "A")}
                      disabled={sceltaBusy || propBusy === pid}
                      className="inline-flex items-center justify-center gap-1.5 bg-green-600 text-white text-[13px] font-medium px-3.5 py-2 rounded-xl shadow-card hover:bg-green-700 active:scale-[0.98] transition disabled:opacity-50"
                    >
                      {propBusy === pid ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} A — {config.opzione_a}
                    </button>
                    <button
                      onClick={() => decidiSceltaAB(i, p, "B")}
                      disabled={sceltaBusy || propBusy === pid}
                      className="inline-flex items-center justify-center gap-1.5 text-[13px] font-medium px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 active:scale-[0.98] transition disabled:opacity-50"
                    >
                      <XCircle size={15} /> B — {config.opzione_b}
                    </button>
                  </div>
                )}
                {!decisa && !ab && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button onClick={() => approvaProposta(i, p)} disabled={propBusy === pid} className="inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3.5 py-2 rounded-xl shadow-card hover:bg-brand-dark active:scale-[0.98] transition disabled:opacity-50">
                      {propBusy === pid ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Approva
                    </button>
                    <button onClick={() => ignoraProposta(i, p)} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl border border-black/10 text-black/60 hover:bg-black/[0.04] active:scale-[0.98] transition">
                      <XCircle size={15} /> Ignora
                    </button>
                  </div>
                )}
                <ParlaCasella titolo={`Proposta: ${p.titolo}`} contesto={p.motivo} />
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
                    <ParlaCasella titolo={`Sentinella: ${al.titolo}`} contesto={[al.perche, al.cosaFare && `Cosa fare: ${al.cosaFare}`].filter(Boolean).join(" · ")} />
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
            <span>Quando approvi, l'azione parte dalle «mani»: invia <b>davvero</b> solo con la chiave e l'interruttore attivi; altrimenti la <b>simula</b> o resta <b>in coda</b>. <b>Mai invii per sbaglio.</b> <span className="text-ink/60">(L&apos;autopilota per le mosse sicure 🟢 ora è nella Plancia.)</span></span>
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
                          {/* testoPulito: via gli asterischi ** del markdown e l'emoji di livello iniziale (fix #3) */}
                          <div className="t-sez leading-snug">{testoPulito(a.titolo)}</div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                            <span className="badge badge-off" title={a.reparto}>{nomeReparto(a.reparto)}</span>
                            {ETICHETTA[a.livello] && <span className="t-eti">{ETICHETTA[a.livello]}</span>}
                            {a.fonte === "sentinella" && <span className="badge badge-on">🛡️ da sentinella</span>}
                            {a.qualita?.voto === "rivedere" && <span className="badge bg-amber-50 text-amber-700" title={a.qualita.problemi.join(" · ")}>⚠️ qualità: da rivedere</span>}
                            {a.qualita?.voto === "ok" && !decisa && <span className="badge bg-green-50 text-green-700">✅ qualità ok</span>}
                          </div>
                        </div>
                        {b && <span className={`badge shrink-0 ${b.cls}`}>{b.txt}</span>}
                      </div>

                      {/* Il "perché" come prosa leggibile. Se è solo un riferimento a un file
                          (es. "consegne/vendite/pitch.md (Parte C)") lo nascondiamo: è gergo — il
                          contenuto vero si apre con "Leggi il testo esatto" qui sotto. (fix #3) */}
                      {(() => {
                        const p = testoPulito(a.perche);
                        const soloRiferimento = /^(consegne|creativi)\/\S+(\s*\([^)]*\))?$/.test(p);
                        return p && !soloRiferimento ? <p className="t-corpo mt-2">{p}</p> : null;
                      })()}

                      {/* 🗣️ In parole semplici — cosa farà e come lo farà (fix #3): SEMPRE in vista,
                          non più nascosto in una tendina. È la risposta a "non capisco cosa farà". */}
                      {!decisa && (() => {
                        const righe = righeInParoleSemplici(a);
                        if (righe.length === 0) return null;
                        return (
                          <div className="mt-2.5 surface-muted p-3 space-y-1.5">
                            <div className="t-micro">🗣️ In parole semplici</div>
                            {righe.map((r) => (
                              <p key={r.etichetta} className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                <span className="mr-1">{r.ico}</span>
                                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{r.etichetta}:</span> {r.testo}
                              </p>
                            ))}
                          </div>
                        );
                      })()}

                      {a.qualita?.voto === "rivedere" && a.qualita.problemi.length > 0 && (
                        <div className="mt-2 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">⚠️ Da sistemare prima di inviare: {a.qualita.problemi.join(" · ")}</div>
                      )}

                      {/* 📄 Il testo VERO che verrà inviato (il percorso tecnico del file resta nascosto). */}
                      {path && (
                        <div className="mt-2.5">
                          <button onClick={() => apriScheda(a.id, path)} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline">
                            <FileText size={13} /> Leggi il testo esatto che verrà inviato
                          </button>
                          {sch?.loading && <p className="t-eti mt-1 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> apro il testo…</p>}
                          {sch?.err && <p className="t-eti mt-1 text-amber-700">Testo non disponibile ({sch.err}). Serve la memoria collegata.</p>}
                          {sch?.testo && (
                            <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12.5px] text-ink/85 leading-relaxed border-l-2 border-brand/30 pl-3 bg-paper/50 rounded-r-lg py-2 max-h-96 overflow-y-auto">{sch.testo}</pre>
                          )}
                        </div>
                      )}

                      {/* Anteprima breve (se il contenuto NON è un percorso ma testo vero) */}
                      {a.testo && !path && (
                        <div className="mt-2.5">
                          <button onClick={() => toggle(a.id)} className="t-eti hover:text-brand inline-flex items-center gap-1 transition">
                            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Leggi il testo esatto che verrà inviato
                          </button>
                          {open && <pre className="mt-1.5 whitespace-pre-wrap font-sans text-[12.5px] text-ink/85 leading-relaxed border-l-2 border-brand/20 pl-3 bg-paper/40 rounded-r-lg py-2">{a.testo}</pre>}
                        </div>
                      )}

                      {/* Riga minuta in fondo: da quando è pronta + da dove nasce (dettagli, non gergo in evidenza) */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        {a.preparato && <span className="t-eti">Pronta dal {a.preparato}</span>}
                        {(() => {
                          const o = risolviOrigine(a.origine);
                          if (o) {
                            return (
                              <button onClick={() => vaiArea(o.vista, o.anchor, o.sub)} className="inline-flex items-center gap-1 t-eti hover:text-brand transition">
                                <ArrowRight size={12} /> Da dove nasce: {o.etichetta}
                              </button>
                            );
                          }
                          return (
                            <button onClick={() => vaiArea("auto-coscienza", undefined, "analisi")} className="inline-flex items-center gap-1 t-eti hover:text-brand transition">
                              <ArrowRight size={12} /> Perché te la propongo
                            </button>
                          );
                        })()}
                      </div>

                      {decisa && a.esito && <p className="t-eti mt-2 text-ink/70">{a.esito}</p>}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {!decisa ? (
                          <>
                            <button onClick={() => decidi(a.id, "approva")} disabled={decidendo.has(a.id)} className="inline-flex items-center gap-1.5 bg-brand text-white text-[13px] font-medium px-3.5 py-2 rounded-xl shadow-card hover:bg-brand-dark active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100">
                              {decidendo.has(a.id) ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} {etichettaApprova(a.canale)}
                            </button>
                            <button onClick={() => decidi(a.id, "rifiuta")} disabled={decidendo.has(a.id)} className="inline-flex items-center gap-1.5 text-[13px] font-medium px-3 py-2 rounded-xl border border-black/10 text-black/60 hover:bg-black/[0.04] active:scale-[0.98] transition disabled:opacity-50 disabled:active:scale-100">
                              <XCircle size={15} /> Rifiuta
                            </button>
                          </>
                        ) : (
                          <button onClick={() => decidi(a.id, "annulla")} disabled={decidendo.has(a.id)} className="inline-flex items-center gap-1.5 t-eti hover:text-brand transition disabled:opacity-50"><RotateCcw size={13} /> annulla</button>
                        )}
                      </div>
                      <ParlaCasella titolo={`Azione: ${a.titolo}`} contesto={[a.perche, a.reparto && `Reparto: ${a.reparto}`, a.canale && `Canale: ${a.canale}`].filter(Boolean).join(" · ")} />
                    </div>
                  );
                })}
              </div>

              {!salvataggio && <p className="t-eti">⚠️ Le decisioni non si salvano ancora: collega la memoria (tabella «impostazioni») e resteranno anche dopo il refresh e su ogni dispositivo.</p>}
            </>
          )}
        </>
      )}

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
